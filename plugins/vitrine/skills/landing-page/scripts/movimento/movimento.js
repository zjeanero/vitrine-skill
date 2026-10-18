// Base de movimento para portfólio e site de estúdio: rolagem suave (Lenis) ligada ao GSAP ScrollTrigger,
// mais quatro marcações prontas. Isto é encanamento, não efeito: o momento-assinatura de cada site
// se escreve à parte, a partir do conceito (veja references/portfolio.md).
//
// Carregue antes, por CDN e com versão fixa: lenis.css, gsap.min.js, ScrollTrigger.min.js,
// SplitText.min.js (só se usar data-dividir) e lenis.min.js.
// No <head>: <script>document.documentElement.classList.add('js')</script>
// No CSS:    .js [data-revelar], .js [data-dividir] { visibility: hidden; }   (o script mostra)
//
// Marcações:
//   data-revelar                    entra uma vez, ao aparecer
//   data-dividir="linhas|palavras"  o texto entra por linhas ou palavras, saindo de uma máscara
//   data-paralaxe="0.15"            anda mais devagar que a rolagem (negativo: mais rápido). Para imagens, não texto.
//   data-horizontal                 no computador, a seção fica fixa e o filho [data-trilho] corre na horizontal.
//                                   No celular, nada acontece: deixe o CSS empilhar ou rolar o trilho.
//
// Com prefers-reduced-motion, nada se mexe: tudo aparece no lugar e a rolagem é a nativa.

(() => {
  const ocultos = () => document.querySelectorAll('[data-revelar], [data-dividir]');
  const mostrar = (els) => els.forEach((el) => { el.style.visibility = 'visible'; });

  if (!window.gsap || !window.ScrollTrigger) {
    mostrar(ocultos());
    console.warn('movimento.js: o GSAP ou o ScrollTrigger não carregou; a página segue sem animação.');
    return;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mostrar(ocultos());
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  // Rolagem suave só com mouse. No toque, a rolagem nativa do celular é melhor e mais leve.
  let lenis = null;
  if (window.Lenis && matchMedia('(pointer: fine)').matches) {
    lenis = new Lenis({ autoRaf: false, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.movimento = { lenis };

  gsap.utils.toArray('[data-revelar]').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 32 }, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray('[data-dividir]').forEach((el) => {
    el.style.visibility = 'visible';
    if (!window.SplitText) return;
    const tipo = el.dataset.dividir === 'palavras' ? 'words' : 'lines';
    SplitText.create(el, {
      type: tipo, mask: tipo, autoSplit: true,
      onSplit: (s) => gsap.from(s[tipo], {
        yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });

  gsap.utils.toArray('[data-paralaxe]').forEach((el) => {
    const f = parseFloat(el.dataset.paralaxe) || 0.15;
    gsap.to(el, { yPercent: -100 * f, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  gsap.matchMedia().add('(min-width: 900px)', () => {
    gsap.utils.toArray('[data-horizontal]').forEach((secao) => {
      const trilho = secao.querySelector('[data-trilho]');
      if (!trilho) return;
      const distancia = () => Math.max(0, trilho.scrollWidth - secao.clientWidth);
      gsap.to(trilho, {
        x: () => -distancia(), ease: 'none',
        scrollTrigger: { trigger: secao, start: 'top top', end: () => '+=' + distancia(), pin: true, scrub: 1, invalidateOnRefresh: true },
      });
    });
  });

  // Fontes e imagens mudam as alturas depois do carregamento: recalcula os gatilhos.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
