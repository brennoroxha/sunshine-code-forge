import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

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
          <a href="#" className="sb-logo">
            Slim Belly
          </a>
          <div className="sb-header-icons">
            <a
              href="https://wa.me/5500000000000"
              aria-label="WhatsApp"
              className="sb-icon-btn sb-icon-wa"
            >
              💬
            </a>
            <a href="#comprar" aria-label="Carrinho" className="sb-icon-btn">
              🛒
            </a>
          </div>
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

      {/* 4. BENEFÍCIOS */}
      <section className="sb-section">
        <div className="sb-container">
          <h2 className="sb-h2" data-reveal>
            Por que escolher a Slim Belly?
          </h2>
          <div className="sb-benefits">
            {[
              { i: "🧲", t: "Terapia Magnética", d: "Melhora a circulação sanguínea" },
              { i: "🏋️", t: "Controle de Barriga", d: "Cintura alta modeladora" },
              { i: "🍑", t: "Lifting de Bumbum", d: "Realça suas curvas naturais" },
              { i: "🌬️", t: "Tecido Respirável", d: "Conforto o dia todo" },
            ].map((b) => (
              <div key={b.t} className="sb-benefit" data-reveal>
                <div className="sb-benefit-icon">{b.i}</div>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA */}
      <section className="sb-section sb-dark">
        <div className="sb-container">
          <h2 className="sb-h2 sb-h2-light" data-reveal>
            Como funciona
          </h2>
          <div className="sb-steps">
            {[
              { n: "01", t: "Vista a Cinta", d: "Coloque com facilidade, ajustando suavemente." },
              { n: "02", t: "Sinta o Suporte", d: "Tecido firme abraça e modela na hora." },
              { n: "03", t: "Exiba sua Silhueta", d: "Curvas realçadas com total conforto." },
            ].map((s, i) => (
              <div key={s.n} className="sb-step" data-reveal>
                <div className="sb-step-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                {i < 2 && <div className="sb-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. GALERIA RESULTADOS */}
      <section className="sb-section">
        <div className="sb-container">
          <h2 className="sb-h2" data-reveal>
            Resultados Reais de Clientes
          </h2>
          <div className="sb-results">
            {IMAGES.slice(0, 6).map((src) => (
              <div key={src} className="sb-result" data-reveal>
                <img src={src} alt="Resultado cliente" loading="lazy" />
                <div className="sb-result-overlay" />
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
            <div className="sb-logo sb-logo-light">Slim Belly</div>
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
