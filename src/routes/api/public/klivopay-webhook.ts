import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/klivopay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        // Verificação de assinatura (opcional, ativada se KLIVOPAY_WEBHOOK_SECRET existir)
        const secret = process.env.KLIVOPAY_WEBHOOK_SECRET;
        if (secret) {
          const sig =
            request.headers.get("x-klivo-signature") ||
            request.headers.get("x-webhook-signature") ||
            request.headers.get("x-signature") ||
            "";
          const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
          const sigBuf = Buffer.from(sig);
          const expBuf = Buffer.from(expected);
          const ok =
            sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
          if (!ok) {
            console.warn("[klivopay-webhook] assinatura inválida");
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let payload: any = {};
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event =
          payload?.event || payload?.type || payload?.status || "unknown";
        const hash =
          payload?.hash ||
          payload?.transaction_hash ||
          payload?.data?.hash ||
          payload?.transaction?.hash;
        const status =
          payload?.status ||
          payload?.data?.status ||
          payload?.transaction?.status;
        const amount =
          payload?.amount || payload?.data?.amount || payload?.transaction?.amount;
        const paymentMethod =
          payload?.payment_method ||
          payload?.data?.payment_method ||
          payload?.transaction?.payment_method;

        console.log("[klivopay-webhook] evento recebido:", {
          event,
          status,
          hash,
          amount,
          paymentMethod,
        });

        // PIX pago — gancho para ações futuras (envio de e-mail, liberação, etc.)
        const isPaid =
          status === "paid" ||
          status === "approved" ||
          status === "completed" ||
          event === "transaction.paid" ||
          event === "pix.paid";

        const customer = payload?.customer || payload?.data?.customer || payload?.transaction?.customer || {};
        const numAmount = Number(amount || 0);
        const amountCents = numAmount > 1000 ? Math.round(numAmount) : Math.round((numAmount || 0) * 100);

        // Filtro: só salvar pedidos da Cinta Slim Belly (ignorar webhooks de outros produtos KlivoPay)
        const items = payload?.items || payload?.data?.items || payload?.transaction?.items || [];
        const itemTitles = Array.isArray(items)
          ? items.map((it: any) => String(it?.title || it?.name || "").toLowerCase()).join(" | ")
          : "";
        const titleMatches = /cinta|slim|belly|confia/.test(itemTitles);
        const amountAllowed = [5990, 7990, 6987, 8987].includes(amountCents);
        if (!titleMatches && !amountAllowed) {
          console.warn("[klivopay-webhook] pedido ignorado (não é da ConfiaShop):", {
            hash,
            amountCents,
            itemTitles,
          });
          return Response.json({ received: true, ignored: true });
        }

        const dbStatus = isPaid
          ? "paid"
          : status === "refused" || status === "refunded" || status === "chargedback"
          ? String(status)
          : "waiting_payment";

        try {
          const { error: dbErr } = await supabaseAdmin
            .from("sales")
            .upsert(
              {
                transaction_hash: hash ? String(hash) : `evt_${Date.now()}`,
                status: dbStatus,
                payment_method: paymentMethod ? String(paymentMethod) : "pix",
                amount_cents: amountCents,
                customer_name: customer?.name ?? null,
                customer_email: customer?.email ?? null,
                customer_phone: customer?.phone ?? customer?.phone_number ?? null,
                customer_document: customer?.document ?? customer?.cpf ?? null,
                raw_payload: payload,
                paid_at: isPaid ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "transaction_hash" },
            );
          if (dbErr) console.error("[klivopay-webhook] erro ao salvar venda:", dbErr);
        } catch (e) {
          console.error("[klivopay-webhook] exceção ao salvar venda:", e);
        }

        if (isPaid) {
          console.log("[klivopay-webhook] Pagamento confirmado:", hash);
          await Promise.all([
            sendUtmifyOrder({ payload, hash, amount, paymentMethod, status: "paid" }),
            sendMetaPurchase({ payload, hash, amountCents }),
          ]);
        } else if (status === "waiting_payment" || status === "pending" || event === "pix.generated") {
          await sendUtmifyOrder({ payload, hash, amount, paymentMethod, status: "waiting_payment" });
        }

        return Response.json({ received: true });
      },
      GET: async () => Response.json({ ok: true }),
    },
  },
});

type UtmifyArgs = {
  payload: any;
  hash: string;
  amount: number;
  paymentMethod?: string;
  status: "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";
};

