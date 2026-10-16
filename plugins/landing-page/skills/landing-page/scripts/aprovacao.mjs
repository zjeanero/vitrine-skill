#!/usr/bin/env node
// Gera a página de aprovação: um HTML único (funciona offline e no celular) com 2-3 prints por site,
// botões Aprovado / Em dúvida / Não aprovado, etiquetas do que gostou e do que não curtiu, e um campo
// de melhoria. O botão "Copiar resultado" gera um texto para colar no Claude.
//
// Uso:
//   node aprovacao.mjs <manifesto.json> <saida.html>
//
// Manifesto (caminhos de imagem relativos ao próprio manifesto):
//   {
//     "lote": "iteracao-1",
//     "titulo": "Testes da skill: rodada 1",
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

const [manPath, outPath] = process.argv.slice(2);
if (!manPath || !outPath) {
  console.error('Uso: node aprovacao.mjs <manifesto.json> <saida.html>');
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

const data = { lote: man.lote, titulo: man.titulo || 'Aprovação', cego: Boolean(man.cego), cards };

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.titulo)}</title>
<style>
  :root {
    --fundo: #f4f2ee; --cartao: #ffffff; --tinta: #1c1b19; --suave: #6b675f; --fio: #e2ded6;
    --sim: #1f7a4d; --duvida: #a8670f; --nao: #b42318; --foco: #2b59c3;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--fundo); color: var(--tinta); font: 16px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }
  header { max-width: 1080px; margin: 0 auto; padding: 28px 16px 8px; }
  h1 { text-wrap: balance; margin: 0 0 6px; font-size: clamp(1.4rem, 1.1rem + 1.2vw, 2rem); }
  .ajuda { margin: 0; color: var(--suave); max-width: 60ch; }
  .progresso { position: sticky; top: 0; z-index: 5; background: var(--fundo); border-bottom: 1px solid var(--fio); }
  .progresso > div { max-width: 1080px; margin: 0 auto; padding: 10px 16px; display: flex; gap: 12px; align-items: center; justify-content: space-between; }
  .barra { flex: 1; height: 6px; background: var(--fio); border-radius: 3px; overflow: hidden; }
  .barra i { display: block; height: 100%; width: 0; background: var(--tinta); transition: width .2s; }
  main { max-width: 1080px; margin: 0 auto; padding: 8px 16px 140px; }
  h2 { margin: 32px 0 10px; font-size: 1.15rem; }
  .cartao { background: var(--cartao); border: 1px solid var(--fio); border-radius: 10px; padding: 16px; margin: 0 0 16px; }
  .cartao h3 { margin: 0 0 12px; font-size: 1rem; }
  .prints { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
  .prints button { all: unset; cursor: zoom-in; flex: none; border: 1px solid var(--fio); border-radius: 6px; overflow: hidden; background: #fff; }
  .prints img { display: block; height: 220px; width: auto; }
  .prints .inteira img { width: 150px; height: 220px; object-fit: cover; object-position: top; }
  .prints figcaption { font-size: .75rem; color: var(--suave); padding: 4px 8px; }
  .veredito { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 10px; }
  .veredito button, .chips button { font: inherit; border: 1.5px solid var(--fio); background: #fff; color: var(--tinta); border-radius: 999px; padding: 8px 14px; cursor: pointer; min-height: 44px; }
  .veredito button[aria-pressed="true"][data-v="aprovado"] { background: var(--sim); border-color: var(--sim); color: #fff; }
  .veredito button[aria-pressed="true"][data-v="duvida"] { background: var(--duvida); border-color: var(--duvida); color: #fff; }
  .veredito button[aria-pressed="true"][data-v="nao"] { background: var(--nao); border-color: var(--nao); color: #fff; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; align-items: center; }
  .chips span { font-size: .85rem; color: var(--suave); width: 100%; }
  .chips button { padding: 6px 12px; min-height: 36px; font-size: .9rem; }
  .chips.gostei button[aria-pressed="true"] { background: #e7f3ec; border-color: var(--sim); }
  .chips.naocurti button[aria-pressed="true"] { background: #fbeceb; border-color: var(--nao); }
  textarea { width: 100%; min-height: 64px; margin-top: 8px; font: inherit; padding: 10px; border: 1.5px solid var(--fio); border-radius: 8px; resize: vertical; }
  button:focus-visible, textarea:focus-visible { outline: 3px solid var(--foco); outline-offset: 2px; }
  .rodape { position: fixed; left: 0; right: 0; bottom: 0; background: var(--cartao); border-top: 1px solid var(--fio); }
  .rodape > div { max-width: 1080px; margin: 0 auto; padding: 12px 16px; display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  #aviso { color: var(--suave); font-size: .85rem; flex: 1; min-width: 0; }
  .rodape > div { flex-wrap: nowrap; }
  .copiar { font: inherit; white-space: nowrap; font-weight: 600; background: var(--tinta); color: #fff; border: 0; border-radius: 8px; padding: 12px 18px; cursor: pointer; min-height: 44px; }
  #saida { display: none; width: 100%; min-height: 120px; }
  .rodape > div:has(#saida[style*="block"]) { flex-wrap: wrap; }
  .escolha { background: #fbfaf7; border: 1.5px dashed #cfc9bd; border-radius: 10px; padding: 14px 16px; margin: 0 0 16px; }
  .escolha h3 { margin: 0 0 2px; font-size: 1rem; }
  .escolha p { margin: 0; color: var(--suave); font-size: .9rem; }
  .escolha button[aria-pressed="true"] { background: var(--tinta); border-color: var(--tinta); color: #fff; }
  .zoom { position: fixed; inset: 0; background: rgba(0,0,0,.85); display: none; overflow: auto; z-index: 10; cursor: zoom-out; }
  .zoom img { display: block; max-width: 100%; margin: 0 auto; }
  @media (prefers-reduced-motion: reduce) { .barra i { transition: none; } }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(data.titulo)}</h1>
  <p class="ajuda">Para cada site: escolha <b>Aprovado</b>, <b>Em dúvida</b> ou <b>Não aprovado</b>, toque no que gostou e no que não curtiu e, se quiser, escreva uma melhoria. Toque num print para ampliar. Quando houver mais de uma versão do mesmo site, diga também <b>qual você mandaria para o cliente</b>. No fim, use <b>Copiar resultado</b> e cole no Claude.${data.cego ? ' Os nomes das versões são sorteados para você avaliar sem saber qual é qual.' : ''}</p>
</header>
<div class="progresso"><div><div class="barra"><i id="barra"></i></div><span id="contagem"></span></div></div>
<main id="lista"></main>
<div class="rodape"><div>
  <span id="aviso">Respostas salvas neste navegador.</span>
  <button class="copiar" id="copiar">Copiar resultado</button>
  <textarea id="saida" readonly></textarea>
</div></div>
<div class="zoom" id="zoom"><img alt=""></div>
<script type="application/json" id="dados">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>
(() => {
  const data = JSON.parse(document.getElementById('dados').textContent);
  const GOSTEI = ['Ideia/conceito', 'Tipografia', 'Cores', 'Layout', 'Imagens e desenhos', 'Texto', 'No celular', 'Primeira tela'];
  const chave = 'lp-aprovacao-' + data.lote;
  let estado = {};
  try { estado = JSON.parse(localStorage.getItem(chave) || '{}'); } catch (e) { estado = {}; }
  const salvar = () => { try { localStorage.setItem(chave, JSON.stringify(estado)); } catch (e) {} };
  const item = (c) => (estado[c] ||= { veredito: null, gostei: [], naoCurti: [], obs: '' });
  const escolhas = (estado.__escolhas ||= {});
  const tamanho = {};
  data.cards.forEach((c) => { tamanho[c.grupo] = (tamanho[c.grupo] || 0) + 1; });

  // Escolha forçada: entre versões do mesmo site, qual iria para o cliente.
  function blocoEscolha(grupo) {
    const opcoes = data.cards.filter((x) => x.grupo === grupo);
    const sec = document.createElement('section');
    sec.className = 'escolha';
    const h = document.createElement('h3'); h.textContent = 'Qual você mandaria para o cliente?';
    const p = document.createElement('p'); p.textContent = 'Comparando as versões de ' + grupo + '.';
    const botoes = document.createElement('div'); botoes.className = 'veredito';
    for (const [cod, nome] of [...opcoes.map((o) => [o.codigo, o.nome]), ['nenhuma', 'Nenhuma']]) {
      const b = document.createElement('button');
      b.dataset.escolha = cod; b.textContent = nome; b.setAttribute('aria-pressed', String(escolhas[grupo] === cod));
      botoes.appendChild(b);
    }
    sec.append(h, p, botoes);
    sec.addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-escolha]');
      if (!b) return;
      escolhas[grupo] = escolhas[grupo] === b.dataset.escolha ? undefined : b.dataset.escolha;
      sec.querySelectorAll('[data-escolha]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.escolha === escolhas[grupo])));
      salvar();
    });
    return sec;
  }

  const lista = document.getElementById('lista');
  let grupoAtual = null;
  for (const [idx, c] of data.cards.entries()) {
    if (c.grupo !== grupoAtual) {
      grupoAtual = c.grupo;
      const h = document.createElement('h2'); h.textContent = c.grupo; lista.appendChild(h);
    }
    const s = item(c.codigo);
    const card = document.createElement('section');
    card.className = 'cartao';
    const prints = [['desktop', 'Computador'], ['celular', 'Celular'], ['inteira', 'Página inteira']]
      .filter(([k]) => c.imagens[k])
      .map(([k, t]) => '<button class="' + k + '" data-zoom="' + k + '"><img src="' + c.imagens[k] + '" alt="' + t + '"><figcaption>' + t + '</figcaption></button>')
      .join('');
    const chips = (lista2, cls, marcados) => '<div class="chips ' + cls + '"><span>' + (cls === 'gostei' ? 'Gostei de:' : 'Não curti:') + '</span>' +
      lista2.map((g) => '<button aria-pressed="' + marcados.includes(g) + '" data-chip="' + cls + '">' + g + '</button>').join('') + '</div>';
    card.innerHTML = '<h3>' + c.nome + '</h3><div class="prints">' + prints + '</div>' +
      '<div class="veredito">' + [['aprovado', 'Aprovado'], ['duvida', 'Em dúvida'], ['nao', 'Não aprovado']]
        .map(([v, t]) => '<button data-v="' + v + '" aria-pressed="' + (s.veredito === v) + '">' + t + '</button>').join('') + '</div>' +
      chips(GOSTEI, 'gostei', s.gostei) + chips(GOSTEI, 'naocurti', s.naoCurti) +
      '<textarea placeholder="Melhoria ou observação (opcional)">' + (s.obs || '').replace(/</g, '&lt;') + '</textarea>';
    card.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.zoom) { const z = document.getElementById('zoom'); z.querySelector('img').src = c.imagens[b.dataset.zoom]; z.style.display = 'block'; z.scrollTop = 0; return; }
      if (b.dataset.v) {
        s.veredito = s.veredito === b.dataset.v ? null : b.dataset.v;
        card.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === s.veredito)));
      } else if (b.dataset.chip) {
        const arr = b.dataset.chip === 'gostei' ? s.gostei : s.naoCurti;
        const i = arr.indexOf(b.textContent);
        i >= 0 ? arr.splice(i, 1) : arr.push(b.textContent);
        b.setAttribute('aria-pressed', String(i < 0));
      }
      salvar(); progresso();
    });
    card.querySelector('textarea').addEventListener('input', (ev) => { s.obs = ev.target.value; salvar(); });
    lista.appendChild(card);
    const prox = data.cards[idx + 1];
    if ((!prox || prox.grupo !== c.grupo) && tamanho[c.grupo] >= 2) lista.appendChild(blocoEscolha(c.grupo));
  }
  document.getElementById('zoom').addEventListener('click', (ev) => { ev.currentTarget.style.display = 'none'; });

  function progresso() {
    const total = data.cards.length;
    const feitos = data.cards.filter((c) => item(c.codigo).veredito).length;
    document.getElementById('contagem').textContent = feitos + ' de ' + total + ' avaliados';
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
    const escolhasLista = Object.keys(tamanho).filter((g) => tamanho[g] >= 2).map((g) => ({ grupo: g, codigo: escolhas[g] || null }));
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
    try {
      await navigator.clipboard.writeText(texto);
      aviso.textContent = 'Copiado! Agora cole no Claude.';
    } catch (e) {
      const out = document.getElementById('saida');
      out.style.display = 'block'; out.value = texto; out.focus(); out.select();
      aviso.textContent = 'Copie o texto abaixo (Ctrl+C) e cole no Claude.';
    }
  });
})();
</script>
</body>
</html>`;

writeFileSync(outPath, html);
if (man.cego) writeFileSync(outPath.replace(/\.html?$/i, '') + '-chaves.json', JSON.stringify({ lote: man.lote, chaves: keys }, null, 2));
console.log(`Página: ${resolve(outPath)} (${Math.round(html.length / 1024)} KB, ${cards.length} sites${man.cego ? ', modo cego' : ''})`);

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
}
