import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

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

        if (isPaid && paymentMethod === "pix") {
          console.log("[klivopay-webhook] PIX confirmado:", hash);
          // TODO: persistir status / disparar e-mail quando necessário
        }

        return Response.json({ received: true });
      },
      GET: async () => Response.json({ ok: true }),
    },
  },
});
