import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  amount: z.number().int().positive(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone_number: z.string().min(10),
    document: z.string().min(11),
  }),
  cart: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().positive(),
        unit_price: z.number().int().positive(),
      }),
    )
    .optional(),
  tracking: z.record(z.string(), z.string()).optional(),
});

const PRODUCT_HASH = "pz2q1dqx2h";
const OFFER_HASH = "3ob4wuqw4p";

export const createPixTransaction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.KLIVOPAY_API_TOKEN;
    if (!token) {
      return { ok: false as const, error: "KLIVOPAY_API_TOKEN não configurado" };
    }

    const items = (
      data.cart && data.cart.length > 0
        ? data.cart
        : [{ name: "Pedido", quantity: 1, unit_price: data.amount }]
    ).map((it) => ({
      product_hash: PRODUCT_HASH,
      title: it.name,
      name: it.name,
      quantity: it.quantity,
      price: it.unit_price,
      unit_price: it.unit_price,
      operation_type: 1,
    }));

    // Captura IP real do cliente para enviar à Utmify depois
    const clientIp =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      getRequestHeader("x-real-ip") ||
      null;

    try {
      const res = await fetch("https://api.klivopay.com.br/api/public/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_token: token,
          amount: data.amount,
          offer_hash: OFFER_HASH,
          payment_method: "pix",
          operation_type: 1,
          customer: { ...data.customer, ip: clientIp ?? undefined },
          cart: items,
          metadata: { client_ip: clientIp, ...(data.tracking ?? {}) },
          tracking: data.tracking ?? {},
        }),
      });

      const json: any = await res.json().catch(() => ({}));
      const pixCode: string | undefined =
        json?.pix?.pix_qr_code || json?.data?.pix_qr_code || json?.data?.pix_copy_paste;

      if (!res.ok || json?.success === false || !pixCode) {
        console.error("KlivoPAY error:", res.status, JSON.stringify(json));
        return {
          ok: false as const,
          error: json?.message || `Falha ao criar transação (${res.status})`,
        };
      }

      const hash = (json.hash || json?.data?.hash) as string;
      if (hash) {
        const checkoutPayload = {
          source: "checkout",
          checkout_tracking: data.tracking ?? {},
          tracking: data.tracking ?? {},
          metadata: { client_ip: clientIp, ...(data.tracking ?? {}) },
          customer: { ...data.customer, ip: clientIp ?? undefined },
          cart: items,
          klivopay_response: json,
        };
        const { error: saleErr } = await supabaseAdmin.from("sales").upsert(
          {
            transaction_hash: hash,
            status: "waiting_payment",
            payment_method: "pix",
            amount_cents: data.amount,
            customer_name: data.customer.name,
            customer_email: data.customer.email,
            customer_phone: data.customer.phone_number,
            customer_document: data.customer.document,
            raw_payload: checkoutPayload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "transaction_hash" },
        );
        if (saleErr) console.error("[checkout] erro ao registrar venda inicial:", saleErr);
      }

      return {
        ok: true as const,
        hash,
        pix_qr_code: pixCode,
        pix_copy_paste: pixCode,
        qr_code_base64: (json?.pix?.qr_code_base64 || null) as string | null,
        expires_at: (json?.expires_at || json?.data?.expires_at) as string | undefined,
        amount: (json.amount || json?.data?.amount) as number,
      };
    } catch (err: any) {
      console.error("KlivoPAY request failed:", err);
      return { ok: false as const, error: "Serviço de pagamento indisponível" };
    }
  });
