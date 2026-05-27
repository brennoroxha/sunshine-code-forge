import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, Package, PackageCheck, ShieldCheck, RefreshCw } from "lucide-react";
import desc1 from "@/assets/desc-1.png";
import desc2 from "@/assets/desc-2.png";
import desc3 from "@/assets/desc-3.png";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Cinta Modeladora Cintura Alta — Slim Belly | Magazines Bytes" },
      {
        name: "description",
        content:
          "Cinta Modeladora Slim Belly com terapia magnética, cintura alta e lifting de bumbum. Frete grátis, 7 dias para troca e 30 dias de garantia.",
      },
      { property: "og:title", content: "Cinta Modeladora Slim Belly" },
      {
        property: "og:description",
        content: "Modele sua silhueta com a Slim Belly. Desconto de lançamento!",
      },
      { property: "og:type", content: "product" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap",
      },
    ],
  }),
});

const IMAGES = [
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-138176_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-292299_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-455305_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-775648_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-700403_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-126810_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-vermelha-m-663182_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-mix-3-m-666890_800x.jpg",
  "https://lojasmasgazines.com/cdn/shop/files/calcinha-modeladora-slim-belly-bem-estar-041-loja-da-dryka-mix-5-m-921742_800x.jpg",
];

const COLORS = [
  { name: "Bege", hex: "#c8a96e", imgIndex: 0 },
  { name: "Preto", hex: "#1a1a1a", imgIndex: 5 },
  { name: "Vermelho", hex: "#c8265a", imgIndex: 6 },
];
const SIZES = ["P", "M", "G", "GG", "XG", "XXG", "G2"];

const SIZE_TABLE = [
  ["P", "50-55cm", "65-70cm", "40-45kg"],
  ["M", "55-65cm", "70-80cm", "45-55kg"],
  ["G", "60-70cm", "75-85cm", "55-65kg"],
  ["GG", "65-75cm", "80-90cm", "65-75kg"],
  ["XG", "70-80cm", "85-95cm", "75-85kg"],
  ["XXG", "75-85cm", "90-100cm", "85-95kg"],
  ["G2", "80-90cm", "95-105cm", "90-100kg"],
];

const KITS = [
  { id: 1, label: "KIT 1", title: "1 Cinta", price: 5990, priceLabel: "R$ 59,90", badge: null as string | null },
  { id: 2, label: "KIT 2", title: "2 Cintas", price: 7990, priceLabel: "R$ 79,90", badge: "MAIS VENDIDO" },
  { id: 3, label: "KIT 3", title: "3 Cintas", price: 9990, priceLabel: "R$ 99,90", badge: "MELHOR CUSTO" },
];

const TESTIMONIALS = [
  {
    initials: "MS",
    name: "Marina Souza",
    city: "São Paulo, SP",
    text: "Perdi 2cm de cintura na primeira semana usando todos os dias. Super confortável, uso até no trabalho.",
  },
  {
    initials: "AR",
    name: "Amanda Ribeiro",
    city: "Rio de Janeiro, RJ",
    text: "Resultado imediato! Marquei a cintura e o bumbum ficou mais empinado. Comprei outra pra minha irmã.",
  },
  {
    initials: "CP",
    name: "Carla Pereira",
    city: "Belo Horizonte, MG",
    text: "Em 15 dias minha barriga ficou notavelmente mais lisa. Tecido respirável, não esquenta nada.",
  },
  {
    initials: "JM",
    name: "Juliana Martins",
    city: "Curitiba, PR",
    text: "Voltei a usar vestido justo depois de 2 anos. Disfarça totalmente a gordurinha, ninguém percebe.",
  },
  {
    initials: "PL",
    name: "Patrícia Lima",
    city: "Salvador, BA",
    text: "Perdi 3cm de cintura em 20 dias usando junto com caminhada. Vale demais cada centavo.",
  },
  {
    initials: "RA",
    name: "Renata Almeida",
    city: "Porto Alegre, RS",
    text: "Sumiu aquela gordurinha lateral que eu odiava. Já tô na segunda compra, presenteei minha mãe.",
  },
];


