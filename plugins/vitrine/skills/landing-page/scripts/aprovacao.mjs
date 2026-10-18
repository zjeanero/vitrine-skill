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
// Marcar ajustes: se ao lado de desktop-full.jpg existirem mobile-full.jpg, desktop-mapa.json e mobile-mapa.json
// (o screenshot.mjs gera os quatro), a página deixa tocar num componente do print, ou desenhar uma área,
// e anotar o que mudar ali. Para caminhos diferentes, use "imagens.inteiraCelular" e "mapas": { "computador", "celular" }.
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

// Arquivo irmão (ex.: mobile-full.jpg ao lado de desktop-full.jpg), se existir.
const irmao = (p, de, para) => {
  if (!p) return null;
  const q = p.replace(de, para);
  return q !== p && existsSync(resolve(base, q)) ? q : null;
};
// Mapa de componentes compactado em arrays: [x, y, w, h, pai, tipo, rótulo, seletor].
const lerMapa = (p) => {
  if (!p || !existsSync(resolve(base, p))) return null;
  try {
    const m = JSON.parse(readFileSync(resolve(base, p), 'utf8'));
    return m.itens.map((i) => [i.x, i.y, i.w, i.h, i.p ?? -1, i.t, i.r, i.s]);
  } catch (e) {
    console.warn(`Aviso: mapa ilegível: ${p}`);
    return null;
  }
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
    const inteira = it.imagens?.inteira;
    const inteiraCelular = it.imagens?.inteiraCelular ?? irmao(inteira, /desktop-full\.jpg$/, 'mobile-full.jpg');
    const imagens = {
      desktop: embed(it.imagens?.desktop),
      celular: embed(it.imagens?.celular),
      inteira: embed(inteira),
      inteiraCelular: embed(inteiraCelular),
    };
    const paginas = [];
    if (imagens.inteira) paginas.push({ vista: 'computador', img: 'inteira', mapa: lerMapa(it.mapas?.computador ?? irmao(inteira, /desktop-full\.jpg$/, 'desktop-mapa.json')) });
    if (imagens.inteiraCelular) paginas.push({ vista: 'celular', img: 'inteiraCelular', mapa: lerMapa(it.mapas?.celular ?? irmao(inteiraCelular, /mobile-full\.jpg$/, 'mobile-mapa.json')) });
    cards.push({
      codigo: code,
      grupo,
      nome: man.cego ? `Versão ${String.fromCharCode(65 + i)}` : it.rotulo || it.id,
      imagens,
      paginas,
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
  --sobre-cor: oklch(99% 0 0);
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

/* ajustes marcados no print: a tinta magenta da correção de prova */
.marcas { display: grid; gap: 6px; }
.marcas-topo { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 14px; }
.marcas-topo .rotulo { margin: 0; color: var(--tinta-suave); }
.marcar {
  font: 600 .95rem/1.2 var(--texto); color: var(--magenta); background: transparent;
  border: 1.5px solid currentColor; border-radius: 3px; padding: 10px 14px; min-height: 44px; cursor: pointer;
}
.marcar:hover { background: color-mix(in oklch, var(--magenta) 8%, transparent); }
.marcas-lista { list-style: none; margin: 0; padding: 0; display: grid; }
.marca-linha {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; width: 100%;
  padding: 9px 2px; background: transparent; border: 0; border-bottom: 1px dashed var(--fio);
  color: var(--tinta); text-align: left; cursor: pointer;
}
.marca-linha .onde { display: block; font: 400 .76rem/1.35 var(--mono); color: var(--tinta-suave); overflow-wrap: anywhere; }
.marca-linha .pedido { display: block; font: 400 .95rem/1.4 var(--texto); overflow-wrap: anywhere; }
.pino {
  display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 13px;
  background: var(--magenta); color: var(--sobre-cor); font: 400 .78rem/1 var(--mono); border: 0;
}

/* mesa de marcação: o print inteiro, com o mapa dos componentes por cima */
.mesa-marcar {
  position: fixed; inset: 0; z-index: 50; display: grid; grid-template-rows: auto minmax(0, 1fr);
  background: var(--faixa); color: var(--faixa-texto);
}
.mm-barra {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px;
  padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px));
  border-bottom: 1px solid color-mix(in oklch, var(--faixa-texto) 20%, transparent);
}
.mm-titulo { margin: 0 auto 0 0; min-width: 0; font: 800 1.1rem/1.1 var(--display); text-transform: uppercase; letter-spacing: .06em; }
.mm-grupo { display: flex; border: 1px solid color-mix(in oklch, var(--faixa-texto) 35%, transparent); border-radius: 3px; }
.mm-grupo button, .mm-perto {
  background: transparent; color: var(--faixa-texto); border: 0; padding: 9px 12px; min-height: 40px;
  font: 400 .78rem/1 var(--mono); letter-spacing: .04em; cursor: pointer;
}
.mm-perto { border: 1px solid color-mix(in oklch, var(--faixa-texto) 35%, transparent); border-radius: 3px; }
.mm-grupo button[aria-pressed="true"], .mm-perto[aria-pressed="true"] { background: var(--faixa-texto); color: var(--faixa); }
.mm-grupo button:disabled { opacity: .4; cursor: not-allowed; }
.mm-pronto {
  font: 800 .95rem/1 var(--display); text-transform: uppercase; letter-spacing: .08em;
  background: var(--magenta); color: var(--sobre-cor); border: 0; border-radius: 3px; padding: 11px 16px; min-height: 42px; cursor: pointer;
}
.mm-corpo { display: grid; grid-template-rows: minmax(0, 1fr) auto; min-height: 0; }
.mm-rolagem { overflow: auto; overscroll-behavior: contain; padding: 16px max(16px, env(safe-area-inset-right, 0px)) 24px max(16px, env(safe-area-inset-left, 0px)); }
.mm-palco { position: relative; margin: 0 auto; width: 100%; max-width: 1100px; }
.mm-palco[data-vista="celular"] { max-width: 390px; }
.mm-palco.perto { max-width: none; width: 220%; }
.mm-palco[data-vista="celular"].perto { width: 160%; max-width: 640px; }
.mm-palco img { display: block; width: 100%; height: auto; max-width: none; background: var(--folha); user-select: none; -webkit-user-drag: none; }
.mm-camada { position: absolute; inset: 0; cursor: pointer; }
.mm-camada[data-modo="area"] { touch-action: none; cursor: crosshair; }
.mm-caixa { position: absolute; pointer-events: none; }
.mm-caixa.foco { outline: 2px dashed var(--ciano); background: color-mix(in oklch, var(--ciano) 14%, transparent); }
.mm-caixa.marca { outline: 2px solid var(--magenta); background: color-mix(in oklch, var(--magenta) 10%, transparent); }
.mm-caixa.marca.ativa { outline-width: 4px; background: color-mix(in oklch, var(--magenta) 18%, transparent); }
.mm-caixa.desenho { outline: 2px dashed var(--magenta); background: color-mix(in oklch, var(--magenta) 8%, transparent); }
.mm-caixa .pino { position: absolute; left: -13px; top: -13px; pointer-events: auto; cursor: pointer; box-shadow: 0 0 0 2px var(--folha); }
.mm-etiqueta {
  position: absolute; transform: translateY(-100%); pointer-events: none; max-width: 70%;
  background: var(--ciano); color: var(--tinta); font: 400 .72rem/1.2 var(--mono); padding: 3px 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mm-painel {
  background: var(--folha); color: var(--tinta); display: grid; gap: 12px; align-content: start;
  max-height: 40vh; overflow: auto;
  padding: 14px max(16px, env(safe-area-inset-right, 0px)) calc(14px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
}
.mm-painel .rotulo { margin: 0; color: var(--tinta-suave); }
.mm-alvo { margin: 0; font: 600 1rem/1.35 var(--texto); overflow-wrap: anywhere; }
.mm-ajuda { margin: 0; color: var(--tinta-suave); max-width: 46ch; }
.mm-acoes { display: flex; flex-wrap: wrap; gap: 8px; }
.mm-acoes button {
  background: transparent; color: var(--tinta); border: 1.5px solid var(--tinta); border-radius: 3px;
  padding: 9px 12px; min-height: 40px; font: 600 .85rem/1.2 var(--texto); cursor: pointer;
}
.mm-acoes .apagar { color: var(--reprova); border-color: var(--reprova); }
.mm-painel .anotacao { min-height: 58px; }
@media (max-width: 560px) {
  .mm-titulo { display: none; }
  .mm-barra { gap: 8px; }
  .mm-grupo button, .mm-perto { padding: 9px 10px; letter-spacing: 0; }
  .mm-pronto { padding: 11px 13px; }
}
@media (min-width: 900px) {
  .mm-corpo { grid-template-rows: none; grid-template-columns: minmax(0, 1fr) 340px; }
  .mm-painel { max-height: none; }
}

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
  <p class="ajuda">Carimbe cada peça, marque o que funcionou e o que não funcionou e anote o que você mudaria. Toque num print para ampliar, ou em Marcar no print para apontar o lugar exato de um ajuste.${data.cego ? ' As versões têm nomes sorteados, para você avaliar sem saber qual é qual.' : ''} No fim, assine e copie o resultado para colar no Claude. As respostas ficam salvas neste navegador.</p>
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
<div class="mesa-marcar" id="marcar" hidden role="dialog" aria-modal="true" aria-label="Marcar ajustes no print">
  <div class="mm-barra">
    <p class="mm-titulo"></p>
    <div class="mm-grupo" data-grupo="vista" role="group" aria-label="Qual print">
      <button type="button" data-v="computador">Computador</button><button type="button" data-v="celular">Celular</button>
    </div>
    <div class="mm-grupo" data-grupo="modo" role="group" aria-label="Como marcar">
      <button type="button" data-v="componente">Componente</button><button type="button" data-v="area">Área livre</button>
    </div>
    <button type="button" class="mm-perto" aria-pressed="false" aria-label="Aproximar o print">Zoom</button>
    <button type="button" class="mm-pronto">Pronto</button>
  </div>
  <div class="mm-corpo">
    <div class="mm-rolagem"><div class="mm-palco"><img alt="Print da página inteira"><div class="mm-camada"></div></div></div>
    <aside class="mm-painel" aria-live="polite"></aside>
  </div>
</div>
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
  const item = (c) => (estado[c] ||= { veredito: null, gostei: [], naoCurti: [], obs: '', marcas: [] });
  const marcasDe = (s) => (s.marcas ||= []);
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
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (!mm.hidden) fecharMarcar(); else zoom.hidden = true;
  });

  // ---------- marcar ajustes no print ----------
  // Cada item do mapa é [x, y, w, h, pai, tipo, rótulo, seletor], em px da página inteira.
  const mm = document.getElementById('marcar');
  const mmTitulo = mm.querySelector('.mm-titulo');
  const mmVistas = mm.querySelector('[data-grupo="vista"]');
  const mmModos = mm.querySelector('[data-grupo="modo"]');
  const mmPerto = mm.querySelector('.mm-perto');
  const rolagem = mm.querySelector('.mm-rolagem');
  const palco = mm.querySelector('.mm-palco');
  const mmImg = palco.querySelector('img');
  const camada = mm.querySelector('.mm-camada');
  const painel = mm.querySelector('.mm-painel');
  const NOME_VISTA = { computador: 'Computador', celular: 'Celular' };
  let atual = null;
  let natW = 1, natH = 1;

  const curto = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const info = (e) => ({ seletor: e[7], tipo: e[5], rotulo: e[6] });
  const caixaDe = (e) => ({ x: e[0], y: e[1], w: e[2], h: e[3] });
  const descrever = (m) => m.alvo
    ? maiuscula(m.alvo.tipo) + (m.alvo.rotulo ? ' "' + curto(m.alvo.rotulo, 46) + '"' : '')
    : 'Área livre' + (m.dentro ? ', em ' + m.dentro.tipo + (m.dentro.rotulo ? ' "' + curto(m.dentro.rotulo, 32) + '"' : '') : '');
  const paginaAtual = () => atual.c.paginas.find((p) => p.vista === atual.vista);
  const mapaAtual = () => (paginaAtual() || {}).mapa || null;

  function noPonto(mapa, x, y) {
    let melhor = -1, menor = Infinity;
    mapa.forEach((e, i) => {
      if (x >= e[0] && x <= e[0] + e[2] && y >= e[1] && y <= e[1] + e[3] && e[2] * e[3] < menor) { menor = e[2] * e[3]; melhor = i; }
    });
    return melhor;
  }
  // Área desenhada: o menor componente que a contém e os componentes de fora mais externos que estão dentro dela.
  function analisarArea(mapa, a) {
    let dentro = null, menor = Infinity;
    const dentroDela = new Set();
    mapa.forEach((e, i) => {
      if (e[0] <= a.x && e[1] <= a.y && e[0] + e[2] >= a.x + a.w && e[1] + e[3] >= a.y + a.h && e[2] * e[3] < menor) { menor = e[2] * e[3]; dentro = e; }
      if (e[0] >= a.x && e[1] >= a.y && e[0] + e[2] <= a.x + a.w && e[1] + e[3] <= a.y + a.h) dentroDela.add(i);
    });
    const contem = [...dentroDela].filter((i) => !dentroDela.has(mapa[i][4]))
      .sort((p, q) => mapa[q][2] * mapa[q][3] - mapa[p][2] * mapa[p][3]).slice(0, 4).map((i) => info(mapa[i]));
    return { dentro: dentro ? info(dentro) : null, contem };
  }

  const pct = (v, total) => (100 * v / total) + '%';
  function posicionar(n, a) {
    n.style.left = pct(a.x, natW); n.style.top = pct(a.y, natH);
    n.style.width = pct(a.w, natW); n.style.height = pct(a.h, natH);
  }
  function pontoPagina(ev) {
    const r = camada.getBoundingClientRect();
    const x = Math.min(natW, Math.max(0, (ev.clientX - r.left) / r.width * natW));
    const y = Math.min(natH, Math.max(0, (ev.clientY - r.top) / r.height * natH));
    return [Math.round(x), Math.round(y)];
  }

  const foco = el('div', { class: 'mm-caixa foco', hidden: '' });
  const etiqueta = el('div', { class: 'mm-etiqueta', hidden: '' });
  function mostrarFoco(i) {
    const mapa = mapaAtual();
    if (!mapa || i < 0) { foco.hidden = true; etiqueta.hidden = true; return; }
    const e = mapa[i];
    posicionar(foco, caixaDe(e));
    etiqueta.style.left = pct(e[0], natW); etiqueta.style.top = pct(e[1], natH);
    etiqueta.textContent = maiuscula(e[5]) + (e[6] ? ': ' + e[6] : '');
    foco.hidden = false; etiqueta.hidden = false;
  }

  function novaMarca(dados) {
    const lista = marcasDe(atual.s);
    const m = Object.assign({ n: lista.length + 1, vista: atual.vista, i: -1, alvo: null, dentro: null, contem: [], area: null, obs: '' }, dados);
    lista.push(m);
    atual.ativa = m.n;
    salvar();
    desenhar();
    const t = painel.querySelector('textarea');
    if (t) t.focus({ preventScroll: true });
  }

  function desenhar() {
    camada.querySelectorAll('.marca').forEach((n) => n.remove());
    for (const m of marcasDe(atual.s)) {
      if (m.vista !== atual.vista) continue;
      const b = el('div', { class: 'mm-caixa marca' + (m.n === atual.ativa ? ' ativa' : '') });
      posicionar(b, m.area);
      const pino = el('button', { class: 'pino', type: 'button', 'aria-label': 'Marca ' + m.n + ': ' + descrever(m), text: String(m.n) });
      pino.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      pino.addEventListener('click', (ev) => { ev.stopPropagation(); atual.ativa = m.n; desenhar(); });
      b.append(pino);
      camada.append(b);
    }
    for (const b of mmVistas.querySelectorAll('button')) {
      b.setAttribute('aria-pressed', String(b.dataset.v === atual.vista));
      b.hidden = !atual.c.paginas.some((p) => p.vista === b.dataset.v);
    }
    for (const b of mmModos.querySelectorAll('button')) {
      b.setAttribute('aria-pressed', String(b.dataset.v === atual.modo));
      if (b.dataset.v === 'componente') b.disabled = !mapaAtual();
    }
    camada.dataset.modo = atual.modo;
    renderPainel();
  }

  function renderPainel() {
    painel.replaceChildren();
    const lista = marcasDe(atual.s);
    const m = lista.find((x) => x.n === atual.ativa);
    if (m) {
      const t = el('textarea', { id: 'mm-obs', class: 'anotacao', placeholder: 'O que mudar aqui?', 'aria-label': 'O que mudar na marca ' + m.n });
      t.value = m.obs;
      t.addEventListener('input', () => {
        m.obs = t.value; salvar();
        const p = painel.querySelector('.pedido[data-n="' + m.n + '"]');
        if (p) p.textContent = m.obs || 'Sem anotação ainda';
      });
      const acoes = el('div', { class: 'mm-acoes' });
      const mapa = (atual.c.paginas.find((p) => p.vista === m.vista) || {}).mapa;
      if (mapa && m.i >= 0 && mapa[m.i][4] >= 0) {
        const maior = el('button', { type: 'button', text: 'Pegar a área em volta' });
        maior.addEventListener('click', () => {
          m.i = mapa[m.i][4]; m.alvo = info(mapa[m.i]); m.area = caixaDe(mapa[m.i]);
          salvar(); desenhar();
        });
        acoes.append(maior);
      }
      const apagar = el('button', { type: 'button', class: 'apagar', text: 'Apagar marca' });
      apagar.addEventListener('click', () => {
        lista.splice(lista.indexOf(m), 1);
        lista.forEach((x, k) => { x.n = k + 1; });
        atual.ativa = null; salvar(); desenhar();
      });
      acoes.append(apagar);
      painel.append(el('p', { class: 'rotulo', text: 'Marca ' + m.n + ' · ' + NOME_VISTA[m.vista] }), el('p', { class: 'mm-alvo', text: descrever(m) }), t, acoes);
    } else {
      painel.append(el('p', { class: 'mm-ajuda', text: mapaAtual()
        ? 'Toque num título, texto, botão, imagem ou seção do print para marcar o que mudar ali. Para marcar um pedaço qualquer, use Área livre e arraste.'
        : 'Arraste sobre o print para marcar a área que você quer mudar.' }));
    }
    if (lista.length) {
      const ol = el('ol', { class: 'marcas-lista' });
      for (const x of lista) {
        const b = el('button', { class: 'marca-linha', type: 'button' },
          el('span', { class: 'pino', text: String(x.n) }),
          el('span', {}, el('span', { class: 'onde', text: NOME_VISTA[x.vista] + ' · ' + descrever(x) }), el('span', { class: 'pedido', 'data-n': String(x.n), text: x.obs || 'Sem anotação ainda' })));
        b.addEventListener('click', () => irPara(x));
        ol.append(el('li', {}, b));
      }
      painel.append(el('p', { class: 'rotulo', text: 'Marcas desta peça' }), ol);
    }
  }

  async function trocarVista(vista) {
    atual.vista = vista;
    const pg = paginaAtual();
    if (!pg.mapa) atual.modo = 'area';
    palco.dataset.vista = vista;
    mmImg.src = atual.c.imagens[pg.img];
    try { await mmImg.decode(); } catch (e) {}
    natW = mmImg.naturalWidth || 1; natH = mmImg.naturalHeight || 1;
    mostrarFoco(-1);
    desenhar();
  }

  async function irPara(m) {
    atual.ativa = m.n;
    if (m.vista !== atual.vista) await trocarVista(m.vista); else desenhar();
    const topo = m.area.y / natH * palco.offsetHeight;
    rolagem.scrollTop = Math.max(0, topo - 80);
  }

  function abrirMarcar(c, s, n, aoFechar) {
    const m = n ? marcasDe(s).find((x) => x.n === n) : null;
    atual = { c, s, vista: m ? m.vista : c.paginas[0].vista, modo: 'componente', ativa: null, aoFechar };
    mmTitulo.textContent = 'Marcar ajustes · ' + c.nome;
    mm.hidden = false;
    document.body.style.overflow = 'hidden';
    trocarVista(atual.vista).then(() => { if (m) irPara(m); else rolagem.scrollTop = 0; });
  }
  function fecharMarcar() {
    mm.hidden = true;
    document.body.style.overflow = '';
    if (atual && atual.aoFechar) atual.aoFechar();
  }

  camada.append(foco, etiqueta);
  mm.querySelector('.mm-pronto').addEventListener('click', fecharMarcar);
  mmVistas.addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b && b.dataset.v !== atual.vista) trocarVista(b.dataset.v); });
  mmModos.addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b && !b.disabled) { atual.modo = b.dataset.v; mostrarFoco(-1); desenhar(); } });
  mmPerto.addEventListener('click', () => {
    const perto = palco.classList.toggle('perto');
    mmPerto.setAttribute('aria-pressed', String(perto));
  });

  // Tocar no componente: o clique (ou toque) marca o menor componente sob o dedo; o mouse mostra antes qual é.
  camada.addEventListener('click', (ev) => {
    if (atual.modo !== 'componente') return;
    const mapa = mapaAtual();
    if (!mapa) return;
    const [x, y] = pontoPagina(ev);
    const i = noPonto(mapa, x, y);
    if (i < 0) return;
    mostrarFoco(-1);
    novaMarca({ i, alvo: info(mapa[i]), area: caixaDe(mapa[i]) });
  });
  // Desenhar área: arrastar com o mouse ou o dedo.
  let inicio = null, desenho = null;
  camada.addEventListener('pointerdown', (ev) => {
    if (atual.modo !== 'area') return;
    ev.preventDefault();
    try { camada.setPointerCapture(ev.pointerId); } catch (e) {}
    inicio = pontoPagina(ev);
    desenho = el('div', { class: 'mm-caixa desenho' });
    posicionar(desenho, { x: inicio[0], y: inicio[1], w: 0, h: 0 });
    camada.append(desenho);
  });
  const retangulo = (a, b) => ({ x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(a[0] - b[0]), h: Math.abs(a[1] - b[1]) });
  camada.addEventListener('pointermove', (ev) => {
    if (inicio) { posicionar(desenho, retangulo(inicio, pontoPagina(ev))); return; }
    if (atual.modo !== 'componente' || ev.pointerType !== 'mouse' || !mapaAtual()) return;
    const [x, y] = pontoPagina(ev);
    mostrarFoco(noPonto(mapaAtual(), x, y));
  });
  camada.addEventListener('pointerleave', () => { if (!inicio) mostrarFoco(-1); });
  const terminarDesenho = (ev, valer) => {
    if (!inicio) return;
    const a = retangulo(inicio, pontoPagina(ev));
    inicio = null; desenho.remove(); desenho = null;
    if (!valer || a.w < 12 || a.h < 12) return;
    const mapa = mapaAtual();
    novaMarca(Object.assign({ area: a }, mapa ? analisarArea(mapa, a) : {}));
  };
  camada.addEventListener('pointerup', (ev) => terminarDesenho(ev, true));
  camada.addEventListener('pointercancel', (ev) => terminarDesenho(ev, false));

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

      if (c.paginas.length) {
        const botao = el('button', { class: 'marcar', type: 'button' });
        const ol = el('ol', { class: 'marcas-lista' });
        const renderLista = () => {
          ol.replaceChildren(...marcasDe(s).map((m) => {
            const b = el('button', { class: 'marca-linha', type: 'button' },
              el('span', { class: 'pino', text: String(m.n) }),
              el('span', {}, el('span', { class: 'onde', text: NOME_VISTA[m.vista] + ' · ' + descrever(m) }), el('span', { class: 'pedido', text: m.obs || 'Sem anotação ainda' })));
            b.addEventListener('click', () => abrirMarcar(c, s, m.n, renderLista));
            return el('li', {}, b);
          }));
          botao.textContent = marcasDe(s).length ? 'Marcar mais' : 'Marcar no print';
        };
        botao.addEventListener('click', () => abrirMarcar(c, s, null, renderLista));
        renderLista();
        folha.append(el('div', { class: 'marcas' },
          el('div', { class: 'marcas-topo' }, el('p', { class: 'rotulo', text: 'Ajustes marcados no print' }), botao), ol));
      }

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
      const marcas = marcasDe(s).map((m) => ({ n: m.n, vista: m.vista, alvo: m.alvo, dentro: m.dentro, contem: m.contem, area: m.area, obs: m.obs.trim() }));
      itens.push({ codigo: c.codigo, veredito: s.veredito, gostei: s.gostei, naoCurti: s.naoCurti, obs: s.obs.trim(), marcas });
      linhas.push(c.grupo + ' · ' + c.nome + ': ' + (NOMES[s.veredito] || 'sem avaliação') +
        (s.gostei.length ? ' · gostei: ' + s.gostei.join(', ') : '') +
        (s.naoCurti.length ? ' · não curti: ' + s.naoCurti.join(', ') : '') +
        (s.obs.trim() ? ' · obs: "' + s.obs.trim() + '"' : ''));
      for (const m of marcasDe(s)) linhas.push('   ✎ ' + m.n + ' (' + m.vista + ' · ' + descrever(m) + '): ' + (m.obs.trim() || 'sem anotação'));
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
