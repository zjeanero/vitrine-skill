#!/usr/bin/env node
// Gera a página de aprovação: um HTML único (funciona offline, no celular e publicado no claude.ai)
// com 2-3 prints por site, carimbos Aprovado / Em dúvida / Não aprovado, conferência do que
// funcionou e do que não funcionou, anotações e, em grupos com mais de uma versão, a escolha de qual
// vai para o cliente. O botão "Assinar e copiar resultado" gera um texto para colar no Claude.
//
// Uso:
//   node aprovacao.mjs <manifesto.json> <saida.html> [--artefato]
//
//   --artefato  gera sem <!doctype>/<html>/<head>/<body>, no formato que o claude.ai espera ao publicar.
//
// Manifesto (caminhos de imagem relativos ao próprio manifesto):
//   {
//     "lote": "iteracao-1",
//     "titulo": "Prova da rodada 1",
//     "cego": true,                       // true: dentro de cada grupo, mostra "Versão A/B" em ordem aleatória
//     "itens": [
//       { "id": "padaria-com", "grupo": "Padaria Fermento & Lenha", "rotulo": "Com a skill",
//         "imagens": { "desktop": "a/desktop-01.png", "celular": "a/mobile-01.png", "inteira": "a/desktop-full.jpg" } }
//     ]
//   }
//
// Saídas: <saida.html> e, no modo cego, <saida>-chaves.json (qual versão é qual; não mande ao avaliador).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { randomBytes } from 'node:crypto';

const args = process.argv.slice(2);
const [manPath, outPath] = args.filter((a) => !a.startsWith('--'));
const fragment = args.includes('--artefato');
if (!manPath || !outPath) {
  console.error('Uso: node aprovacao.mjs <manifesto.json> <saida.html> [--artefato]');
  process.exit(1);
}

const man = JSON.parse(readFileSync(manPath, 'utf8'));
const base = dirname(resolve(manPath));
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const embed = (p) => {
  if (!p) return null;
  const f = resolve(base, p);
  if (!existsSync(f)) {
    console.warn(`Aviso: imagem não encontrada: ${f}`);
    return null;
  }
  return `data:${MIME[extname(f).toLowerCase()] || 'application/octet-stream'};base64,${readFileSync(f).toString('base64')}`;
};

// Agrupa e, no modo cego, embaralha dentro de cada grupo e troca os ids por códigos opacos.
const groups = new Map();
for (const it of man.itens) {
  if (!groups.has(it.grupo)) groups.set(it.grupo, []);
  groups.get(it.grupo).push(it);
}
const keys = {};
const cards = [];
for (const [grupo, its] of groups) {
  const list = man.cego ? [...its].sort(() => Math.random() - 0.5) : its;
  list.forEach((it, i) => {
    const code = man.cego ? randomBytes(3).toString('hex') : it.id;
    keys[code] = { id: it.id, grupo, rotulo: it.rotulo ?? null };
    cards.push({
      codigo: code,
      grupo,
      nome: man.cego ? `Versão ${String.fromCharCode(65 + i)}` : it.rotulo || it.id,
      imagens: {
        desktop: embed(it.imagens?.desktop),
        celular: embed(it.imagens?.celular),
        inteira: embed(it.imagens?.inteira),
      },
    });
  });
}

const data = { lote: man.lote, titulo: man.titulo || 'Prova de aprovação', cego: Boolean(man.cego), cards };

const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(data.titulo)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@700;800&family=Fragment+Mono&family=Schibsted+Grotesk:wght@400;600&display=swap">
<style>
/* Folhas de prova sobre a base de corte: cada site é uma folha com marcas de corte,
   o veredito é um carimbo e a escolha final diz o que vai para o cliente. */