const FAQS = [
  {
    q: "Como escolho o tamanho certo?",
    a: "Consulte nossa tabela de medidas acima. Meça sua cintura e quadril com uma fita métrica e compare com os valores indicados. Em caso de dúvida entre dois tamanhos, prefira o maior.",
  },
  {
    q: "Em quantas parcelas posso parcelar?",
    a: "Você pode parcelar em até 12x sem juros no cartão de crédito. Também aceitamos Pix com 5% de desconto adicional.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "O prazo médio é de 3 a 7 dias úteis após a confirmação do pagamento, com frete grátis para todo o Brasil via correios e transportadoras parceiras.",
  },
  {
    q: "Posso trocar se não couber?",
    a: "Sim! Você tem 7 dias para solicitar a troca por outro tamanho, sem custo adicional. Basta entrar em contato com nosso SAC.",
  },
  {
    q: "A cinta deixa marcas na roupa?",
    a: "Não. O tecido é fino, respirável e foi desenvolvido para ser invisível por baixo de qualquer roupa, inclusive vestidos justos.",
  },
];

function Index() {
  const [mainImg, setMainImg] = useState(0);
  const [colors, setColors] = useState<number[]>([0]);
  const [sizes, setSizes] = useState<number[]>([1]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [testimonial, setTestimonial] = useState(0);
  const [kitId, setKitId] = useState<number>(2);
  const selectedKit = KITS.find((k) => k.id === kitId) ?? KITS[1];
  const [stockBySize] = useState<number[]>(() =>
    SIZES.map(() => 3 + Math.floor(Math.random() * 5)),
  );
  // Persist kit choice for checkout
  useEffect(() => {
    try {
      localStorage.setItem(
        "sb_kit",
        JSON.stringify({ id: selectedKit.id, label: selectedKit.label, title: selectedKit.title, price: selectedKit.price, priceLabel: selectedKit.priceLabel }),
      );
    } catch {}
  }, [selectedKit.id]);
  const [deliveryDates, setDeliveryDates] = useState<{ placed: string; processed: string; delivered: string } | null>(null);
  const [shippingRange, setShippingRange] = useState<{ from: string; to: string } | null>(null);
  const [city, setCity] = useState<{ name: string; region: string }>({ name: "Ourinhos", region: "SP" });
  const [viewers, setViewers] = useState(21);
  const [isCtaVisible, setIsCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("https://ipapi.co/json/", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.city) {
          setCity({ name: d.city, region: d.region_code || d.region || "" });
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    let current = 21;
    let direction: 1 | -1 = 1;
    const tick = () => {
      if (direction === 1) {
        current += 1;
        if (current >= 33) direction = -1;
      } else {
        current -= 1;
        if (current <= 21) direction = 1;
      }
      setViewers(current);
    };
    const interval = setInterval(tick, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fmt = (d: Date) => {
      const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return `${dias[d.getDay()]}, ${d.getDate()}. ${meses[d.getMonth()]}`;
    };
    const now = new Date();
    const plus = (n: number) => {
      const d = new Date(now);
      d.setDate(now.getDate() + n);
      return d;
    };
    setDeliveryDates({
      placed: fmt(now),
      processed: fmt(plus(1)),
      delivered: fmt(plus(5)),
    });
    const fmtShort = (d: Date) => {
      const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      return `${d.getDate()} de ${meses[d.getMonth()]}`;
    };
    setShippingRange({ from: fmtShort(plus(2)), to: fmtShort(plus(5)) });
  }, []);

  const toggleSelection = (
    current: number[],
    index: number,
    max: number,
    onAdd?: (i: number) => void,
  ): number[] => {
    if (current.includes(index)) {
      if (current.length === 1) return current; // keep at least 1
      return current.filter((i) => i !== index);
    }
    onAdd?.(index);
    if (current.length >= max) return [...current.slice(1), index];
    return [...current, index];
  };

  // Fade in on scroll
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Watch CTA visibility for sticky footer
  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsCtaVisible(entry.isIntersecting);
        });
      },
      { threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Ripple effect
  const ripple = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.left = `${e.clientX - rect.left}px`;
    span.style.top = `${e.clientY - rect.top}px`;
    target.appendChild(span);
    setTimeout(() => span.remove(), 600);
  };

  return (
    <div className="sb-root">
      {/* 1. BARRA DE URGÊNCIA */}
      <div className="sb-urgency">
        <div className="sb-marquee">
          <span>
            🔥 DESCONTO DE LANÇAMENTO · Frete Grátis para todo Brasil · Compra 100% Segura 🔥
          </span>
          <span aria-hidden="true">
            🔥 DESCONTO DE LANÇAMENTO · Frete Grátis para todo Brasil · Compra 100% Segura 🔥
          </span>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sb-header">
        <div className="sb-container sb-header-inner">
          <a href="#" className="sb-logo" aria-label="ConfiaShop">
            <img src={logo} alt="ConfiaShop" />
          </a>
        </div>
      </header>

      {/* 3. HERO */}
      <section className="sb-hero" id="comprar">
        <div className="sb-container sb-hero-grid">
          {/* Galeria */}
          <div className="sb-gallery">
            <div className="sb-main-img">
              <img src={IMAGES[mainImg]} alt="Cinta Slim Belly" loading="eager" />
            </div>
            <div className="sb-thumbs">
              {IMAGES.map((src, i) => (
                <button
                  key={src}
                  className={`sb-thumb ${mainImg === i ? "is-active" : ""}`}
                  onClick={() => setMainImg(i)}
                  aria-label={`Imagem ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="sb-info">
            <div
              className="sb-info-card"
              style={{
                background: "#ffffff",
                color: "#1a1a1a",
                borderRadius: 16,
                padding: "clamp(20px, 4vw, 32px)",
                boxShadow: "0 4px 20px rgba(0,0,0,.06)",
              }}
            >
              <h1 className="sb-title">Leve 2 Cintas Modeladoras Slim Belly pelo preço de 1</h1>
              <p style={{ fontSize: 14, color: "#6b6b6b", marginTop: 6, marginBottom: 4 }}>
                Escolha 2 cores e 2 tamanhos — frete grátis incluído
              </p>
              <div className="sb-rating">
                <span className="sb-stars">⭐⭐⭐⭐⭐</span>
                <strong>4.9</strong>
                <span className="sb-muted">· 2.847 avaliações</span>
              </div>
              <div style={{ width: "100%", height: 1, background: "#e5e5e5", margin: "12px 0" }} />

            <div className="sb-selector">
              <label className="sb-label">
                Escolha seu kit: <strong>{selectedKit.label} — {selectedKit.title}</strong>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {KITS.map((k) => {
                  const active = k.id === kitId;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setKitId(k.id)}
                      style={{
                        position: "relative",
                        padding: "12px 6px 10px",
                        border: `2px solid ${active ? "var(--sb-cta)" : "#e5e5e5"}`,
                        background: active ? "#fff5f8" : "#fff",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all .15s ease",
                      }}
                    >
                      {k.badge && (
                        <span
                          style={{
                            position: "absolute",
                            top: -10,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: k.badge === "MAIS VENDIDO" ? "var(--sb-cta)" : "#1a1a1a",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 999,
                            whiteSpace: "nowrap",
                            letterSpacing: 0.3,
                          }}
                        >
                          {k.badge}
                        </span>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{k.label}</div>
                      <div style={{ fontSize: 11, color: "#6b6b6b", marginTop: 2 }}>{k.title}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6, color: active ? "var(--sb-cta)" : "#1a1a1a" }}>
                        {k.priceLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sb-selector">

              <label className="sb-label">
                Cores (<strong>escolha 2, pode repetir</strong>):{" "}
                <strong>
                  {colors.length === 0
                    ? "—"
                    : colors.length === 2 && colors[0] === colors[1]
                    ? `2x ${COLORS[colors[0]].name}`
                    : colors.map((i) => COLORS[i].name).join(" + ")}
                </strong>
              </label>
              <div className="sb-swatches">
                {COLORS.map((c, i) => {
                  const count = colors.filter((x) => x === i).length;
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        setMainImg(c.imgIndex);
                        setColors((prev) => (prev.length >= 2 ? [i] : [...prev, i]));
                      }}
                      className={`sb-swatch ${count > 0 ? "is-active" : ""}`}
                      aria-label={c.name}
                      title={c.name}
                      style={{ position: "relative" }}
                    >
                      <img src={IMAGES[c.imgIndex]} alt={c.name} loading="lazy" />
                      {count > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))",
                            borderRadius: "999px",
                            minWidth: 20,
                            height: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 6px",
                            boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                          }}
                        >
                          ×{count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {colors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setColors([])}
                  style={{
                    marginTop: 8,
                    background: "transparent",
                    border: "none",
                    color: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Limpar seleção
                </button>
              )}
            </div>

            <div className="sb-selector">
              <label className="sb-label">
                Tamanhos (<strong>escolha 2, pode repetir</strong>):{" "}
                <strong>{sizes.map((i) => SIZES[i]).join(" + ")}</strong>
              </label>
              <div className="sb-sizes">
                {SIZES.map((s, i) => {
                  const count = sizes.filter((x) => x === i).length;
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setSizes((prev) =>
                          prev.length >= 2 ? [i] : [...prev, i]
                        )
                      }
                      className={`sb-size ${count > 0 ? "is-active" : ""}`}
                    >
                      {s}
                      {count > 1 ? ` ×${count}` : ""}
                    </button>
                  );
                })}
              </div>
              {sizes.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  {Array.from(new Set(sizes)).map((idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 12,
                        color: "#b45309",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ Apenas {stockBySize[idx]} unidades restantes no tamanho {SIZES[idx]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sb-price" style={{ flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <span className="sb-price-old">De R$ 149,90</span>
              <span className="sb-price-new">{selectedKit.priceLabel}</span>
              <span
                style={{
                  background: "var(--sb-cta)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  letterSpacing: 0.4,
                }}
              >
                47% OFF
              </span>
            </div>
            <div className="sb-installments">
              ou 3x de {(selectedKit.price / 3 / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} sem juros
            </div>


            <Link to="/checkout" ref={ctaRef} className="sb-cta sb-cta-primary" onClick={ripple}>
              🛒 COMPRAR AGORA
            </Link>

            <div className="sb-social-count">
              <span className="sb-pulse" /> {viewers} pessoas estão vendo agora
            </div>

            <div className="sb-timeline" suppressHydrationWarning>
              <div className="sb-tl-step">
                <div className="sb-tl-icon"><ClipboardList size={20} /></div>
                <div className="sb-tl-date">{deliveryDates?.placed ?? "—"}</div>
                <div className="sb-tl-label">Pedido realizado</div>
              </div>
              <div className="sb-tl-line" />
              <div className="sb-tl-step">
                <div className="sb-tl-icon"><Package size={20} /></div>
                <div className="sb-tl-date">{deliveryDates?.processed ?? "—"}</div>
                <div className="sb-tl-label">Processado</div>
              </div>
              <div className="sb-tl-line" />
              <div className="sb-tl-step">
                <div className="sb-tl-icon"><PackageCheck size={20} /></div>
                <div className="sb-tl-date">{deliveryDates?.delivered ?? "—"}</div>
                <div className="sb-tl-label">Entregue</div>
              </div>
            </div>

            <div className="sb-info-box">
              <div className="sb-info-row">
                <ShieldCheck size={20} className="sb-info-ico" />
                <div className="sb-info-text">
                  <strong>Compra garantida:</strong> Você tem até 30 dias de Garantia
                </div>
              </div>
              <div className="sb-info-row">
                <RefreshCw size={20} className="sb-info-ico" />
                <div className="sb-info-text">
                  <strong>Troca Grátis:</strong> Você tem até 7 dias para testar o produto
                </div>
              </div>
            </div>

            <div className="sb-info-box">
              <div className="sb-info-row">
                <img src="/correios.svg" alt="Correios" className="sb-info-correios" />
                <div className="sb-info-text">
                  <div><strong>Frete Grátis:</strong> para {city.name}{city.region ? `, ${city.region}` : ""} e Região</div>
                  <div>Receba entre: {shippingRange?.from ?? "—"} e {shippingRange?.to ?? "—"}</div>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      </section>




      {/* 4. DESCRIÇÃO */}
      <section className="sb-section" style={{ paddingTop: 0 }}>
        <div className="sb-container sb-container-sm">
          <h2 className="sb-h2" style={{ marginBottom: 24 }}>
            Descrição
          </h2>
          <h3
            style={{
              fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
              fontWeight: 700,
              marginBottom: 16,
              color: "#1a1a1a",
            }}
          >
            Cinta Modeladora Cintura Alta - Slim Belly
          </h3>

          <div className="sb-desc-img">
            <img src={desc1} alt="Elasticidade Superior em Quatro Direções" loading="lazy" />
          </div>

          <p className="sb-desc-text">
            A Cinta Modeladora Cintura Alta - Slim Belly é a escolha ideal para quem busca conforto
            e eficácia na modelagem corporal. Seu design sem costura elimina qualquer desconforto,
            enquanto a cintura alta oferece um controle efetivo do abdômen, realçando a silhueta
            natural. Além disso, a peça incorpora terapia magnética que ajuda a melhorar a
            circulação sanguínea e reduzir as cólicas menstruais. Com suporte sem fio que elimina
            qualquer pressão desconfortável, esta calcinha ajuda a atingir o formato desejado de
            maneira sutil e natural, sendo perfeita para o uso diário.
          </p>

          <div className="sb-desc-img">
            <img src={desc2} alt="Tecido antibacteriano e ativação térmica" loading="lazy" />
          </div>

          <div className="sb-desc-img">
            <img src={desc3} alt="Tabela de tamanhos Slim Belly" loading="lazy" />
          </div>

          <h3 className="sb-desc-h3">Características</h3>
          <ul className="sb-desc-list">
            <li>80% Náilon + 20% Elastano</li>
            <li>Conforto perfeito: contorna perfeitamente o seu corpo para a liberdade irrestrita.</li>
            <li>Adesivo Aquecedor: Proporciona calor e cuidado para o seu bem-estar.</li>
            <li>Controle de barriga de cintura alta: molda sua cintura sem esforço para suporte extra.</li>
            <li>Efeito lifting de bumbum: realça instantaneamente suas curvas para uma aparência mais atraente.</li>
            <li>Resistência: Mantém a forma ao longo do tempo, resistindo à deformação.</li>
            <li>Tecido Respirável: frescor e respirabilidade durante todo o dia.</li>
            <li>
              Tamanho: M: Cintura 55-65cm, quadril 70-80cm, peso 45-55kg / G: Cintura 60-70cm,
              quadril 75-85cm, peso 55-65kg / XL: Cintura 65-75cm, quadril 80-90cm, peso 65-75kg /
              XXL: Cintura 70-80cm, quadril 85-95cm, peso 75-85kg
            </li>
            <li>Cores: Preta, Bege e Vermelha</li>
          </ul>

          <h3 className="sb-desc-h3">Embalagem Contém</h3>
          <ul className="sb-desc-list">
            <li>01x Cinta Modeladora Cintura Alta - Slim Belly</li>
            <li>KIT 3 - 03 Cintas Modeladoras Cintura Alta - Slim Belly (Preta, Bege e Vermelha)</li>
            <li>
              KIT 5 - 05 Cintas Modeladoras Cintura Alta - Slim Belly (2x Pretas, 2x Bege e 01x
              Vermelha)
            </li>
          </ul>
        </div>
      </section>

      {/* SEÇÃO ANTES/DEPOIS */}
      <section className="sb-section" style={{ background: "#fff8f5" }}>
        <div className="sb-container">
          <h2 className="sb-h2" data-reveal style={{ textAlign: "center", marginBottom: 24 }}>
            Resultado real das nossas clientes
          </h2>
          <div
            data-reveal
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingBottom: 8,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {[
              { before: IMAGES[2], after: IMAGES[0] },
              { before: IMAGES[3], after: IMAGES[5] },
              { before: IMAGES[4], after: IMAGES[6] },
            ].map((pair, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 auto",
                  width: "min(320px, 85vw)",
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                  scrollSnapAlign: "start",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ position: "relative" }}>
                    <img src={pair.before} alt="Antes" loading="lazy" style={{ width: "100%", height: 240, objectFit: "cover", filter: "grayscale(.3) brightness(.92)" }} />
                    <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 4, letterSpacing: 0.5 }}>
                      ANTES
                    </span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <img src={pair.after} alt="Depois" loading="lazy" style={{ width: "100%", height: 240, objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: 8, left: 8, background: "var(--sb-cta)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 4, letterSpacing: 0.5 }}>
                      DEPOIS
                    </span>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", fontSize: 13, color: "#1a1a1a", fontWeight: 600, textAlign: "center" }}>
                  Resultado em poucas semanas de uso
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TABELA DE TAMANHOS */}

      <section className="sb-section sb-section-soft">
        <div className="sb-container">
          <h2 className="sb-h2" data-reveal>
            Tabela de Tamanhos
          </h2>
          <div className="sb-table-wrap" data-reveal>
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Tamanho</th>
                  <th>Cintura</th>
                  <th>Quadril</th>
                  <th>Peso</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row) => (
                  <tr key={row[0]}>
                    {row.map((c, i) => (
                      <td key={i}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. DEPOIMENTOS */}
      <section className="sb-section">
        <div className="sb-container">
          <h2 className="sb-h2" data-reveal>
            O que dizem nossas clientes
          </h2>
          <TestimonialsCarousel current={testimonial} setCurrent={setTestimonial} />
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sb-section sb-section-soft">
        <div className="sb-container sb-container-sm">
          <h2 className="sb-h2" data-reveal>
            Perguntas Frequentes
          </h2>
          <div className="sb-faq" data-reveal>
            {FAQS.map((f, i) => (
              <div key={i} className={`sb-faq-item ${openFaq === i ? "is-open" : ""}`}>
                <button
                  className="sb-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="sb-faq-icon">+</span>
                </button>
                <div className="sb-faq-a">
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA FINAL */}
      <section className="sb-final-cta">
        <div className="sb-container" data-reveal>
          <h2>Garanta já a sua com desconto de lançamento</h2>
          <p>Estoque limitado — Últimas unidades</p>
          <Link to="/checkout" className="sb-cta-light" onClick={ripple as any}>
            QUERO MINHA CINTA AGORA →
          </Link>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="sb-footer">
        <div className="sb-container sb-footer-grid">
          <div>
            <img src={logo} alt="ConfiaShop" className="sb-logo-img sb-logo-light" />
            <p className="sb-footer-text">
              Magazines Bytes
              <br />
              CNPJ: 08.792.763/0001-24
            </p>
          </div>
          <div>
            <h4>Atendimento</h4>
            <ul>
              <li>
                <a href="#">SAC</a>
              </li>
              <li>
                <a href="#">Política de Trocas</a>
              </li>
              <li>
                <a href="#">Rastreamento</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Pagamento</h4>
            <div className="sb-pay">
              <span>VISA</span>
              <span>MASTER</span>
              <span>ELO</span>
              <span>BOLETO</span>
              <span>PIX</span>
            </div>
          </div>
          <div>
            <h4>Segurança e Qualidade</h4>
            <div style={{ textAlign: "center", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <a href="https://www.sslshopper.com/ssl-checker.html#hostname=https://zuban.com.br" target="_blank" rel="noopener noreferrer">
                <img src="https://i.imgur.com/tqgH7PX.png" alt="SSL Seguro" width={83} loading="lazy" style={{ verticalAlign: "middle" }} />
              </a>
              <a href="https://transparencyreport.google.com/safe-browsing/search?url=https://zuban.com.br&hl=pt_BR" target="_blank" rel="noopener noreferrer">
                <img src="https://i.imgur.com/DZLVXlL.png" alt="Google Safe Browsing" width={83} loading="lazy" style={{ verticalAlign: "middle" }} />
              </a>
              <a href="https://transparencyreport.google.com/safe-browsing/search?url=https://zuban.com.br&hl=pt_BR" target="_blank" rel="noopener noreferrer">
                <img src="https://i.imgur.com/Jnct9y7.png" alt="Site Seguro" width={83} loading="lazy" style={{ verticalAlign: "middle" }} />
              </a>
            </div>
          </div>
        </div>
        <div className="sb-footer-bottom">
          Confia Shop LTDA — CNPJ: 64.119.790/0001-01 — Todos os direitos reservados
        </div>
      </footer>
      {/* Sticky mobile CTA */}
      <div className={`sb-sticky-cta ${!isCtaVisible ? "is-visible" : ""}`}>
        <Link to="/checkout" className="sb-cta sb-cta-primary" onClick={ripple}>
          🛒 COMPRAR AGORA — R$ 79,90
        </Link>
      </div>
    </div>
  );
}
