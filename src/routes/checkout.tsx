import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Copy, Check, ChevronRight, ChevronLeft, ShoppingBag, Truck, Tag, User, QrCode, CheckCircle2, Star } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — ConfiaShop" }] }),
});

const TOTAL = 23970;
const PIX_KEY = "64119790000101";

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
      [a && `(${a})`, b && ` ${b}`, c && `-${c}`].filter(Boolean).join("")
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

type Step = 1 | 2 | 3 | "pix";

function CheckoutPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    email: "",
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    cidade: "",
    estado: "SP",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [expira, setExpira] = useState(15 * 60);

  useEffect(() => {
    if (step !== "pix") return;
    const t = setInterval(() => setExpira((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (form.nomeCompleto.trim().split(/\s+/).length < 2) e.nomeCompleto = "Informe nome e sobrenome";
      if (!isValidCPF(form.cpf)) e.cpf = "CPF inválido";
      if (!isValidPhone(form.telefone)) e.telefone = "Telefone inválido";
    }
    if (s === 2) {
      if (!isValidCEP(form.cep)) e.cep = "CEP inválido (8 dígitos)";
      if (!form.endereco.trim()) e.endereco = "Informe o endereço";
      if (!form.numero.trim()) e.numero = "Nº";
      if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step as Step)) return;
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) {
      setStep("pix");
      setExpira(15 * 60);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === "pix") setStep(3);
  };

  const pixPayload = makePixPayload(TOTAL);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixPayload)}`;
  const mm = String(Math.floor(expira / 60)).padStart(2, "0");
  const ss = String(expira % 60).padStart(2, "0");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const stepNum = step === "pix" ? 3 : step;
  const steps = [
    { n: 1, label: "Dados Pessoais", Icon: User },
    { n: 2, label: "Entrega", Icon: Truck },
    { n: 3, label: "Pagamento", Icon: QrCode },
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
            <ShieldCheck size={18} />
            <span>Compra 100% Segura</span>
            <Lock size={14} style={{ opacity: 0.7 }} />
          </div>
        </div>
      </header>

      <main className="ck-main">
        {/* Stepper fora do card */}
        <div className="ck-stepper">
          {steps.map((s, i) => (
            <div key={s.n} className="ck-step-wrap">
              <div className={`ck-step ${stepNum >= s.n ? "is-on" : ""} ${stepNum === s.n && step !== "pix" ? "is-active" : ""}`}>
                <div className="ck-step-num">
                  <s.Icon size={16} />
                </div>
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`ck-step-line ${stepNum > s.n ? "is-on" : ""}`} />}
            </div>
          ))}
        </div>

        <div className="ck-card">


          {step === 1 && (
            <>
              <h2 className="ck-h2">Dados Pessoais</h2>
              <p className="ck-muted" style={{ fontSize: 13, marginTop: -4 }}>
                Solicitamos apenas as informações essenciais para a realização da compra.
              </p>
              <input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={upd("email")}
                className={inputCls("email")}
              />
              {fieldErr("email")}
              <input
                placeholder="Nome completo"
                value={form.nomeCompleto}
                onChange={upd("nomeCompleto")}
                className={inputCls("nomeCompleto")}
              />
              {fieldErr("nomeCompleto")}
              <input
                placeholder="CPF (999.999.999-99)"
                value={form.cpf}
                onChange={upd("cpf")}
                className={inputCls("cpf")}
                inputMode="numeric"
              />
              {fieldErr("cpf")}
              <input
                placeholder="Telefone (11) 99999-9999"
                value={form.telefone}
                onChange={upd("telefone")}
                className={inputCls("telefone")}
                inputMode="tel"
              />
              {fieldErr("telefone")}
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="ck-h2">Entrega</h2>
              <input
                placeholder="CEP"
                value={form.cep}
                onChange={upd("cep")}
                className={inputCls("cep")}
                inputMode="numeric"
              />
              {fieldErr("cep")}
              <div className="ck-row">
                <div style={{ flex: 1 }}>
                  <input placeholder="Endereço" value={form.endereco} onChange={upd("endereco")} className={inputCls("endereco")} />
                  {fieldErr("endereco")}
                </div>
                <div style={{ maxWidth: 120 }}>
                  <input placeholder="Número" value={form.numero} onChange={upd("numero")} className={inputCls("numero")} />
                  {fieldErr("numero")}
                </div>
              </div>
              <div className="ck-row">
                <div style={{ flex: 1 }}>
                  <input placeholder="Cidade" value={form.cidade} onChange={upd("cidade")} className={inputCls("cidade")} />
                  {fieldErr("cidade")}
                </div>
                <select value={form.estado} onChange={upd("estado")} className="ck-input">
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="ck-h2">Pagamento</h2>
              <p className="ck-muted">Todas as transações são seguras e criptografadas.</p>
              <div className="ck-pay-option ck-pay-active">
                <div className="ck-radio" />
                <div style={{ flex: 1 }}>
                  <strong>Pix</strong>
                  <div className="ck-muted" style={{ fontSize: 13 }}>
                    Aprovação imediata. Clique em pagar para gerar o QR Code.
                  </div>
                </div>
                <span className="ck-pix-badge">PIX</span>
              </div>
              <div className="ck-total">
                <span>Total</span>
                <strong>{formatBRL(TOTAL)}</strong>
              </div>
            </>
          )}

          {step === "pix" && (
            <div className="ck-pix-box">
              <div className="ck-pix-timer">
                Expira em <strong>{mm}:{ss}</strong>
              </div>
              <img src={qrUrl} alt="QR Code Pix" className="ck-qr" />
              <p className="ck-muted" style={{ textAlign: "center" }}>
                Abra o app do seu banco, escolha pagar com Pix e escaneie o QR Code.
              </p>
              <label className="ck-h2" style={{ fontSize: 14, marginTop: 8 }}>Pix Copia e Cola</label>
              <div className="ck-copy">
                <code>{pixPayload}</code>
                <button type="button" onClick={copy} className="ck-copy-btn">
                  {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                </button>
              </div>
            </div>
          )}

          {/* Navegação */}
          {step !== "pix" ? (
            <div className="ck-nav">
              {step !== 1 && (
                <button type="button" className="ck-pay-btn ck-btn-secondary" onClick={back}>
                  <ChevronLeft size={16} /> Voltar
                </button>
              )}
              <button type="button" className="ck-pay-btn" onClick={next}>
                {step === 3 ? "Pagar agora" : <>Continuar <ChevronRight size={16} /></>}
              </button>
            </div>
          ) : (
            <button type="button" className="ck-pay-btn ck-btn-secondary" onClick={back}>
              <ChevronLeft size={16} /> Voltar
            </button>
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
              <div className="ck-cart-name">KIT 02 Cinta Modeladora Cintura Alta — Slim Belly</div>
              <div className="ck-cart-meta">Qtd: 1</div>
            </div>
            <div className="ck-cart-price">{formatBRL(TOTAL)}</div>
          </div>

          <div className="ck-summary-row">
            <span><Tag size={14} /> Subtotal</span>
            <strong>{formatBRL(TOTAL)}</strong>
          </div>
          <div className="ck-summary-row">
            <span><Truck size={14} /> Frete</span>
            <strong style={{ color: "#16a34a" }}>Grátis</strong>
          </div>
          <div className="ck-summary-row ck-summary-total">
            <span>Total</span>
            <strong>{formatBRL(TOTAL)}</strong>
          </div>
        </div>
      </main>


      <footer className="ck-footer">
        Confia Shop LTDA · CNPJ 64.119.790/0001-01
      </footer>
    </div>
  );
}