async function sendUtmifyOrder({ payload, hash, amount, paymentMethod, status }: UtmifyArgs) {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) {
    console.warn("[utmify] UTMIFY_API_TOKEN ausente — pulando envio");
    return;
  }
  try {
    const customer = payload?.customer || payload?.data?.customer || payload?.transaction?.customer || {};
    const utms = payload?.tracking || payload?.utm || payload?.data?.utm || {};
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    // Klivopay normalmente envia em centavos; se já vier <= 1000, assume reais
    const numAmount = Number(amount || 0);
    const finalAmount = numAmount > 1000 ? Math.round(numAmount) : Math.round((numAmount || 79.9) * 100);

    const body = {
      orderId: String(hash || `order_${Date.now()}`),
      platform: "ConfiaShop",
      paymentMethod: paymentMethod === "pix" ? "pix" : (paymentMethod || "pix"),
      status,
      createdAt: now,
      approvedDate: status === "paid" ? now : null,
      refundedAt: null,
      customer: {
        name: customer?.name || "Cliente",
        email: customer?.email || "cliente@confia-shop.com",
        phone: customer?.phone || customer?.phone_number || null,
        document: customer?.document || customer?.cpf || null,
        country: "BR",
        ip:
          customer?.ip ||
          payload?.metadata?.client_ip ||
          payload?.data?.metadata?.client_ip ||
          payload?.transaction?.metadata?.client_ip ||
          payload?.ip ||
          "0.0.0.0",
      },
      products: [
        {
          id: "kit-02-slim-belly",
          name: "KIT 02 Cinta Modeladora Cintura Alta",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: finalAmount,
        },
      ],
      trackingParameters: {
        src: utms?.src || null,
        sck: utms?.sck || null,
        utm_source: utms?.utm_source || null,
        utm_campaign: utms?.utm_campaign || null,
        utm_medium: utms?.utm_medium || null,
        utm_content: utms?.utm_content || null,
        utm_term: utms?.utm_term || null,
      },
      commission: {
        totalPriceInCents: finalAmount,
        gatewayFeeInCents: 0,
        userCommissionInCents: finalAmount,
      },
      isTest: false,
    };

    const res = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": token,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log("[utmify] status=", res.status, "resp=", text.substring(0, 300));
  } catch (e) {
    console.error("[utmify] erro ao enviar pedido", e);
  }
}

// ============================================================
// Meta Conversions API (server-side Purchase)
// ============================================================
const FB_PIXEL_ID = "1503415234565345";

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendMetaPurchase({
  payload,
  hash,
  amountCents,
}: {
  payload: any;
  hash: string;
  amountCents: number;
}) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[meta-capi] META_CAPI_ACCESS_TOKEN ausente — pulando envio");
    return;
  }
  try {
    const customer =
      payload?.customer ||
      payload?.data?.customer ||
      payload?.transaction?.customer ||
      {};
    const clientIp =
      customer?.ip ||
      payload?.metadata?.client_ip ||
      payload?.data?.metadata?.client_ip ||
      null;
    const valueBRL = amountCents / 100;
    const eventId = String(hash || `evt_${Date.now()}`);

    const [emailHash, phoneHash, fnHash, docHash] = await Promise.all([
      customer?.email ? sha256Hex(String(customer.email)) : Promise.resolve(undefined),
      customer?.phone || customer?.phone_number
        ? sha256Hex(String(customer.phone || customer.phone_number).replace(/\D/g, ""))
        : Promise.resolve(undefined),
      customer?.name ? sha256Hex(String(customer.name).split(" ")[0]) : Promise.resolve(undefined),
      customer?.document || customer?.cpf
        ? sha256Hex(String(customer.document || customer.cpf).replace(/\D/g, ""))
        : Promise.resolve(undefined),
    ]);

    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: "https://confia-shop.com/pagamento-confirmado",
          user_data: {
            em: emailHash ? [emailHash] : undefined,
            ph: phoneHash ? [phoneHash] : undefined,
            fn: fnHash ? [fnHash] : undefined,
            external_id: docHash ? [docHash] : undefined,
            client_ip_address: clientIp || undefined,
            country: ["62cf61b8a87dc8951b50f7c0aabe92dcd2c84ad9b95eef74b7fad1d10ff09f8a"], // sha256("br")
          },
          custom_data: {
            currency: "BRL",
            value: valueBRL,
            content_ids: ["kit-02-slim-belly"],
            content_type: "product",
            num_items: 1,
            order_id: eventId,
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log("[meta-capi] status=", res.status, "resp=", text.substring(0, 400));
  } catch (e) {
    console.error("[meta-capi] erro ao enviar Purchase", e);
  }
}
