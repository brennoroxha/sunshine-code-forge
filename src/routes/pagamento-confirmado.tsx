import { createFileRoute, Link } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle, Package, Truck, ArrowLeft, Home, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/pagamento-confirmado")({
  component: PagamentoConfirmadoPage,
  head: () => ({
    meta: [
      { title: "Pagamento Confirmado \u2014 ConfiaShop" },
      { name: "description", content: "Seu pagamento foi confirmado com sucesso! Agradecemos pela compra." },
      { property: "og:title", content: "Pagamento Confirmado \u2014 ConfiaShop" },
      { property: "og:description", content: "Seu pagamento foi confirmado com sucesso!" },
    ],
  }),
});

function PagamentoConfirmadoPage() {
  const search = useSearch({ from: "/pagamento-confirmado" }) as Record<string, string>;
  const hash = search.hash || "620359715";
  const amount = Number(search.amount) || 79.9;
  const waText = encodeURIComponent(`Olá! Acabei de fazer meu pedido #${hash} e gostaria de acompanhar o status.`);
  const waHref = `https://wa.me/5511999999999?text=${waText}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `sb_purchase_fired_${hash}`;
    if (sessionStorage.getItem(key)) return;

    const payload = {
      orderId: hash,
      transactionId: hash,
      value: amount,
      currency: "BRL",
      status: "paid",
      products: [{ id: "kit-02-slim-belly", name: "KIT 02 Cinta Modeladora Cintura Alta", quantity: 1, price: amount }],
    };

    let attempts = 0;
    const fire = () => {
      attempts++;
      const w = window as any;
      let fired = false;
      try {
        // Meta Pixel (base code garantido no __root)
        if (typeof w.fbq === "function") {
          w.fbq("track", "Purchase", { value: amount, currency: "BRL", content_ids: ["kit-02-slim-belly"], content_type: "product", num_items: 1 });
          fired = true;
        }
        // Utmify pixel
        if (typeof w.utmify?.track === "function") { w.utmify.track("Purchase", payload); fired = true; }
        if (typeof w.utmifyTrack === "function") { w.utmifyTrack("Purchase", payload); fired = true; }
        if (typeof w.pixel?.track === "function") { w.pixel.track("Purchase", payload); fired = true; }
        // GTM dataLayer
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "purchase", ecommerce: { transaction_id: hash, value: amount, currency: "BRL" } });
        // Custom event
        window.dispatchEvent(new CustomEvent("purchase", { detail: payload }));
      } catch (e) {
        console.error("[purchase] tracking error", e);
      }
      if (fired) {
        sessionStorage.setItem(key, "1");
        return true;
      }
      return false;
    };

    if (fire()) return;
    const iv = setInterval(() => {
      if (fire() || attempts >= 20) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [hash, amount]);

  return (
    <div className="sb-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header minimal */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--sb-border)", padding: "14px 20px" }}>
        <div className="sb-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <img src={logo} alt="ConfiaShop" style={{ height: 32 }} />
          </Link>
        </div>
      </header>

      {/* Hero Success */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px 60px" }}>
        <div
          className="sb-success-card"
          style={{
            maxWidth: 520,
            width: "100%",
            background: "#fff",
            borderRadius: 20,
            padding: "40px 28px",
            textAlign: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            border: "1px solid var(--sb-border)",
          }}
        >
          {/* Animated check */}
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "sb-pop-in 0.5s ease-out",
            }}
          >
            <CheckCircle size={42} color="#fff" strokeWidth={2.5} />
          </div>

          <h1
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "var(--sb-text)",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Pagamento Recebido!
          </h1>

          <p style={{ fontSize: 15, color: "var(--sb-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            Seu pagamento foi confirmado com sucesso.
            <br />
            Agradecemos pela compra e confiança!
          </p>

          {/* Order details */}
          <div
            style={{
              background: "#f8f6f3",
              borderRadius: 14,
              padding: "20px 18px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--sb-muted)", fontWeight: 500 }}>N\u00famero do pedido</span>
              <strong style={{ fontSize: 18, color: "var(--sb-text)", letterSpacing: 0.5, fontFamily: "Inter, system-ui, sans-serif" }}>
                #{hash}
              </strong>
            </div>

            <div style={{ borderTop: "1px dashed #ddd", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--sb-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Package size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--sb-text)" }}>KIT 02 Cinta Modeladora Cintura Alta</div>
                  <div style={{ fontSize: 12, color: "var(--sb-muted)" }}>Slim Belly \u2014 Qtd: 1</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Truck size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--sb-text)" }}>Frete Gr\u00e1tis</div>
                  <div style={{ fontSize: 12, color: "var(--sb-muted)" }}>Entrega em 4 a 5 dias \u00fateis</div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              background: "#25d366",
              color: "#fff",
              borderRadius: 12,
              padding: "14px 20px",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              marginBottom: 12,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <MessageCircle size={20} />
            Acompanhar pedido no WhatsApp
          </a>

          {/* Back to home */}
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              background: "var(--sb-cta)",
              color: "#fff",
              borderRadius: 12,
              padding: "14px 20px",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <Home size={18} />
            Voltar para a loja
          </Link>

          <p style={{ marginTop: 18, fontSize: 13, color: "var(--sb-muted)" }}>
            Um e-mail com os detalhes do seu pedido foi enviado para voc\u00ea.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "var(--sb-dark)", color: "#aaa", padding: "20px", textAlign: "center", fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 600 }}>
            <ArrowLeft size={14} /> Voltar para a p\u00e1gina inicial
          </Link>
        </div>
        Confia Shop LTDA \u00b7 CNPJ 64.119.790/0001-01
      </footer>
    </div>
  );
}
