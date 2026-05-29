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

  // Disparo Purchase para Utmify (uma vez), usando o kit do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("sb_kit");
      const kit = raw ? JSON.parse(raw) : null;
      const value = kit?.price ? kit.price / 100 : amount;
      const w = window as any;
      const payload = { currency: "BRL", value, event: "Purchase" };
      if (typeof w.utmify?.track === "function") w.utmify.track("Purchase", payload);
      if (typeof w.utmifyTrack === "function") w.utmifyTrack("Purchase", payload);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      orderId: hash,
      transactionId: hash,
      value: amount,
      currency: "BRL",
      status: "paid",
      products: [{ id: "kit-02-slim-belly", name: "KIT 02 Cinta Modeladora Cintura Alta", quantity: 1, price: amount }],
    };

    // Chaves independentes por pixel — assim, se um carregar atrasado,
    // ele ainda é disparado sem ser bloqueado pelos outros.
    const keys = {
      fb: `sb_purchase_fb_${hash}`,
      utmify: `sb_purchase_utmify_${hash}`,
      gads: `sb_purchase_gads_${hash}`,
      gtm: `sb_purchase_gtm_${hash}`,
    };

    // GTM dataLayer push (sem dependência de script externo)
    if (!sessionStorage.getItem(keys.gtm)) {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: "purchase", ecommerce: { transaction_id: hash, value: amount, currency: "BRL" } });
      sessionStorage.setItem(keys.gtm, "1");
    }
    window.dispatchEvent(new CustomEvent("purchase", { detail: payload }));

    let attempts = 0;
    const tryFire = () => {
      attempts++;
      const w = window as any;

      // Meta Pixel
      if (!sessionStorage.getItem(keys.fb) && typeof w.fbq === "function") {
        try {
          w.fbq("track", "Purchase", { value: amount, currency: "BRL", content_ids: ["kit-02-slim-belly"], content_type: "product", num_items: 1 });
          sessionStorage.setItem(keys.fb, "1");
        } catch (e) { console.error("[purchase][fb]", e); }
      }

      // Utmify
      if (!sessionStorage.getItem(keys.utmify)) {
        try {
          if (typeof w.utmify?.track === "function") { w.utmify.track("Purchase", payload); sessionStorage.setItem(keys.utmify, "1"); }
          else if (typeof w.utmifyTrack === "function") { w.utmifyTrack("Purchase", payload); sessionStorage.setItem(keys.utmify, "1"); }
          else if (typeof w.pixel?.track === "function") { w.pixel.track("Purchase", payload); sessionStorage.setItem(keys.utmify, "1"); }
        } catch (e) { console.error("[purchase][utmify]", e); }
      }

      // Google Ads (gtag) — conversão + purchase
      if (!sessionStorage.getItem(keys.gads) && typeof w.gtag === "function") {
        try {
          w.gtag("event", "conversion", {
            send_to: "AW-17951971754/316ACNHlmvgbEKqzlfBC",
            value: amount,
            currency: "BRL",
            transaction_id: hash,
          });
          w.gtag("event", "purchase", {
            send_to: "AW-17951971754",
            transaction_id: hash,
            value: amount,
            currency: "BRL",
            items: [{ item_id: "kit-02-slim-belly", item_name: "KIT 02 Cinta Modeladora Cintura Alta", quantity: 1, price: amount }],
          });
          sessionStorage.setItem(keys.gads, "1");
          console.info("[purchase][gads] conversion fired", { transaction_id: hash, value: amount });
        } catch (e) { console.error("[purchase][gads]", e); }
      }

      const allDone =
        sessionStorage.getItem(keys.fb) &&
        sessionStorage.getItem(keys.utmify) &&
        sessionStorage.getItem(keys.gads);
      return Boolean(allDone);
    };

    if (tryFire()) return;
    const iv = setInterval(() => {
      if (tryFire() || attempts >= 40) clearInterval(iv);
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
        Confia Shop LTDA
      </footer>
    </div>
  );
}
