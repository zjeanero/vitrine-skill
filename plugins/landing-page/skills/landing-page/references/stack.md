# Stack e implementação

## Estrutura padrão (HTML estático)

```
<cliente>/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js        (só se houver interação)
│   ├── img/
│   └── fonts/            (se as fontes forem hospedadas junto)
├── screenshots/
└── NOTAS.md
```

A página deve abrir com duplo clique (`file://`), sem servidor nem build. Isso facilita a revisão e os screenshots, e permite publicar em qualquer lugar.

## Com PHP, quando houver motivo

- **Partes repetidas em várias páginas:** `includes/cabecalho.php` e `includes/rodape.php`, carregados com `<?php include __DIR__ . '/includes/rodape.php'; ?>`.
- **Formulário:** `contato.php` que:
  - valida os dados no servidor;
  - tem um campo honeypot contra spam;
  - envia por SMTP com PHPMailer (instalado pelo Composer), porque o `mail()` da hospedagem compartilhada costuma cair no spam;
  - redireciona com mensagem de sucesso ou erro (padrão Post/Redirect/Get).
- **PHP só acrescenta:** o HTML final é o mesmo da versão estática, então a revisão visual continua valendo.
- **Publicação:**
  - hospedagem compartilhada (Hostinger, HostGator, Locaweb etc.): envio por FTP ou pelo gerenciador de arquivos;
  - HTML puro: também pode ir de graça para Netlify, Cloudflare Pages ou GitHub Pages.

## CSS

Comece pelos tokens, nomeando as cores pela origem no conceito:

```css
:root {
  --papel:   oklch(97% 0.01 85);
  --tinta:   oklch(22% 0.02 60);
  --carbono: oklch(62% 0.12 15);
  --voz:   "Fonte Display", serif;
  --texto-fonte: "Fonte de Texto", sans-serif;
  --espaco-1: 0.5rem; --espaco-2: 1rem; --espaco-3: 2rem; --espaco-4: 4rem; --espaco-5: clamp(4rem, 10vw, 9rem);
}
```

Nomes como `--papel`, `--giz` e `--ferrugem` mantêm o conceito vivo enquanto você escreve o CSS. Nomes como `--primary` e `--accent` puxam de volta para o genérico.

- **Layout:**
  - Grid, com grades assimétricas;
  - largura máxima diferente de uma seção para outra;
  - seções que sangram até a borda quando o conceito pede.
- **Mobile-first:** os estilos base valem para 390px, e `@media (min-width: …)` faz a página crescer.
- **CSS moderno com bom suporte em 2026:** `clamp()`, `min()`/`max()`, `:has()`, `color-mix()`, `oklch()`, `text-wrap`, subgrid, container queries, `position: sticky`, `aspect-ratio`, `@layer`.
- **Melhoria progressiva:** animações ligadas à rolagem (`animation-timeline: view()`) e View Transitions entram dentro de `@supports`.
- **Seções que empilham** (como no dão): cada seção com `position: sticky; top: 0` e altura de tela cobre a anterior ao rolar, sem biblioteca. No celular, confira se o conteúdo cabe na tela; se não couber, desligue o efeito.

## Movimento

- Um momento coreografado que reforça o conceito vale mais que fade-up em tudo.
- Prefira CSS (transições, `@keyframes`, `animation-timeline`) com IntersectionObserver. Use biblioteca (GSAP etc.) só para um efeito que o CSS não resolva, carregada por CDN com versão fixa.
- **O conteúdo nunca depende da animação para aparecer.** Se algo começa invisível para "entrar" depois, esconda só quando o JS estiver rodando: um script inline no `<head>` coloca a classe `js` no `<html>`, e o CSS esconde apenas com `.js .revelar`. Se o JS falhar, tudo continua visível.
- **Sempre inclua:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Imagens

- **Fotos reais do cliente:**
  - exporte em WebP (qualidade 75–80) nos tamanhos realmente usados;
  - use `<img>` com `width`, `height`, `alt` e `loading`;
  - use `<picture>` se quiser oferecer AVIF.
- **Tratamento como sistema:** escolha um tratamento e aplique em todas as fotos, para que fotos de celular do cliente fiquem coerentes. É isso que transforma foto amadora em direção de arte.
  - Opções: duotone, preto e branco com uma cor, recorte com contorno, granulação, moldura do artefato.
  - Ferramentas: `filter`, `mix-blend-mode` ou filtro SVG (`feColorMatrix`) para duotone.
- **Sem foto: "foto pendente" dirigida.** Estilize com a paleta e a tipografia de rótulo do conceito, nunca como caixa cinza com um X. Numere cada uma e repita a lista no `NOTAS.md`.

```html
<figure class="foto-pendente" style="aspect-ratio: 4 / 5">
  <figcaption>FOTO 03 · Mãos ajustando a peça na bancada, luz lateral da janela, fundo escuro</figcaption>
</figure>
```

- **Grafismos:** SVG inline desenhado a partir do artefato (carimbo, selo, símbolo, mapa simplificado do bairro).
- **Sem banco de imagens nem hotlink do Unsplash como solução final.** Se o usuário pedir imagens provisórias, marque-as como provisórias no `NOTAS.md`.

## Ícones

Poucos ícones, em SVG inline e desenhados a partir do conceito, ou nenhum ícone. A exceção é o ícone do WhatsApp, que deve continuar reconhecível.

## Checklist técnico antes da revisão visual

- **HTML:** semântico (`header`, `main`, `section` com heading, `footer`) e com um único `h1`.
- **Metadados:** meta tags, Open Graph e JSON-LD, conforme `negocio-local.md`.
- **Links:** WhatsApp, `tel:` e mapa no formato correto.
- **Conteúdo:** nada depende de JavaScript para aparecer.
- **Celular:** sem rolagem horizontal em 390px; o `report.json` do screenshot confirma.
- **Vazamento escondido:** não use `overflow-x: hidden` ou `clip` no `html`/`body` para esconder um vazamento. Ele continua lá, só que cortado: botões e barras fixas ficam pela metade na borda da tela. Ache e corrija o elemento que vaza; o `report.json` lista os culpados em `overflowingElements` e `cortadoNaBorda`.
- **Elementos girando ou se movendo** (selos rotativos, letreiros) mudam de tamanho durante a animação e podem vazar só em alguns quadros. Deixe folga ou recorte o elemento dentro do próprio container.
- **Fontes:** sem `preload` de fonte enquanto o site é aberto do arquivo (veja `tipografia.md`).
