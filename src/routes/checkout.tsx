import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck,
  Lock,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Truck,
  Tag,
  User,
  QrCode,
  CheckCircle2,
  Star,
  Calculator,
  ArrowDown,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { createPixTransaction } from "@/lib/klivopay.functions";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (search: Record<string, unknown>) => ({
    kit: search.kit === "1" || search.kit === 1 ? 1 : 2,
  }),
  head: () => ({ meta: [{ title: "Checkout — ConfiaShop" }] }),
});

const KIT_OPTIONS: Record<
  number,
  { id: number; label: string; title: string; price: number; priceLabel: string }
> = {
  1: { id: 1, label: "1 Cinta", title: "1 Cinta", price: 5990, priceLabel: "R$ 59,90" },
  2: { id: 2, label: "KIT 2", title: "2 Cintas", price: 7990, priceLabel: "R$ 79,90" },
};

const TOTAL = 7990;
const PIX_KEY = "64119790000101";
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "src",
  "sck",
];

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function maskCEP(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
      [a && `(${a})`, b && ` ${b}`, c && `-${c}`].filter(Boolean).join(""),
    );
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
}

function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Validadores
function isValidCPF(v: string) {
  const c = onlyDigits(v);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let d1 = 11 - (s % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  let d2 = 11 - (s % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10]);
}

