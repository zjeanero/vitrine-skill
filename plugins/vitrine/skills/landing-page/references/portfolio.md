# Portfólio e site de estúdio: movimento avançado

Portfólio de designer, ilustrador, fotógrafo, arquiteto, estúdio ou agência tem um público que **quer ser surpreendido** e fica na página para explorar. Aqui cabe o que não cabe na padaria: rolagem suave, título que entra por linhas, galeria que corre na horizontal, um objeto em 3D. O método continua o mesmo, e o movimento serve ao conceito.

## Quando usar

- **Use** em portfólio, site pessoal criativo, estúdio, agência, artista e marca cujo produto é a própria imagem.
- **Não use** em negócio local. Lá, quem chega quer o horário e o WhatsApp. Nesses sites vale o `stack.md`: CSS e, no máximo, um momento pontual.
- **O cliente é a pessoa.** Na escavação, o inventário vem do ofício dela: caderno de esboços, ferramentas, arquivos, processo, o que fica na mesa. O momento-assinatura costuma nascer daí. O papel do ilustrador, a luz do fotógrafo e a planta do arquiteto são pontos de partida melhores que qualquer efeito da moda.

## Bibliotecas, por CDN e com versão fixa

```html
<head>
  <script>document.documentElement.classList.add('js')</script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.css">
</head>
<body>
  …
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
  <script src="assets/js/movimento.js"></script>
</body>
```

- **GSAP:** é grátis desde 2025, inclusive os plugins (ScrollTrigger, SplitText, MorphSVG). Carregue só os plugins que a página usa.
- **Lenis:** dá a rolagem suave. O `movimento.js` só liga com mouse; no toque, fica a rolagem nativa do celular.
- **Three.js:** só quando houver um objeto ou efeito 3D que venha do conceito (veja abaixo).
- **Versão nova:** confira se a versão existe no jsDelivr e se tem pelo menos duas semanas.

## A base: `scripts/movimento/movimento.js`

Copie para `assets/js/movimento.js`. Ele liga o Lenis ao ScrollTrigger, respeita `prefers-reduced-motion` e entende quatro marcações:

| Marcação | Efeito | Onde usar |
|---|---|---|
| `data-revelar` | Entra uma vez, ao aparecer | Blocos de projeto e legendas. Não em tudo |
| `data-dividir="linhas"` ou `"palavras"` | O texto sai de uma máscara, linha por linha | O título principal e um ou dois títulos de seção |
| `data-paralaxe="0.15"` | Anda mais devagar que a rolagem | Imagens de projeto, de 0.1 a 0.2. Nunca em texto |
| `data-horizontal` com um filho `data-trilho` | A seção fica fixa e os projetos correm na horizontal | Galeria de projetos, só no computador |

No CSS, esconda só quando o JS estiver ativo: `.js [data-revelar], .js [data-dividir] { visibility: hidden; }`. O script mostra. Se o CDN falhar, tudo aparece no lugar.

No celular, `data-horizontal` não faz nada. Escreva o CSS do trilho para empilhar os projetos, ou para rolar de lado com `scroll-snap`.

**O momento-assinatura se escreve à parte,** com o GSAP direto, a partir do conceito. As marcações são o básico. Um portfólio que só usa as quatro fica com cara de template de portfólio.

## 3D com Three.js

Use só quando o 3D for o próprio conceito: o papel amassado do ilustrador, a maquete do arquiteto, a luz que o fotógrafo controla. Partícula, blob iridescente e "esfera que segue o mouse" não contam.

```html
<canvas class="cena" aria-hidden="true"></canvas>
<script type="module">
  const canvas = document.querySelector('.cena');
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Só baixa o Three quando a cena está perto de aparecer.
  new IntersectionObserver(async ([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 5;
    // … a cena do conceito …
    const ajustar = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    new ResizeObserver(ajustar).observe(canvas); ajustar();
    let visivel = true;
    new IntersectionObserver(([x]) => { visivel = x.isIntersecting; }).observe(canvas);
    renderer.setAnimationLoop((t) => {
      if (!visivel) return;               // fora da tela, não gasta bateria
      // … animação …
      renderer.render(scene, camera);
      if (calmo) renderer.setAnimationLoop(null); // movimento reduzido: um quadro só
    });
  }, { rootMargin: '200px' }).observe(canvas);
</script>
```

- **Sem WebGL,** em celular antigo ou com o bloqueio do navegador, a página precisa continuar bonita. Ponha uma imagem ou um desenho em SVG atrás do canvas.
- **Na página aberta do arquivo (`file://`),** `import` de CDN funciona, mas `import` de arquivo local não. Escreva o módulo dentro do HTML ou carregue tudo do CDN.

## O que já virou clichê de portfólio

Assim como o `anti-padroes.md` lista os vícios de landing page, estes são os de portfólio "premiado". Evite, a menos que o conceito peça e você consiga explicar o porquê:

- tela de carregamento contando de 0 a 100%;
- bolinha que segue o mouse e cresce em cima dos links;
- faixa infinita com "AVAILABLE FOR WORK" ou "LET'S TALK";
- granulado por cima da página inteira;
- blob 3D iridescente ou chuva de partículas;
- rolagem suave exagerada, que dá enjoo (o `lerp` padrão do Lenis já basta);
- menu de tela cheia em que a imagem do projeto segue o mouse;
- título gigante em fonte de 2ª ordem (veja `tipografia.md`).

## Desempenho e acessibilidade

- **Peso:** no máximo uns 150 KB de JS (comprimido) na primeira tela. GSAP com ScrollTrigger e SplitText, mais o Lenis, dá uns 60 KB. O Three passa de 150 KB sozinho, por isso só entra perto da cena.
- **Imagens de projeto:** AVIF ou WebP, com `srcset` e `loading="lazy"` fora da primeira tela.
- **Teclado:** o Lenis não sequestra o teclado nem as âncoras. Não use nada que trave a rolagem (`scroll-jacking`) ou que obrigue a passar por uma animação para chegar ao conteúdo.
- **Movimento reduzido:** o `movimento.js` já respeita. No código próprio, sempre consulte `prefers-reduced-motion`.

## Revisão

- **Prints:** o `screenshot.mjs` rola a página antes dos prints, então tudo que usa `once: true` já aparece revelado.
- **Seções fixas (`pin`):** ficam melhores nas telas roladas do que na página inteira. Confira pela folha de contato.
- **A animação não aparece em print.** Descreva no `NOTAS.md` o que se move e quando. Na revisão, confira três coisas:
  - o estado final;
  - que nada fica escondido se o JS falhar (abra com o JS desligado, ou confira se o CSS só esconde com `.js`);
  - que o `report.json` não tem erro de JS.
