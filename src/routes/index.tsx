import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, Package, PackageCheck } from "lucide-react";
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

const TESTIMONIALS = [
  {
    initials: "M.S.",
    name: "Marina Souza",
    city: "São Paulo, SP",
    text: "Adorei! A cinta é super confortável e modela muito bem. Uso o dia todo no trabalho sem incomodar.",
  },
  {
    initials: "A.R.",
    name: "Amanda Ribeiro",
    city: "Rio de Janeiro, RJ",
    text: "Resultado imediato! A cintura fica marcada e o bumbum mais empinado. Comprei outra para presentear minha irmã.",
  },
  {
    initials: "C.P.",
    name: "Carla Pereira",
    city: "Belo Horizonte, MG",
    text: "Tecido respirável de verdade, não esquenta. Vale cada centavo, recomendo demais!",
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
  const [deliveryDates, setDeliveryDates] = useState<{ placed: string; processed: string; delivered: string } | null>(null);

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
            <span className="sb-badge sb-badge-best">🏆 MAIS VENDIDO</span>
            <h1 className="sb-title">KIT 02 Cinta Modeladora Cintura Alta — Slim Belly</h1>
            <div className="sb-rating">
              <span className="sb-stars">⭐⭐⭐⭐⭐</span>
              <strong>4.9</strong>
              <span className="sb-muted">· 2.847 avaliações</span>
            </div>

            <div className="sb-price">
              <span className="sb-price-new">R$ 79,90</span>
            </div>

            <div className="sb-selector">
              <label className="sb-label">
                Cores (escolha 2):{" "}
                <strong>{colors.map((i) => COLORS[i].name).join(" + ")}</strong>
              </label>
              <div className="sb-swatches">
                {COLORS.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setColors((prev) =>
                        toggleSelection(prev, i, 2, (added) => setMainImg(COLORS[added].imgIndex)),
                      );
                    }}
                    className={`sb-swatch ${colors.includes(i) ? "is-active" : ""}`}
                    aria-label={c.name}
                    title={c.name}
                  >
                    <img src={IMAGES[c.imgIndex]} alt={c.name} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            <div className="sb-selector">
              <label className="sb-label">
                Tamanhos (escolha 2):{" "}
                <strong>{sizes.map((i) => SIZES[i]).join(" + ")}</strong>
              </label>
              <div className="sb-sizes">
                {SIZES.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSizes((prev) => toggleSelection(prev, i, 2))}
                    className={`sb-size ${sizes.includes(i) ? "is-active" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <a href="#comprar" className="sb-cta sb-cta-primary" onClick={ripple}>
              🛒 COMPRAR AGORA
            </a>

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

            <div className="sb-trust">
              <span>🔒 Compra Segura</span>
              <span>🔄 Troca em 7 dias</span>
              <span>🚚 Frete Grátis</span>
              <span>✅ 30 dias de garantia</span>
            </div>

            <div className="sb-social-count">
              <span className="sb-pulse" /> 👁️ 21 pessoas estão vendo agora
            </div>
          </div>
        </div>
      </section>

      {/* 4. DESCRIÇÃO */}
      <section className="sb-section">
        <div className="sb-container sb-container-sm">
          <h2 className="sb-h2" data-reveal>
            Cinta Modeladora Cintura Alta - Slim Belly
          </h2>

          <div className="sb-desc-img" data-reveal>
            <img src={desc1} alt="Elasticidade Superior em Quatro Direções" loading="lazy" />
          </div>

          <p className="sb-desc-text" data-reveal>
            A Cinta Modeladora Cintura Alta - Slim Belly é a escolha ideal para quem busca conforto
            e eficácia na modelagem corporal. Seu design sem costura elimina qualquer desconforto,
            enquanto a cintura alta oferece um controle efetivo do abdômen, realçando a silhueta
            natural. Além disso, a peça incorpora terapia magnética que ajuda a melhorar a
            circulação sanguínea e reduzir as cólicas menstruais. Com suporte sem fio que elimina
            qualquer pressão desconfortável, esta calcinha ajuda a atingir o formato desejado de
            maneira sutil e natural, sendo perfeita para o uso diário.
          </p>

          <div className="sb-desc-img" data-reveal>
            <img src={desc2} alt="Tecido antibacteriano e ativação térmica" loading="lazy" />
          </div>

          <div className="sb-desc-img" data-reveal>
            <img src={desc3} alt="Tabela de tamanhos Slim Belly" loading="lazy" />
          </div>

          <h3 className="sb-desc-h3" data-reveal>
            Características
          </h3>
          <ul className="sb-desc-list" data-reveal>
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

          <h3 className="sb-desc-h3" data-reveal>
            Embalagem Contém
          </h3>
          <ul className="sb-desc-list" data-reveal>
            <li>01x Cinta Modeladora Cintura Alta - Slim Belly</li>
            <li>KIT 3 - 03 Cintas Modeladoras Cintura Alta - Slim Belly (Preta, Bege e Vermelha)</li>
            <li>
              KIT 5 - 05 Cintas Modeladoras Cintura Alta - Slim Belly (2x Pretas, 2x Bege e 01x
              Vermelha)
            </li>
          </ul>
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
          <div className="sb-testimonial" data-reveal>
            <div className="sb-avatar">{TESTIMONIALS[testimonial].initials}</div>
            <div className="sb-stars sb-stars-big">⭐⭐⭐⭐⭐</div>
            <p className="sb-quote">"{TESTIMONIALS[testimonial].text}"</p>
            <div className="sb-author">
              <strong>{TESTIMONIALS[testimonial].name}</strong>
              <span>{TESTIMONIALS[testimonial].city}</span>
            </div>
            <div className="sb-carousel-nav">
              <button
                onClick={() =>
                  setTestimonial((t) => (t - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
                }
                aria-label="Anterior"
              >
                ←
              </button>
              <div className="sb-dots">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    className={`sb-dot ${testimonial === i ? "is-active" : ""}`}
                    onClick={() => setTestimonial(i)}
                    aria-label={`Depoimento ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setTestimonial((t) => (t + 1) % TESTIMONIALS.length)}
                aria-label="Próximo"
              >
                →
              </button>
            </div>
          </div>
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
          <a href="#comprar" className="sb-cta-light" onClick={ripple}>
            QUERO MINHA CINTA AGORA →
          </a>
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
            <h4>Segurança</h4>
            <div className="sb-pay">
              <span>🔒 SSL</span>
              <span>✅ SITE SEGURO</span>
            </div>
          </div>
        </div>
        <div className="sb-footer-bottom">
          Magazines Bytes — Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