function isValidPhone(v: string) {
  const d = onlyDigits(v);
  if (d.length < 10 || d.length > 11) return false;
  const ddd = parseInt(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}

function isValidCEP(v: string) {
  return onlyDigits(v).length === 8;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function makePixPayload(amountCents: number) {
  const amount = (amountCents / 100).toFixed(2);
  return `00020126360014BR.GOV.BCB.PIX0114${PIX_KEY}5204000053039865406${amount}5802BR5910ConfiaShop6009SAO PAULO62070503***6304ABCD`;
}

type Step = 1 | 2 | 3 | "loading" | "pix";

function CheckoutPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    email: "",
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    cep: "",
    endereco: "",
    bairro: "",
    numero: "",
    cidade: "",
    estado: "SP",
  });
  const [frete, setFrete] = useState<"transportadora" | "full">("transportadora");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [expira, setExpira] = useState(15 * 60);
  const [pixData, setPixData] = useState<{
    hash: string;
    pix_copy_paste: string;
    pix_qr_code: string;
  } | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [utms, setUtms] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  // Kit é derivado diretamente da URL (?kit=1 ou ?kit=2) — sem flash de kit 2
  const search = Route.useSearch();
  const kit = KIT_OPTIONS[search.kit] ?? KIT_OPTIONS[2];
  useEffect(() => {
    try {
      localStorage.setItem("sb_kit", JSON.stringify(kit));
    } catch {}
  }, [kit.id]);

  // Captura UTMs da URL ao montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const collected: Record<string, string> = {};
      TRACKING_KEYS.forEach((k) => {
        const v = sp.get(k);
        if (v) collected[k] = v;
      });
      if (!collected.sck) {
        const clickId =
          collected.src ||
          collected.utm_campaign ||
          `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        collected.sck = clickId;
      }
      // Persiste para sobreviver entre navegações
      const stored = localStorage.getItem("sb_utms");
      const merged = { ...(stored ? JSON.parse(stored) : {}), ...collected };
      if (Object.keys(merged).length) {
        setUtms(merged);
        localStorage.setItem("sb_utms", JSON.stringify(merged));
      }
    } catch {}
  }, []);

  // Recupera cores e tamanhos selecionados do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const c = localStorage.getItem("sb_color_names");
      const s = localStorage.getItem("sb_size_names");
      if (c) setSelectedColors(JSON.parse(c));
      if (s) setSelectedSizes(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    // Dispara InitiateCheckout (Meta Pixel + Utmify + dataLayer)
    if (typeof window === "undefined") return;
    const key = "sb_ic_fired";
    if (sessionStorage.getItem(key)) return;
    const loadedKit = kit;
    const value = (loadedKit.price || 7990) / 100;
    const payload = {
      value,
      currency: "BRL",
      content_ids: [`kit-0${loadedKit.id}-slim-belly`],
      content_type: "product",
      num_items: loadedKit.id,
      contents: [
        { id: `kit-0${loadedKit.id}-slim-belly`, quantity: loadedKit.id, item_price: value },
      ],
    };
    let attempts = 0;
    const fire = () => {
      attempts++;
      const w = window as any;
      let fired = false;
      try {
        if (typeof w.fbq === "function") {
          w.fbq("track", "InitiateCheckout", payload);
          fired = true;
        }
        if (typeof w.utmify?.track === "function") {
          w.utmify.track("InitiateCheckout", payload);
        }
        if (typeof w.utmifyTrack === "function") {
          w.utmifyTrack("InitiateCheckout", payload);
        }
        if (typeof w.pixel?.track === "function") {
          w.pixel.track("InitiateCheckout", payload);
        }
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: "begin_checkout",
          ecommerce: { value, currency: "BRL", items: payload.contents },
        });
        if (typeof w.gtag === "function") {
          w.gtag("event", "begin_checkout", {
            currency: "BRL",
            value,
            items: [
              {
                item_id: `kit-0${loadedKit.id}-slim-belly`,
                item_name: "Cinta Slim Belly",
                quantity: loadedKit.id,
                price: value,
              },
            ],
          });
          fired = true;
        }
      } catch (e) {
        console.error("[InitiateCheckout] tracking error", e);
      }
      if (fired) sessionStorage.setItem(key, "1");
      return fired;
    };
    if (fire()) return;
    const iv = setInterval(() => {
      if (fire() || attempts >= 20) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, []);
  const createPix = useServerFn(createPixTransaction);

  useEffect(() => {
    if (step !== "pix") return;
    const t = setInterval(() => setExpira((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const upd =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let v = e.target.value;
      if (k === "cep") v = maskCEP(v);
      if (k === "telefone") v = maskPhone(v);
      if (k === "cpf") v = maskCPF(v);
      setForm((p) => ({ ...p, [k]: v }));
      setErrors((p) => ({ ...p, [k]: "" }));
    };

  useEffect(() => {
    const d = onlyDigits(form.cep);
    if (d.length !== 8) return;
    fetch(`https://viacep.com.br/ws/${d}/json/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) return;
        setForm((p) => ({
          ...p,
          endereco: data.logradouro || p.endereco,
          bairro: data.bairro || p.bairro,
          cidade: data.localidade || p.cidade,
          estado: data.uf || p.estado,
        }));
      })
      .catch(() => {});
  }, [form.cep]);

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!isValidEmail(form.email)) e.email = "E-mail inválido";
      if (form.nomeCompleto.trim().split(/\s+/).length < 2)
        e.nomeCompleto = "Informe nome e sobrenome";
      if (!isValidCPF(form.cpf)) e.cpf = "CPF inválido";
      if (!isValidPhone(form.telefone)) e.telefone = "Telefone inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step !== "pix" && step !== "loading" && !validateStep(step as Step)) return;
    if (step === 1) setStep(3);
    else if (step === 3) {
      setStep("loading");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (step !== "loading") return;
    let canceled = false;
    setPixError(null);
    (async () => {
      try {
        const cartName =
          kit.id === 1 ? "1x Cinta Modeladora Slim Belly" : "KIT 2x Cinta Modeladora Slim Belly";
        const res = await createPix({
          data: {
            amount: totalComFrete,
            customer: {
              name: form.nomeCompleto.trim(),
              email: form.email.trim(),
              phone_number: onlyDigits(form.telefone),
              document: onlyDigits(form.cpf),
            },
            cart: [{ name: cartName, quantity: 1, unit_price: totalComFrete }],
            tracking: utms,
          },
        });
        if (canceled) return;
        if (!res.ok) {
          setPixError(res.error);
          setStep(3);
          return;
        }
        setPixData({
          hash: res.hash,
          pix_copy_paste: res.pix_copy_paste,
          pix_qr_code: res.pix_qr_code,
        });
        setExpira(15 * 60);
        setStep("pix");
      } catch (e: any) {
        if (canceled) return;
        setPixError("Falha ao gerar Pix. Tente novamente.");
        setStep(3);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [step]);

  const back = () => {
    if (step === 3) setStep(1);
    else if (step === "pix") setStep(3);
  };

  const isStepValid = (s: Step): boolean => {
    if (s === 1) {
      return (
        isValidEmail(form.email) &&
        form.nomeCompleto.trim().split(/\s+/).length >= 2 &&
        isValidCPF(form.cpf) &&
        isValidPhone(form.telefone)
      );
    }
    return true;
  };
  const canAdvance = step !== "pix" && isStepValid(step as Step);

  const freteCost = frete === "full" ? 997 : 0;
  const totalComFrete = kit.price + freteCost;
  const pixPayload = pixData?.pix_copy_paste || makePixPayload(totalComFrete);
  const qrUrl = pixData?.pix_qr_code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixData.pix_qr_code)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixPayload)}`;
  const mm = String(Math.floor(expira / 60)).padStart(2, "0");
  const ss = String(expira % 60).padStart(2, "0");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const stepNum: number = step === 1 ? 1 : 2;
  const steps = [
    { n: 1, label: "Dados Pessoais", Icon: User },
    { n: 2, label: "Pagamento", Icon: QrCode },
  ];

  const fieldErr = (k: string) => errors[k] && <div className="ck-err">{errors[k]}</div>;
  const inputCls = (k: string) => `ck-input${errors[k] ? " ck-input-err" : ""}`;

  return (
    <div className="ck-root">
      <header className="ck-header">
        <div className="ck-header-inner">
          <Link to="/" className="ck-logo">
            <img src={logo} alt="ConfiaShop" />
          </Link>
          <div className="ck-secure">
            <Lock size={18} />
            <div className="ck-secure-text">
              <strong>PAGAMENTO</strong>
              <span>100% SEGURO</span>
            </div>
          </div>
        </div>
      </header>

      <main className="ck-main">
        {/* Stepper fora do card */}
        <div className="ck-stepper">
          {steps.map((s, i) => (
            <div key={s.n} className="ck-step-wrap">
              <div
                className={`ck-step ${stepNum >= s.n ? "is-on" : ""} ${stepNum === s.n && step !== "pix" ? "is-active" : ""}`}
              >
                <div className="ck-step-num">
                  <s.Icon size={16} />
                </div>
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`ck-step-line ${stepNum > s.n ? "is-on" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {step === 3 && (
          <div className="ck-card" style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <h2
                className="ck-h2"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}
              >
                <User size={20} color="#0b2447" /> Dados pessoais
              </h2>
              <button type="button" className="ck-info-summary-link" onClick={() => setStep(1)}>
                Não é você? Sair
              </button>
            </div>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#374151" }}>{form.email}</p>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#374151" }}>
              <strong style={{ color: "#111" }}>Nome:</strong> {form.nomeCompleto}
            </p>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#374151" }}>
              <strong style={{ color: "#111" }}>Telefone:</strong> {form.telefone}
            </p>
            <button type="button" className="ck-info-edit-btn" onClick={() => setStep(1)}>
              ✎ Alterar meus dados
            </button>
          </div>
        )}

        <div className="ck-card">
          {step === 1 && (
            <>
              <h2
                className="ck-h2"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <User size={20} color="#0b2447" /> Dados Pessoais
              </h2>
              <p className="ck-muted" style={{ fontSize: 13, marginTop: -4 }}>
                Solicitamos apenas as informações essenciais para a realização da compra.
              </p>
              <label className="ck-label">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={upd("email")}
                className={inputCls("email")}
              />
              {fieldErr("email")}
              <label className="ck-label">Nome completo</label>
              <input
                placeholder="Nome e sobrenome"
                value={form.nomeCompleto}
                onChange={upd("nomeCompleto")}
                className={inputCls("nomeCompleto")}
              />
              {fieldErr("nomeCompleto")}
              <label className="ck-label">CPF</label>
              <input
                placeholder="999.999.999-99"
                value={form.cpf}
                onChange={upd("cpf")}
                className={inputCls("cpf")}
                inputMode="numeric"
              />
              {fieldErr("cpf")}
              <label className="ck-label">Telefone</label>
              <input
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={upd("telefone")}
                className={inputCls("telefone")}
                inputMode="tel"
              />
              {fieldErr("telefone")}
            </>
          )}

          {step === 3 && (
            <>
              <h2
                className="ck-h2"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Calculator size={20} color="#0b2447" /> Pagamento
              </h2>
              <div
                style={{
                  border: "2px solid #2563eb",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: "#eff6ff",
                    borderBottom: "1px solid #dbeafe",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: "2px solid #2563eb",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 3,
                        borderRadius: "50%",
                        background: "#2563eb",
                      }}
                    />
                  </div>
                  <strong style={{ color: "#111" }}>Pix</strong>
                </div>
                <div style={{ padding: "22px 14px", textAlign: "center", background: "#fff" }}>
                  <img
                    src="https://logospng.org/download/pix/logo-pix-512.png"
                    alt="Pix"
                    style={{ height: 90, margin: "0 auto 14px", display: "block" }}
                  />
                  <p style={{ fontWeight: 700, color: "#111", margin: "0 0 10px" }}>
                    Para pagar, finalize sua compra abaixo
                  </p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ArrowDown size={20} color="#111" />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    margin: "0 0 10px",
                    color: "#111",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Truck size={16} color="#0b2447" /> Forma de entrega
                </h3>
                <label
                  className={`ck-ship-option${frete === "transportadora" ? " ck-ship-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="frete"
                    checked={frete === "transportadora"}
                    onChange={() => setFrete("transportadora")}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: "block", color: "#111" }}>Transportadora</strong>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>4 a 5 dias úteis</span>
                  </div>
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>Grátis</span>
                </label>
                <label className={`ck-ship-option${frete === "full" ? " ck-ship-active" : ""}`}>
                  <input
                    type="radio"
                    name="frete"
                    checked={frete === "full"}
                    onChange={() => setFrete("full")}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: "block", color: "#111" }}>Entrega Full</strong>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>1 a 3 dias úteis</span>
                  </div>
                  <span style={{ color: "#111", fontWeight: 700 }}>R$ 9,97</span>
                </label>
              </div>

              {pixError && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {pixError}
                </div>
              )}

              <div className="ck-nav ck-nav-inline">
                <button
                  type="button"
                  className="ck-pay-btn"
                  onClick={next}
                  disabled={!canAdvance}
                  style={!canAdvance ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}

          {step === "loading" && (
            <div style={{ padding: "60px 16px", textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 24px",
                  border: "4px solid #e5e7eb",
                  borderTopColor: "#2563eb",
                  borderRadius: "50%",
                  animation: "ck-spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#374151", fontSize: 16, margin: 0 }}>
                Aguarde, estamos preparando o pagamento
              </p>
            </div>
          )}

          {step === "pix" && (
            <div className="ck-pix-box">
              <h2 style={{ textAlign: "center", color: "#111", fontSize: 18, margin: "4px 0 6px" }}>
                Falta pouco! Seu pedido está quase concluído.
              </h2>
              <p
                style={{ textAlign: "center", color: "#6b7280", fontSize: 13, margin: "0 0 14px" }}
              >
                Pague com PIX no app do seu banco seguindo as orientações a seguir
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  margin: "6px 0 14px",
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                <span>🕐 Tempo restante para pagar:</span>
                <strong style={{ color: "#dc2626" }}>
                  {mm}:{ss}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={qrUrl}
                  alt="QR Code Pix"
                  style={{
                    width: 240,
                    height: 240,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 8,
                    background: "#fff",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 16,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "10px 12px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                {pixPayload}
              </div>

              <button
                type="button"
                onClick={copy}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#1d4ed8",
                  color: "#fff",
                  border: 0,
                  borderRadius: 8,
                  padding: "14px 16px",
                  fontWeight: 700,
                  fontSize: 15,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {copied ? (
                  <>
                    <Check size={18} /> Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Copiar código
                  </>
                )}
              </button>

              <ol
                style={{
                  marginTop: 18,
                  paddingLeft: 20,
                  color: "#374151",
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                <li>Copie o código PIX;</li>
                <li>Acesse o APP do seu banco;</li>
                <li>Escolha pagar com PIX;</li>
                <li>Cole o código do PIX;</li>
                <li>Confirme o pagamento.</li>
              </ol>

              <div style={{ textAlign: "center", margin: "10px 0" }}>
                <a href="#" style={{ color: "#2563eb", fontSize: 14, fontWeight: 600 }}>
                  ❓ Preciso de ajuda para pagar com PIX
                </a>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  marginTop: 8,
                  paddingTop: 14,
                  textAlign: "center",
                  color: "#374151",
                  fontSize: 14,
                }}
              >
                Assim que o seu pagamento for confirmado pela instituição financeira nós te
                avisaremos pelo seu email:
                <div style={{ marginTop: 6, color: "#2563eb", fontWeight: 700 }}>
                  {form.email || "seu@email.com"}
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  background: "#f3f4f6",
                  borderRadius: 8,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span style={{ color: "#374151", fontWeight: 600 }}>Número do pedido:</span>
                <strong style={{ fontSize: 22, color: "#111", letterSpacing: 0.5 }}>
                  {pixData?.hash ?? "—"}
                </strong>
              </div>

              <div
                style={{
                  marginTop: 16,
                  border: "2px dashed #ef4444",
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    margin: "0 auto 8px",
                    background: "#ef4444",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 22,
                  }}
                >
                  ⬆
                </div>
                <div style={{ fontWeight: 700, color: "#111", marginBottom: 4 }}>
                  Já pagou? Envie o comprovante
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                  Se o sistema demorar para confirmar, anexe aqui o print/PDF do Pix para agilizar a
                  liberação do seu pedido.
                </div>
                <input
                  id="ck-receipt-input"
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setReceiptFile(file);
                    const msg = encodeURIComponent(
                      `Olá! Acabei de pagar o Pix do meu pedido na ConfiaShop e quero enviar o comprovante (${file.name}).`,
                    );
                    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("ck-receipt-input")?.click();
                  }}
                  style={{
                    width: "100%",
                    background: "#ef4444",
                    color: "#fff",
                    border: 0,
                    borderRadius: 8,
                    padding: "12px 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  ⬆ Anexar comprovante
                </button>
                {receiptFile && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                    ✓ {receiptFile.name} selecionado. Envie no WhatsApp que abrimos para você.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navegação */}
          {step === 1 && (
            <div className="ck-nav">
              <button
                type="button"
                className="ck-pay-btn"
                onClick={next}
                disabled={!canAdvance}
                style={!canAdvance ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              >
                Avançar para o pagamento <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>

        {/* Resumo do pedido — sempre embaixo */}
        <div className="ck-summary-card">
          <div className="ck-summary-title">
            <ShoppingBag size={18} /> Resumo do pedido
          </div>
          <div className="ck-cart-item">
            <img
              src="https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-138176_800x.jpg"
              alt="Cinta Modeladora Slim Belly"
              className="ck-cart-img"
            />
          <div className="ck-cart-info">
            <div className="ck-cart-name">
              {kit.label} — Cinta Modeladora Slim Belly ({kit.title})
            </div>
            <div className="ck-cart-meta">
              Qtd: 1
              {selectedColors.length > 0 && (
                <span style={{ display: "block", marginTop: 2 }}>
                  Cor: {selectedColors.join(", ")}
                </span>
              )}
              {selectedSizes.length > 0 && (
                <span style={{ display: "block", marginTop: 2 }}>
                  Tamanho: {selectedSizes.join(", ")}
                </span>
              )}
            </div>
          </div>
            <div className="ck-cart-price">{formatBRL(kit.price)}</div>
          </div>

          <div className="ck-summary-row">
            <span>
              <Tag size={14} /> Subtotal
            </span>
            <strong>{formatBRL(kit.price)}</strong>
          </div>
          <div className="ck-summary-row">
            <span>
              <Truck size={14} />
              {` Frete ${frete === "full" ? "(Entrega Full)" : "(Transportadora)"}`}
            </span>
            {freteCost === 0 ? (
              <strong style={{ color: "#16a34a" }}>Grátis</strong>
            ) : (
              <strong>{formatBRL(freteCost)}</strong>
            )}
          </div>
          <div className="ck-summary-row ck-summary-total">
            <span>Total</span>
            <strong>{formatBRL(totalComFrete)}</strong>
          </div>
        </div>

        {/* Trust card */}
        <div className="ck-trust-card">
          <div className="ck-trust-badge">
            <CheckCircle2 size={16} color="#16a34a" />
            <span>
              Garantia de Devolução do Dinheiro em <strong>14 dias</strong>
            </span>
          </div>
          <div className="ck-trust-divider" />
          <div className="ck-trust-heading">Compre com confiança!</div>
          <ul className="ck-trust-list">
            <li>
              <Check size={16} color="#16a34a" /> Garantia de Devolução de 100% do Dinheiro
            </li>
            <li>
              <Check size={16} color="#16a34a" /> Devoluções Sem Complicações
            </li>
            <li>
              <Check size={16} color="#16a34a" /> Transações Seguras
            </li>
            <li>
              <Check size={16} color="#16a34a" /> Atendimento ao Cliente 24/7
            </li>
          </ul>
          <div className="ck-trust-divider" />
          <div className="ck-trust-reviews">
            <div className="ck-trust-heading" style={{ marginBottom: 0 }}>
              5000+ Avaliações de Clientes
            </div>
            <div className="ck-trust-stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} fill="#facc15" color="#facc15" />
              ))}
              <span>5/5</span>
            </div>
          </div>
          <p className="ck-trust-quote">
            {`"Fiquei encantada com o atendimento! A entrega foi rápida e o processo de compra, super fácil. Recomendo a todos!"`}
          </p>
          <div className="ck-trust-author">— Isabela Marcondes</div>
        </div>
      </main>

      <footer className="ck-footer">Confia Shop LTDA · CNPJ 64.119.790/0001-01</footer>
    </div>
  );
}
