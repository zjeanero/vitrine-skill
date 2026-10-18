// Conteúdo editável pelo cliente: lê abas de uma planilha do Google publicada como CSV e atualiza
// os campos e as listas da página. O HTML já vem com o conteúdo escrito: é o que o Google lê e o que
// fica na tela se a planilha não responder. A planilha só substitui o que mudou.
//
// Campos soltos (aba "informacoes", colunas: campo, valor):
//   <span data-campo="horario_semana">Seg a sex, 7h às 19h</span>
//
// Listas (uma aba por lista; a primeira linha da aba tem os nomes das colunas):
//   <ul data-lista="cardapio">
//     <li>…item escrito à mão…</li>
//     <template data-item><li><b data-col="item"></b> <span data-col="preco" data-formato="preco"></span></li></template>
//   </ul>
//   Agrupada: data-agrupar="secao" na lista, mais um <template data-grupo> com [data-col="secao"] e [data-itens].
//   Linha com "não" na coluna "disponivel" fica fora do site. data-some-vazio esconde o elemento quando a célula está vazia.
//
// Configuração, antes deste script:
//   <script>window.PLANILHAS = { informacoes: 'https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv' };</script>

(() => {
  const teste = window.PLANILHAS_TESTE;
  const fontes = teste || window.PLANILHAS || {};
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
  const falhas = [];
  const avisar = (msg, e) => (teste ? console.error : console.warn)(msg, e || '');

  // CSV com aspas, vírgulas e quebras de linha dentro das células.
  function lerCsv(texto) {
    const linhas = [];
    let linha = [], celula = '', aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (aspas) {
        if (c === '"' && texto[i + 1] === '"') { celula += '"'; i++; }
        else if (c === '"') aspas = false;
        else celula += c;
      } else if (c === '"') aspas = true;
      else if (c === ',') { linha.push(celula); celula = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        linha.push(celula); linhas.push(linha); linha = []; celula = '';
      } else celula += c;
    }
    if (celula !== '' || linha.length) { linha.push(celula); linhas.push(linha); }
    return linhas.filter((l) => l.some((x) => x.trim() !== ''));
  }

  const cache = {};
  const ler = (nome) => (cache[nome] ||= (async () => {
    if (!fontes[nome]) return null;
    const r = await fetch(fontes[nome], { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const [cabecalho, ...resto] = lerCsv(await r.text());
    if (!cabecalho) return [];
    const chaves = cabecalho.map(norm);
    return resto.map((l) => Object.fromEntries(chaves.map((k, i) => [k, (l[i] ?? '').trim()])));
  })());

  const INDISPONIVEL = new Set(['nao', 'n', '0', 'false', 'esgotado', 'indisponivel', 'oculto']);
  const disponivel = (l) => !INDISPONIVEL.has(norm(l.disponivel));

  function formatar(valor, formato) {
    if (formato === 'preco' && /^[R$\s]*\d[\d.,]*$/.test(valor)) {
      const n = Number(valor.replace(/[R$\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
      if (Number.isFinite(n)) return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return valor;
  }

  function preencher(raiz, dados) {
    raiz.querySelectorAll('[data-col]').forEach((el) => {
      const v = dados[norm(el.dataset.col)] ?? '';
      el.textContent = formatar(v, el.dataset.formato);
      if (el.hasAttribute('data-some-vazio')) el.hidden = !v;
    });
  }

  async function campos() {
    const els = document.querySelectorAll('[data-campo]');
    if (!els.length || !fontes.informacoes) return;
    try {
      const linhas = await ler('informacoes');
      const valores = Object.fromEntries(linhas.map((l) => [norm(l.campo), l.valor]));
      els.forEach((el) => {
        const v = valores[norm(el.dataset.campo)];
        if (v) el.textContent = v;
      });
    } catch (e) {
      falhas.push('informacoes');
      avisar('Planilha "informacoes" não respondeu; ficou o conteúdo escrito na página.', e);
    }
  }

  async function lista(el) {
    const nome = el.dataset.lista;
    if (!fontes[nome]) return;
    try {
      const linhas = (await ler(nome)).filter(disponivel);
      if (!linhas.length) return; // aba vazia: melhor manter o que está escrito do que sumir com a lista
      const tItem = el.querySelector(':scope > template[data-item]') || el.querySelector(':scope > template:not([data-grupo])');
      const tGrupo = el.querySelector(':scope > template[data-grupo]');
      const modelos = [...el.querySelectorAll(':scope > template')];
      const novo = document.createDocumentFragment();
      const item = (l) => { const n = tItem.content.cloneNode(true); preencher(n, l); return n; };
      if (tGrupo && el.dataset.agrupar) {
        const chave = norm(el.dataset.agrupar);
        const grupos = new Map();
        for (const l of linhas) {
          if (!grupos.has(l[chave])) grupos.set(l[chave], []);
          grupos.get(l[chave]).push(l);
        }
        for (const [g, ls] of grupos) {
          const n = tGrupo.content.cloneNode(true);
          preencher(n, { [chave]: g });
          const alvo = n.querySelector('[data-itens]');
          ls.forEach((l) => alvo.append(item(l)));
          novo.append(n);
        }
      } else {
        linhas.forEach((l) => novo.append(item(l)));
      }
      el.replaceChildren(...modelos, novo);
    } catch (e) {
      falhas.push(nome);
      avisar('Planilha "' + nome + '" não respondeu; ficou o conteúdo escrito na página.', e);
    }
  }

  Promise.all([campos(), ...[...document.querySelectorAll('[data-lista]')].map(lista)]).then(() => {
    document.documentElement.dataset.conteudo = falhas.length ? 'falhou:' + falhas.join(',') : 'ok';
    if (teste) {
      // No testar.mjs: conta o que veio da planilha para o relatório do teste.
      const listas = Object.fromEntries([...document.querySelectorAll('[data-lista]')].map((el) => [el.dataset.lista, el.querySelectorAll(':scope > :not(template)').length]));
      fetch('/__resultado', { method: 'POST', body: JSON.stringify({ largura: innerWidth, falhas, campos: document.querySelectorAll('[data-campo]').length, listas }) }).catch(() => {});
    }
  });
})();