:root {
  --mesa: oklch(89% 0.03 158);
  --grade: oklch(84.5% 0.032 158);
  --grade-forte: oklch(79% 0.04 158);
  --sobre-mesa: oklch(24% 0.03 170);
  --sobre-mesa-suave: oklch(40% 0.03 170);
  --folha: oklch(99.4% 0.002 158);
  --tinta: oklch(23% 0.02 255);
  --tinta-suave: oklch(47% 0.02 255);
  --fio: oklch(88% 0.01 255);
  --aprova: oklch(47% 0.12 150);
  --duvida: oklch(55% 0.13 68);
  --reprova: oklch(50% 0.19 27);
  --ciano: oklch(70% 0.14 225);
  --magenta: oklch(57% 0.24 355);
  --amarelo: oklch(90% 0.17 102);
  --faixa: oklch(23% 0.02 255);
  --faixa-texto: oklch(97% 0.005 158);
  --foco: oklch(55% 0.2 262);
  --sombra: oklch(30% 0.05 170 / .22);
  --vela: oklch(15% 0.02 255 / .9);
  --display: "Big Shoulders", "Arial Narrow", Impact, sans-serif;
  --texto: "Schibsted Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "Fragment Mono", ui-monospace, Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --mesa: oklch(29% 0.045 165); --grade: oklch(33.5% 0.048 165); --grade-forte: oklch(38% 0.055 165);
    --sobre-mesa: oklch(95% 0.01 158); --sobre-mesa-suave: oklch(80% 0.02 158);
    --folha: oklch(96.5% 0.004 158); --fio: oklch(85% 0.01 255);
    --faixa: oklch(15% 0.02 255); --faixa-texto: oklch(96% 0.005 158);
    --sombra: oklch(8% 0.02 170 / .6); --vela: oklch(8% 0.01 255 / .92);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --mesa: oklch(29% 0.045 165); --grade: oklch(33.5% 0.048 165); --grade-forte: oklch(38% 0.055 165);
  --sobre-mesa: oklch(95% 0.01 158); --sobre-mesa-suave: oklch(80% 0.02 158);
  --folha: oklch(96.5% 0.004 158); --fio: oklch(85% 0.01 255);
  --faixa: oklch(15% 0.02 255); --faixa-texto: oklch(96% 0.005 158);
  --sombra: oklch(8% 0.02 170 / .6); --vela: oklch(8% 0.01 255 / .92);
  color-scheme: dark;
}

