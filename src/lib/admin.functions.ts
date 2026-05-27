import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD não configurada");
  if (!password || password !== expected) throw new Error("Senha inválida");
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    return { ok: true };
  });

export const adminListSales = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("sales")
      .select(
        "id, transaction_hash, status, payment_method, amount_cents, customer_name, customer_email, customer_phone, customer_document, paid_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const totals = (rows || []).reduce(
      (acc, r) => {
        acc.total += 1;
        if (r.status === "paid") {
          acc.paid += 1;
          acc.revenueCents += r.amount_cents || 0;
        } else if (r.status === "waiting_payment") {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0, revenueCents: 0 },
    );

    return { sales: rows || [], totals };
  });
