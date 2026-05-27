import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminLogin, adminListSales } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Vendas" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

type Sale = {
  id: string;
  transaction_hash: string | null;
  status: string;
  payment_method: string | null;
  amount_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_document: string | null;
  paid_at: string | null;
  created_at: string;
};

const STORAGE_KEY = "admin_pw";
const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

function AdminPage() {
  const login = useServerFn(adminLogin);
  const list = useServerFn(adminListSales);

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [totals, setTotals] = useState({ total: 0, paid: 0, pending: 0, revenueCents: 0 });
  const [filter, setFilter] = useState<"all" | "paid" | "waiting_payment">("all");

  async function load(pw: string) {
    setLoading(true);
    setError("");
    try {
      const res = await list({ data: { password: pw } });
      setSales(res.sales as Sale[]);
      setTotals(res.totals);
      setAuthed(true);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar");
      setAuthed(false);
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      setPassword(saved);
      load(saved);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ data: { password } });
      sessionStorage.setItem(STORAGE_KEY, password);
      await load(password);
    } catch (e: any) {
      setError(e?.message || "Senha inválida");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPassword("");
    setSales([]);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: "#1e293b", padding: 32, borderRadius: 12, width: 360, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
          <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22 }}>Admin</h1>
          <p style={{ margin: 0, marginBottom: 20, color: "#94a3b8", fontSize: 14 }}>Entre com a senha para acessar as vendas.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            autoFocus
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#fff", fontSize: 15, marginBottom: 12, boxSizing: "border-box" }}
          />
          {error && <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 8, border: 0, background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  const filtered = filter === "all" ? sales : sales.filter((s) => s.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, color: "#0f172a" }}>Vendas</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => load(password)} disabled={loading} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 14 }}>
              {loading ? "..." : "Atualizar"}
            </button>
            <button onClick={logout} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 14 }}>Sair</button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
          <Card label="Total de pedidos" value={String(totals.total)} />
          <Card label="Pagos" value={String(totals.paid)} accent="#16a34a" />
          <Card label="Aguardando pix" value={String(totals.pending)} accent="#ca8a04" />
          <Card label="Receita (pagos)" value={brl(totals.revenueCents)} accent="#0ea5e9" />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[
            { k: "all", label: "Todos" },
            { k: "paid", label: "Pagos" },
            { k: "waiting_payment", label: "Aguardando" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k as any)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid #cbd5e1",
                background: filter === f.k ? "#0f172a" : "#fff",
                color: filter === f.k ? "#fff" : "#0f172a",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 10, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "#f1f5f9", textAlign: "left" }}>
              <tr>
                <Th>Data</Th>
                <Th>Cliente</Th>
                <Th>Contato</Th>
                <Th>CPF</Th>
                <Th>Valor</Th>
                <Th>Método</Th>
                <Th>Status</Th>
                <Th>Pago em</Th>
                <Th>Hash</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Nenhuma venda encontrada.</td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <Td>{fmtDate(s.created_at)}</Td>
                  <Td>{s.customer_name || "—"}</Td>
                  <Td>
                    <div>{s.customer_email || "—"}</div>
                    <div style={{ color: "#64748b" }}>{s.customer_phone || ""}</div>
                  </Td>
                  <Td>{s.customer_document || "—"}</Td>
                  <Td style={{ fontWeight: 600 }}>{brl(s.amount_cents)}</Td>
                  <Td>{(s.payment_method || "").toUpperCase()}</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>{fmtDate(s.paid_at)}</Td>
                  <Td style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>{s.transaction_hash?.slice(0, 16) || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || "#0f172a" }}>{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.3 }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "10px 12px", color: "#0f172a", ...style }}>{children}</td>;
}
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    paid: { bg: "#dcfce7", fg: "#166534", label: "Pago" },
    waiting_payment: { bg: "#fef3c7", fg: "#92400e", label: "Aguardando" },
    refused: { bg: "#fee2e2", fg: "#991b1b", label: "Recusado" },
    refunded: { bg: "#e0e7ff", fg: "#3730a3", label: "Estornado" },
    chargedback: { bg: "#fee2e2", fg: "#991b1b", label: "Chargeback" },
  };
  const s = map[status] || { bg: "#e2e8f0", fg: "#334155", label: status };
  return <span style={{ background: s.bg, color: s.fg, padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}
