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

export const createPixTransaction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.KLIVOPAY_API_TOKEN;
    const offerHash = "3ob4wuqw4p";

    if (!token) {
      return { ok: false as const, error: "KLIVOPAY_API_TOKEN não configurado" };
    }

    try {
      const res = await fetch("https://api.klivopay.com.br/api/public/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_token: token,
          amount: data.amount,
          offer_hash: offerHash,
          payment_method: "pix",
          customer: data.customer,
          cart: data.cart,
        }),
      });

      const json: any = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        console.error("KlivoPAY error:", res.status, json);
        return {
          ok: false as const,
          error: json?.message || `Falha ao criar transação (${res.status})`,
        };
      }

      const d = json.data || {};
      return {
        ok: true as const,
        hash: d.hash as string,
        pix_qr_code: (d.pix_qr_code || d.pix_copy_paste) as string,
        pix_copy_paste: (d.pix_copy_paste || d.pix_qr_code) as string,
        expires_at: d.expires_at as string | undefined,
        amount: d.amount as number,
      };
    } catch (err: any) {
      console.error("KlivoPAY request failed:", err);
      return { ok: false as const, error: "Serviço de pagamento indisponível" };
    }
  });
