import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Copy, Check, ChevronRight, ChevronLeft, ShoppingBag, Truck, Tag, User, QrCode, CheckCircle2, Star, Calculator, ArrowDown } from "lucide-react";
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
    bairro: "",
    numero: "",
    cidade: "",
    estado: "SP",
  });
  const [frete, setFrete] = useState<"transportadora" | "full">("transportadora");
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
      if (form.nomeCompleto.trim().split(/\s+/).length < 2) e.nomeCompleto = "Informe nome e sobrenome";
      if (!isValidCPF(form.cpf)) e.cpf = "CPF inválido";
      if (!isValidPhone(form.telefone)) e.telefone = "Telefone inválido";
    }
    if (s === 2) {
      if (!isValidCEP(form.cep)) e.cep = "CEP inválido (8 dígitos)";
      if (!form.endereco.trim()) e.endereco = "Informe o endereço";
      if (!form.bairro.trim()) e.bairro = "Informe o bairro";
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

  const isStepValid = (s: Step): boolean => {
    if (s === 1) {
      return isValidEmail(form.email)
        && form.nomeCompleto.trim().split(/\s+/).length >= 2
        && isValidCPF(form.cpf)
        && isValidPhone(form.telefone);
    }
    if (s === 2) {
      return isValidCEP(form.cep)
        && !!form.endereco.trim()
        && !!form.bairro.trim()
        && !!form.numero.trim()
        && !!form.cidade.trim();
    }
    return true;
  };
  const canAdvance = step !== "pix" && isStepValid(step as Step);

  const freteCost = frete === "full" ? 997 : 0;
  const totalComFrete = TOTAL + freteCost;
  const pixPayload = makePixPayload(totalComFrete);
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

        {step === 2 && (
          <div className="ck-card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
              <h2 className="ck-h2" style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}>
                <User size={20} color="#0b2447" /> Dados pessoais
              </h2>
              <button type="button" className="ck-info-summary-link" onClick={() => setStep(1)}>Não é você? Sair</button>
            </div>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#374151" }}>{form.email}</p>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#374151" }}><strong style={{ color: "#111" }}>Nome:</strong> {form.nomeCompleto}</p>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#374151" }}><strong style={{ color: "#111" }}>Telefone:</strong> {form.telefone}</p>
            <button type="button" className="ck-info-edit-btn" onClick={() => setStep(1)}>
              ✎ Alterar meus dados
            </button>
          </div>
        )}

        <div className="ck-card">


          {step === 1 && (
            <>
              <h2 className="ck-h2" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
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

          {step === 2 && (
            <>
              <h2 className="ck-h2" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Truck size={20} color="#0b2447" /> Entrega
              </h2>
              <label className="ck-label">CEP</label>
              <input
                placeholder="00000-000"
                value={form.cep}
                onChange={upd("cep")}
                className={inputCls("cep")}
                inputMode="numeric"
              />
              {fieldErr("cep")}
              <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 13, color: "#2563eb", marginTop: -6, marginBottom: 4 }}>Não sei meu CEP</a>

              <label className="ck-label">Endereço</label>
              <input placeholder="Endereço" value={form.endereco} onChange={upd("endereco")} className={inputCls("endereco")} />
              {fieldErr("endereco")}

              <label className="ck-label">Bairro</label>
              <input placeholder="Bairro" value={form.bairro} onChange={upd("bairro")} className={inputCls("bairro")} />
              {fieldErr("bairro")}

              <label className="ck-label">Cidade</label>
              <input placeholder="Cidade" value={form.cidade} onChange={upd("cidade")} className={inputCls("cidade")} />
              {fieldErr("cidade")}

              <label className="ck-label">Estado</label>
              <select value={form.estado} onChange={upd("estado")} className="ck-input">
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <label className="ck-label">Número</label>
              <input placeholder="Número" value={form.numero} onChange={upd("numero")} className={inputCls("numero")} />
              {fieldErr("numero")}

              {isStepValid(2) && (
                <div style={{ marginTop: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", color: "#111" }}>Selecione a forma de entrega</h3>
                  <label className={`ck-ship-option${frete === "transportadora" ? " ck-ship-active" : ""}`}>
                    <input type="radio" name="frete" checked={frete === "transportadora"} onChange={() => setFrete("transportadora")} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", color: "#111" }}>Transportadora</strong>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>4 a 5 dias úteis</span>
                    </div>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>Grátis</span>
                  </label>
                  <label className={`ck-ship-option${frete === "full" ? " ck-ship-active" : ""}`}>
                    <input type="radio" name="frete" checked={frete === "full"} onChange={() => setFrete("full")} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", color: "#111" }}>Entrega Full</strong>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>1 a 3 dias úteis</span>
                    </div>
                    <span style={{ color: "#111", fontWeight: 700 }}>R$ 9,97</span>
                  </label>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="ck-h2" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Calculator size={20} color="#0b2447" /> Pagamento
              </h2>
              <div style={{ border: "2px solid #2563eb", borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#eff6ff", borderBottom: "1px solid #dbeafe" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #2563eb", position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#2563eb" }} />
                  </div>
                  <strong style={{ color: "#111" }}>Pix</strong>
                </div>
                <div style={{ padding: "22px 14px", textAlign: "center", background: "#fff" }}>
                  <img
                    src="https://logospng.org/download/pix/logo-pix-512.png"
                    alt="Pix"
                    style={{ height: 90, margin: "0 auto 14px", display: "block" }}
                  />
                  <p style={{ fontWeight: 700, color: "#111", margin: "0 0 10px" }}>Para pagar, finalize sua compra abaixo</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ArrowDown size={20} color="#111" />
                  </div>
                </div>
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
          {step !== "pix" && step !== 3 && (
            <div className="ck-nav">
              <button type="button" className="ck-pay-btn" onClick={next} disabled={!canAdvance} style={!canAdvance ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                {step === 1 ? <>Avançar para a entrega <ChevronRight size={16} /></> : <>Avançar para o pagamento <ChevronRight size={16} /></>}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="ck-sticky-footer">
              <button type="button" className="ck-pay-btn ck-sticky-btn" onClick={next} disabled={!canAdvance} style={!canAdvance ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                Finalizar Compra
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
            <span><Truck size={14} /> Frete {frete === "full" ? "(Entrega Full)" : "(Transportadora)"}</span>
            {freteCost === 0
              ? <strong style={{ color: "#16a34a" }}>Grátis</strong>
              : <strong>{formatBRL(freteCost)}</strong>}
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
            <span>Garantia de Devolução do Dinheiro em <strong>14 dias</strong></span>
          </div>
          <div className="ck-trust-divider" />
          <div className="ck-trust-heading">Compre com confiança!</div>
          <ul className="ck-trust-list">
            <li><Check size={16} color="#16a34a" /> Garantia de Devolução de 100% do Dinheiro</li>
            <li><Check size={16} color="#16a34a" /> Devoluções Sem Complicações</li>
            <li><Check size={16} color="#16a34a" /> Transações Seguras</li>
            <li><Check size={16} color="#16a34a" /> Atendimento ao Cliente 24/7</li>
          </ul>
          <div className="ck-trust-divider" />
          <div className="ck-trust-reviews">
            <div className="ck-trust-heading" style={{ marginBottom: 0 }}>5000+ Avaliações de Clientes</div>
            <div className="ck-trust-stars">
              {[0,1,2,3,4].map((i) => <Star key={i} size={14} fill="#facc15" color="#facc15" />)}
              <span>5/5</span>
            </div>
          </div>
          <p className="ck-trust-quote">
            {`"Fiquei encantada com o atendimento! A entrega foi rápida e o processo de compra, super fácil. Recomendo a todos!"`}
          </p>
          <div className="ck-trust-author">— Isabela Marcondes</div>
        </div>

      </main>


      <footer className="ck-footer">
        Confia Shop LTDA · CNPJ 64.119.790/0001-01
      </footer>
    </div>
  );
}
