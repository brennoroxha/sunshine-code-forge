import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
      })
    )
    .optional(),
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

    const items = (data.cart && data.cart.length > 0 ? data.cart : [
      { name: "Pedido", quantity: 1, unit_price: data.amount },
    ]).map((it) => ({
      product_hash: PRODUCT_HASH,
      title: it.name,
      name: it.name,
      quantity: it.quantity,
      price: it.unit_price,
      unit_price: it.unit_price,
      operation_type: 1,
    }));

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
          customer: data.customer,
          cart: items,
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

      return {
        ok: true as const,
        hash: (json.hash || json?.data?.hash) as string,
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
