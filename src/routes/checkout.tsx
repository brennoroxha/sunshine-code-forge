import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Copy, Check } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — ConfiaShop" }] }),
});

const TOTAL = 23970; // R$ 239,70 em centavos
const PIX_KEY = "64119790000101"; // CNPJ ConfiaShop

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
  if (d.length <= 10) return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => [a && `(${a})`, b && ` ${b}`, c && `-${c}`].filter(Boolean).join(""));
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
}

function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Gera "payload" estilo Pix Copia e Cola (fake, apenas demo visual)
function makePixPayload(amountCents: number) {
  const amount = (amountCents / 100).toFixed(2);
  return `00020126360014BR.GOV.BCB.PIX0114${PIX_KEY}5204000053039865406${amount}5802BR5910ConfiaShop6009SAO PAULO62070503***6304ABCD`;
}

function CheckoutPage() {
  const [step, setStep] = useState<"form" | "pix">("form");
  const [form, setForm] = useState({
    email: "",
    nome: "",
    sobrenome: "",
    cpf: "",
    cep: "",
    endereco: "",
    numero: "",
    cidade: "",
    estado: "SP",
    telefone: "",
  });
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
  };

  // Auto-buscar endereço via ViaCEP
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("pix");
    setExpira(15 * 60);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="ck-root">
      {/* TOPO */}
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
        {step === "form" ? (
          <form className="ck-card" onSubmit={handleSubmit}>
            <div className="ck-summary">
              <span>Resumo do pedido</span>
              <strong>{formatBRL(TOTAL)}</strong>
            </div>

            <h2 className="ck-h2">Contato</h2>
            <input
              type="email"
              required
              placeholder="E-mail"
              value={form.email}
              onChange={upd("email")}
              className="ck-input"
            />

            <h2 className="ck-h2">Entrega</h2>
            <div className="ck-row">
              <input required placeholder="Nome" value={form.nome} onChange={upd("nome")} className="ck-input" />
              <input required placeholder="Sobrenome" value={form.sobrenome} onChange={upd("sobrenome")} className="ck-input" />
            </div>
            <input
              required
              placeholder="CPF"
              value={form.cpf}
              onChange={upd("cpf")}
              className="ck-input"
              inputMode="numeric"
            />
            <input
              required
              placeholder="CEP"
              value={form.cep}
              onChange={upd("cep")}
              className="ck-input"
              inputMode="numeric"
            />
            <div className="ck-row">
              <input required placeholder="Endereço" value={form.endereco} onChange={upd("endereco")} className="ck-input" />
              <input placeholder="Número" value={form.numero} onChange={upd("numero")} className="ck-input" style={{ maxWidth: 120 }} />
            </div>
            <div className="ck-row">
              <input required placeholder="Cidade" value={form.cidade} onChange={upd("cidade")} className="ck-input" />
              <select value={form.estado} onChange={upd("estado")} className="ck-input">
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <input
              required
              placeholder="Telefone"
              value={form.telefone}
              onChange={upd("telefone")}
              className="ck-input"
              inputMode="tel"
            />

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

            <button type="submit" className="ck-pay-btn">
              Pagar agora
            </button>

            <div className="ck-trust">
              <ShieldCheck size={14} /> Pagamento processado em ambiente seguro
            </div>
          </form>
        ) : (
          <div className="ck-card">
            <div className="ck-summary">
              <span>Pagamento via Pix</span>
              <strong>{formatBRL(TOTAL)}</strong>
            </div>

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

            <button type="button" className="ck-pay-btn" onClick={() => setStep("form")} style={{ background: "#444" }}>
              Voltar
            </button>
            <div className="ck-trust">
              <ShieldCheck size={14} /> Após o pagamento, a confirmação é automática.
            </div>
          </div>
        )}
      </main>

      <footer className="ck-footer">
        Confia Shop LTDA · CNPJ 64.119.790/0001-01
      </footer>
    </div>
  );
}