* { box-sizing: border-box; }
[hidden] { display: none !important; }
body {
  margin: 0;
  color: var(--sobre-mesa);
  background-color: var(--mesa);
  background-image:
    linear-gradient(var(--grade-forte) 1px, transparent 1px), linear-gradient(90deg, var(--grade-forte) 1px, transparent 1px),
    linear-gradient(var(--grade) 1px, transparent 1px), linear-gradient(90deg, var(--grade) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
  font: 16px/1.5 var(--texto);
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
}
.miolo { max-width: 1040px; margin-inline: auto; }
button { font: inherit; }
button:focus-visible, textarea:focus-visible { outline: 3px solid var(--foco); outline-offset: 3px; }
.rotulo { font: 400 .72rem/1.3 var(--mono); letter-spacing: .08em; text-transform: uppercase; }

/* ---------- cabeçalho ---------- */
.cabecalho { display: grid; gap: 14px; padding-block: 36px 8px; }
.barra-cor { display: flex; gap: 0; width: max-content; border: 1px solid var(--sobre-mesa-suave); }
.barra-cor i { width: 22px; height: 14px; }
.barra-cor .c { background: var(--ciano); } .barra-cor .m { background: var(--magenta); }
.barra-cor .y { background: var(--amarelo); } .barra-cor .k { background: var(--tinta); }
.barra-cor .t1 { background: color-mix(in oklch, var(--tinta) 70%, var(--folha)); }
.barra-cor .t2 { background: color-mix(in oklch, var(--tinta) 40%, var(--folha)); }
.barra-cor .t3 { background: color-mix(in oklch, var(--tinta) 15%, var(--folha)); }
.meta { margin: 0; color: var(--sobre-mesa-suave); }
h1 { margin: 0; font: 800 clamp(2.5rem, 1.3rem + 5.4vw, 4.8rem)/.9 var(--display); text-transform: uppercase; letter-spacing: .005em; text-wrap: balance; max-width: 16ch; }
.ajuda { margin: 0; max-width: 62ch; color: var(--sobre-mesa-suave); }

/* ---------- grupos e folhas ---------- */
.grupo { padding-block: 26px 0; }
.grupo-topo { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; margin-inline: 14px; }
.grupo h2 { margin: 0; font: 700 clamp(1.5rem, 1.1rem + 1.6vw, 2.2rem)/1 var(--display); text-transform: uppercase; letter-spacing: .01em; text-wrap: balance; }
.grupo-topo .rotulo { color: var(--sobre-mesa-suave); }

.folha {
  position: relative; background: var(--folha); color: var(--tinta);
  margin: 30px 14px; padding: clamp(18px, 3vw, 30px);
  box-shadow: 0 1px 0 var(--fio), 0 22px 34px -26px var(--sombra);
  display: grid; gap: 18px;
}
/* marcas de corte nos quatro cantos, do lado de fora da folha */
.folha::before {
  content: ""; position: absolute; inset: -14px; pointer-events: none;
  --m: var(--sobre-mesa-suave);
  background:
    linear-gradient(var(--m) 0 0) left 0 top 13px / 10px 1px no-repeat, linear-gradient(var(--m) 0 0) left 13px top 0 / 1px 10px no-repeat,
    linear-gradient(var(--m) 0 0) right 0 top 13px / 10px 1px no-repeat, linear-gradient(var(--m) 0 0) right 13px top 0 / 1px 10px no-repeat,
    linear-gradient(var(--m) 0 0) left 0 bottom 13px / 10px 1px no-repeat, linear-gradient(var(--m) 0 0) left 13px bottom 0 / 1px 10px no-repeat,
    linear-gradient(var(--m) 0 0) right 0 bottom 13px / 10px 1px no-repeat, linear-gradient(var(--m) 0 0) right 13px bottom 0 / 1px 10px no-repeat;
}
.folha-topo { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; border-bottom: 1px solid var(--tinta); padding-bottom: 10px; }
.folha-topo .rotulo { color: var(--tinta-suave); }
.folha h3 { margin: 0; font: 600 1.15rem/1.25 var(--texto); min-width: 0; }

.prints { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
.prints button { all: unset; cursor: zoom-in; flex: none; display: grid; gap: 6px; }
.prints button:focus-visible { outline: 3px solid var(--foco); outline-offset: 3px; }
.prints img { display: block; height: clamp(170px, 24vw, 230px); width: auto; max-width: none; border: 1px solid var(--fio); background: var(--folha); }
.prints .inteira img { width: clamp(110px, 14vw, 150px); object-fit: cover; object-position: top; }
.prints .rotulo { color: var(--tinta-suave); }

/* carimbos */
.carimbos { display: flex; flex-wrap: wrap; gap: 12px; }
.carimbo {
  font: 800 1.05rem/1 var(--display); text-transform: uppercase; letter-spacing: .1em;
  color: var(--tinta-suave); background: transparent; border: 2px solid currentColor; border-radius: 3px;
  box-shadow: inset 0 0 0 3px var(--folha), inset 0 0 0 4px currentColor;
  padding: 12px 16px; min-height: 46px; cursor: pointer; opacity: .55;
  transition: opacity .15s, color .15s;
}
.carimbo:hover { opacity: 1; }
.carimbo[data-v="aprovado"]:hover, .carimbo[data-v="aprovado"][aria-pressed="true"] { color: var(--aprova); }
.carimbo[data-v="duvida"]:hover, .carimbo[data-v="duvida"][aria-pressed="true"] { color: var(--duvida); }
.carimbo[data-v="nao"]:hover, .carimbo[data-v="nao"][aria-pressed="true"] { color: var(--reprova); }
.carimbo[aria-pressed="true"] {
  opacity: 1; transform: rotate(-4deg); filter: url(#tinta);
  background: color-mix(in oklch, currentColor 8%, transparent);
  animation: bater .3s cubic-bezier(.2, .9, .3, 1.25);
}
@keyframes bater { from { transform: rotate(-4deg) scale(1.4); opacity: 0; } }

/* conferência */
.conferencia { display: grid; gap: 18px; }
.coluna .rotulo { margin: 0 0 4px; }
.coluna[data-lado="gostei"] > .rotulo { color: var(--aprova); }
.coluna[data-lado="naocurti"] > .rotulo { color: var(--reprova); }
.lista { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; }
.item {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 40px; padding: 8px 2px;
  background: transparent; border: 0; border-bottom: 1px dashed var(--fio); color: var(--tinta);
  font: 400 .85rem/1.25 var(--mono); text-align: left; cursor: pointer;
}
.caixa { width: 16px; height: 16px; flex: none; border: 1.5px solid var(--tinta-suave); display: grid; place-items: center; font: 700 12px/1 var(--mono); }
.item[data-chip="gostei"][aria-pressed="true"] .caixa { border-color: var(--aprova); color: var(--aprova); }
.item[data-chip="gostei"][aria-pressed="true"] .caixa::after { content: "✓"; }
.item[data-chip="naocurti"][aria-pressed="true"] .caixa { border-color: var(--reprova); color: var(--reprova); }
.item[data-chip="naocurti"][aria-pressed="true"] .caixa::after { content: "✕"; }

/* anotações pautadas */
.notas { display: grid; gap: 4px; }
.notas .rotulo { color: var(--tinta-suave); }
.anotacao {
  width: 100%; min-height: 86px; resize: vertical; border: 0; padding: 0 4px;
  color: var(--tinta); font: 400 15px/28px var(--texto);
  background-color: var(--folha); background-attachment: local;
  background-image: repeating-linear-gradient(transparent 0 27px, var(--fio) 27px 28px);
}

/* decisão: qual vai para o cliente */
.decisao { border-top: 4px solid var(--tinta); }
.decisao h3 { font: 800 clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem)/1 var(--display); text-transform: uppercase; letter-spacing: .02em; }
.decisao p { margin: 0; color: var(--tinta-suave); }
.opcoes { display: flex; flex-wrap: wrap; gap: 10px; }
.opcao {
  background: transparent; color: var(--tinta); border: 1.5px solid var(--tinta); border-radius: 3px;
  padding: 11px 15px; min-height: 46px; cursor: pointer; font: 600 .95rem/1.2 var(--texto); text-align: left;
}
.opcao[aria-pressed="true"] { background: var(--tinta); color: var(--folha); }
.opcao[aria-pressed="true"]::before { content: "✓ "; }

/* faixa de assinatura */
.assinatura {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
  background: var(--faixa); color: var(--faixa-texto);
  padding-block: 12px calc(12px + env(safe-area-inset-bottom, 0px));
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
.assinatura-linha { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.progresso { display: grid; gap: 6px; min-width: 0; }
.progresso span { font: 400 .78rem/1.2 var(--mono); letter-spacing: .04em; }
.trilho { display: block; width: 160px; max-width: 40vw; height: 4px; background: color-mix(in oklch, var(--faixa-texto) 22%, transparent); }
.trilho i { display: block; height: 100%; width: 0; background: var(--faixa-texto); transition: width .2s; }
.aviso { margin: 8px 0 0; font: 400 .78rem/1.3 var(--mono); color: color-mix(in oklch, var(--faixa-texto) 75%, transparent); }
.aviso:empty { display: none; }
@media (max-width: 520px) { .assinar .extra { display: none; } .assinar { padding-inline: 14px; } }
.assinar {
  font: 800 1rem/1 var(--display); text-transform: uppercase; letter-spacing: .08em;
  background: var(--folha); color: var(--tinta); border: 0; border-radius: 3px;
  padding: 14px 18px; min-height: 48px; cursor: pointer;
}
.saida { display: block; width: 100%; height: 120px; margin-top: 10px; background: var(--folha); color: var(--tinta); border: 0; padding: 8px; font: 400 12px/1.4 var(--mono); }

/* ampliar print */
.zoom { position: fixed; inset: 0; z-index: 40; overflow: auto; background: var(--vela); cursor: zoom-out; padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px); }
.zoom img { display: block; max-width: 100%; margin: 0 auto; }

@media (min-width: 680px) {
  .conferencia { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .carimbo[aria-pressed="true"] { animation: none; }
  .trilho i, .carimbo { transition: none; }
}
</style>`;

const bodyContent = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <filter id="tinta"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="ruido"/><feDisplacementMap in="SourceGraphic" in2="ruido" scale="1.6"/></filter>
</svg>
<header class="cabecalho miolo">
  <div class="barra-cor" aria-hidden="true"><i class="c"></i><i class="m"></i><i class="y"></i><i class="k"></i><i class="t1"></i><i class="t2"></i><i class="t3"></i></div>
  <p class="meta rotulo">Prova · lote ${escapeHtml(data.lote)} · ${data.cards.length} ${data.cards.length === 1 ? 'peça' : 'peças'}</p>
  <h1>${escapeHtml(data.titulo)}</h1>
  <p class="ajuda">Carimbe cada peça, marque o que funcionou e o que não funcionou e anote o que você mudaria. Toque num print para ampliar.${data.cego ? ' As versões têm nomes sorteados, para você avaliar sem saber qual é qual.' : ''} No fim, assine e copie o resultado para colar no Claude. As respostas ficam salvas neste navegador.</p>
</header>
<main id="lista" class="miolo"></main>
<footer class="assinatura">
  <div class="miolo">
    <div class="assinatura-linha">
      <div class="progresso"><span id="contagem"></span><span class="trilho"><i id="barra"></i></span></div>
      <button id="copiar" class="assinar" type="button">Assinar e copiar<span class="extra"> resultado</span></button>
    </div>
    <p id="aviso" class="aviso" aria-live="polite"></p>
    <textarea id="saida" class="saida" readonly hidden aria-label="Resultado para copiar"></textarea>
  </div>
</footer>
<div class="zoom" id="zoom" hidden><img alt=""></div>
<script type="application/json" id="dados">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>
(() => {
  document.documentElement.lang = 'pt-BR';
  const data = JSON.parse(document.getElementById('dados').textContent);
  const TAGS = ['Ideia/conceito', 'Tipografia', 'Cores', 'Layout', 'Imagens e desenhos', 'Texto', 'No celular', 'Primeira tela'];
  const VEREDITOS = [['aprovado', 'Aprovado'], ['duvida', 'Em dúvida'], ['nao', 'Não aprovado']];
  const chave = 'lp-aprovacao-' + data.lote;
  let estado = {};
  try { estado = JSON.parse(localStorage.getItem(chave) || '{}') || {}; } catch (e) { estado = {}; }
  const salvar = () => { try { localStorage.setItem(chave, JSON.stringify(estado)); } catch (e) {} };
  const item = (c) => (estado[c] ||= { veredito: null, gostei: [], naoCurti: [], obs: '' });
  const escolhas = (estado.__escolhas ||= {});

  const el = (tag, attrs = {}, ...filhos) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v);
    }
    for (const f of filhos) if (f) n.append(f);
    return n;
  };

  const grupos = [];
  for (const c of data.cards) {
    let g = grupos.find((x) => x.nome === c.grupo);
    if (!g) grupos.push((g = { nome: c.grupo, cards: [] }));
    g.cards.push(c);
  }

  const zoom = document.getElementById('zoom');
  const abrirZoom = (src) => { zoom.querySelector('img').src = src; zoom.hidden = false; zoom.scrollTop = 0; };
  zoom.addEventListener('click', () => { zoom.hidden = true; });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') zoom.hidden = true; });

  const lista = document.getElementById('lista');
  let numero = 0;
  for (const g of grupos) {
    const sec = el('section', { class: 'grupo' });
    sec.append(el('div', { class: 'grupo-topo' },
      el('h2', { text: g.nome }),
      el('span', { class: 'rotulo', text: g.cards.length + (g.cards.length === 1 ? ' peça' : ' peças') })));

    for (const c of g.cards) {
      numero++;
      const s = item(c.codigo);
      const folha = el('article', { class: 'folha' });
      folha.append(el('div', { class: 'folha-topo' },
        el('span', { class: 'rotulo', text: 'Peça ' + String(numero).padStart(2, '0') }),
        el('h3', { text: c.nome })));

      const prints = el('div', { class: 'prints' });
      for (const [k, t] of [['desktop', 'Computador'], ['celular', 'Celular'], ['inteira', 'Página inteira']]) {
        if (!c.imagens[k]) continue;
        const b = el('button', { class: k, type: 'button', 'aria-label': 'Ampliar print: ' + t },
          el('img', { src: c.imagens[k], alt: t + ': ' + c.nome, loading: 'lazy' }),
          el('span', { class: 'rotulo', text: t }));
        b.addEventListener('click', () => abrirZoom(c.imagens[k]));
        prints.append(b);
      }
      folha.append(prints);

      const carimbos = el('div', { class: 'carimbos', role: 'group', 'aria-label': 'Veredito de ' + c.nome });
      for (const [v, t] of VEREDITOS) {
        const b = el('button', { class: 'carimbo', type: 'button', 'data-v': v, 'aria-pressed': String(s.veredito === v), text: t });
        b.addEventListener('click', () => {
          s.veredito = s.veredito === v ? null : v;
          carimbos.querySelectorAll('.carimbo').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === s.veredito)));
          salvar(); progresso();
        });
        carimbos.append(b);
      }
      folha.append(carimbos);

      const conferencia = el('div', { class: 'conferencia' });
      for (const [lado, titulo, arr] of [['gostei', 'Funcionou', s.gostei], ['naocurti', 'Não funcionou', s.naoCurti]]) {
        const lista2 = el('div', { class: 'lista' });
        for (const t of TAGS) {
          const b = el('button', { class: 'item', type: 'button', 'data-chip': lado, 'aria-pressed': String(arr.includes(t)) },
            el('span', { class: 'caixa', 'aria-hidden': 'true' }), t);
          b.addEventListener('click', () => {
            const i = arr.indexOf(t);
            i >= 0 ? arr.splice(i, 1) : arr.push(t);
            b.setAttribute('aria-pressed', String(i < 0));
            salvar();
          });
          lista2.append(b);
        }
        conferencia.append(el('div', { class: 'coluna', 'data-lado': lado }, el('p', { class: 'rotulo', text: titulo }), lista2));
      }
      folha.append(conferencia);

      const idObs = 'obs-' + c.codigo.replace(/[^a-z0-9-]/gi, '-');
      const area = el('textarea', { id: idObs, class: 'anotacao', placeholder: 'O que você mudaria? (opcional)' });
      area.value = s.obs || '';
      area.addEventListener('input', () => { s.obs = area.value; salvar(); });
      folha.append(el('div', { class: 'notas' }, el('label', { class: 'rotulo', for: idObs, text: 'Anotações' }), area));
      sec.append(folha);
    }

    if (g.cards.length >= 2) {
      const decisao = el('section', { class: 'folha decisao', 'aria-label': 'Decisão para ' + g.nome });
      const opcoes = el('div', { class: 'opcoes', role: 'group' });
      for (const [cod, nome] of [...g.cards.map((o) => [o.codigo, o.nome]), ['nenhuma', 'Nenhuma']]) {
        const b = el('button', { class: 'opcao', type: 'button', 'aria-pressed': String(escolhas[g.nome] === cod), text: nome });
        b.addEventListener('click', () => {
          escolhas[g.nome] = escolhas[g.nome] === cod ? undefined : cod;
          opcoes.querySelectorAll('.opcao').forEach((x, i) => {
            const codigo = i < g.cards.length ? g.cards[i].codigo : 'nenhuma';
            x.setAttribute('aria-pressed', String(escolhas[g.nome] === codigo));
          });
          salvar();
        });
        opcoes.append(b);
      }
      decisao.append(
        el('p', { class: 'rotulo', text: 'Decisão' }),
        el('h3', { text: 'Qual vai para o cliente?' }),
        el('p', { text: 'Entre as peças de ' + g.nome + '.' }),
        opcoes);
      sec.append(decisao);
    }
    lista.append(sec);
  }

  function progresso() {
    const total = data.cards.length;
    const feitos = data.cards.filter((c) => item(c.codigo).veredito).length;
    document.getElementById('contagem').textContent = feitos + ' de ' + total + (total === 1 ? ' peça carimbada' : ' peças carimbadas');
    document.getElementById('barra').style.width = (100 * feitos / total) + '%';
  }
  progresso();

  const NOMES = { aprovado: 'APROVADO', duvida: 'EM DÚVIDA', nao: 'NÃO APROVADO' };
  document.getElementById('copiar').addEventListener('click', async () => {
    const linhas = ['RESULTADO DA APROVAÇÃO · ' + data.lote, ''];
    const itens = [];
    for (const c of data.cards) {
      const s = item(c.codigo);
      itens.push({ codigo: c.codigo, veredito: s.veredito, gostei: s.gostei, naoCurti: s.naoCurti, obs: s.obs.trim() });
      linhas.push(c.grupo + ' · ' + c.nome + ': ' + (NOMES[s.veredito] || 'sem avaliação') +
        (s.gostei.length ? ' · gostei: ' + s.gostei.join(', ') : '') +
        (s.naoCurti.length ? ' · não curti: ' + s.naoCurti.join(', ') : '') +
        (s.obs.trim() ? ' · obs: "' + s.obs.trim() + '"' : ''));
    }
    const escolhasLista = grupos.filter((g) => g.cards.length >= 2).map((g) => ({ grupo: g.nome, codigo: escolhas[g.nome] || null }));
    if (escolhasLista.length) {
      linhas.push('');
      for (const e of escolhasLista) {
        const o = data.cards.find((x) => x.codigo === e.codigo);
        linhas.push(e.grupo + ' · mandaria para o cliente: ' + (e.codigo === 'nenhuma' ? 'nenhuma' : o ? o.nome : 'não escolhido'));
      }
    }
    linhas.push('', '<lp-aprovacao>' + JSON.stringify({ lote: data.lote, data: new Date().toISOString().slice(0, 10), itens, escolhas: escolhasLista }) + '</lp-aprovacao>');
    const texto = linhas.join('\\n');
    const aviso = document.getElementById('aviso');
    const saida = document.getElementById('saida');
    try {
      await navigator.clipboard.writeText(texto);
      saida.hidden = true;
      aviso.textContent = 'Copiado. Agora cole no Claude.';
    } catch (e) {
      saida.hidden = false; saida.value = texto; saida.focus(); saida.select();
      aviso.textContent = 'Copie o texto abaixo (Ctrl+C ou segure e copie) e cole no Claude.';
    }
  });
})();
</script>`;

const html = fragment
  ? `${head}\n${bodyContent}\n`
  : `<!doctype html>\n<html lang="pt-BR">\n<head>\n${head}\n</head>\n<body>\n${bodyContent}\n</body>\n</html>\n`;

writeFileSync(outPath, html);
if (man.cego) writeFileSync(outPath.replace(/\.html?$/i, '') + '-chaves.json', JSON.stringify({ lote: man.lote, chaves: keys }, null, 2));
console.log(`Página: ${resolve(outPath)} (${Math.round(html.length / 1024)} KB, ${cards.length} sites${man.cego ? ', modo cego' : ''}${fragment ? ', formato artefato' : ''})`);

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
}
