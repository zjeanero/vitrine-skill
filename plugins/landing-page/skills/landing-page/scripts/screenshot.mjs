#!/usr/bin/env node
// Screenshots de uma página (URL ou arquivo local) em desktop e mobile, sem dependências.
// Usa o Chrome/Edge instalado via Chrome DevTools Protocol (Node 22+ tem WebSocket nativo).
//
// Uso:
//   node screenshot.mjs <url-ou-arquivo> <pasta-de-saida> [opções]
//
// Opções:
//   --only=desktop|mobile   captura só um dos tamanhos
//   --slices=N              máximo de "telas" capturadas rolando a página (padrão 12)
//   --wait=MS               espera extra após o load, para fontes e animações (padrão 2500)
//   --no-full               não gera a imagem da página inteira
//   --click=SELETOR         clica num elemento antes de capturar (ex.: botão "Enter", menu mobile)
//   --extra                 inclui no report.json o texto visível da página e métricas de avaliação
//
// Sites com rolagem virtual (WebGL, scroll em JS) são rolados com eventos de roda do mouse.
//
// Saída (na pasta indicada):
//   contato-desktop.png, contato-mobile.png  FOLHA DE CONTATO: miniaturas de todas as telas numa imagem.
//                                            Comece por elas; abra as telas individuais só onde precisar.
//   desktop-01.png, desktop-02.png ...       uma imagem por tela rolada (1440x900)
//   mobile-01.png, mobile-02.png ...         idem no celular (390x844)
//   desktop-full.jpg, mobile-full.jpg        página inteira (até 12000px de altura)
//   report.json                              erros de JS, recursos que falharam, rolagem horizontal,
//                                            conteúdo cortado na borda, fonte do título, WhatsApp na 1ª tela

import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.slice(2).split('=');
    return [k, v ?? true];
  }),
);

if (positional.length < 2) {
  console.error('Uso: node screenshot.mjs <url-ou-arquivo> <pasta-de-saida> [--only=desktop|mobile] [--slices=12] [--wait=2500] [--no-full] [--click=SELETOR] [--extra]');
  process.exit(1);
}

let [target, outDir] = positional;
if (!/^(https?|file):/i.test(target)) target = pathToFileURL(resolve(target)).href;
outDir = resolve(outDir);
mkdirSync(outDir, { recursive: true });

const maxSlices = Number(flags.slices ?? 12);
const extraWait = Number(flags.wait ?? 2500);
const fullPage = !flags['no-full'];
const clickSelector = typeof flags.click === 'string' ? flags.click : null;
const withExtra = Boolean(flags.extra);

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false, dsf: 1 },
  mobile: { width: 390, height: 844, mobile: true, dsf: 2 },
};
const selected = flags.only ? { [flags.only]: VIEWPORTS[flags.only] } : VIEWPORTS;

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

function findChrome() {
  const local = process.env.LOCALAPPDATA;
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    local && join(local, 'Google/Chrome/Application/chrome.exe'),
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    console.error('Chrome/Edge não encontrado. Defina CHROME_PATH com o caminho do executável.');
    process.exit(1);
  }
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const userDataDir = mkdtempSync(join(tmpdir(), 'lp-shot-'));
  const proc = spawn(
    findChrome(),
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--mute-audio',
      '--enable-unsafe-swiftshader',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--allow-file-access-from-files',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const portFile = join(userDataDir, 'DevToolsActivePort');
  for (let i = 0; i < 150 && !existsSync(portFile); i++) await sleep(100);
  if (!existsSync(portFile)) throw new Error('O Chrome não abriu a porta de depuração a tempo.');
  let lines = [];
  for (let i = 0; i < 20; i++) {
    lines = readFileSync(portFile, 'utf8').trim().split('\n');
    if (lines.length >= 2) break;
    await sleep(100);
  }
  const ws = new WebSocket(`ws://127.0.0.1:${lines[0].trim()}${lines[1].trim()}`);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error('Falha ao conectar no Chrome.'));
  });

  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  };
  // Se o Chrome cair, falha as chamadas pendentes em vez de deixar o processo pendurado.
  ws.onclose = () => {
    for (const { reject } of pending.values()) reject(new Error('O Chrome fechou a conexão (provável travamento).'));
    pending.clear();
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const on = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  const close = async () => {
    try { await send('Browser.close'); } catch {}
    try { ws.close(); } catch {}
    await sleep(300);
    try { proc.kill(); } catch {}
    try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  };
  return { send, on, close };
}

async function openTab(browser) {
  const { send, on } = browser;
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) =>
    (await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;
  const navigate = async (url) => {
    const loaded = new Promise((res) => {
      const t = setTimeout(res, 30000);
      const stop = on((msg) => {
        if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') {
          clearTimeout(t);
          stop();
          res();
        }
      });
    });
    await s('Page.navigate', { url });
    await loaded;
  };
  const close = async () => {
    try { await send('Target.closeTarget', { targetId }); } catch {}
  };
  return { sessionId, s, evaluate, navigate, close };
}

// Medições na primeira tela, antes de rolar.
const FIRST_SCREEN_JS = (extra) => `(() => {
  const vw = innerWidth, vh = innerHeight;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (!(r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && r.width > 0 && r.height > 0)) return false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  };
  const family = (el) => getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
  const webfont = (fam) => [...document.fonts].some((f) => f.family.replace(/["']/g, '') === fam);
  const loaded = (fam) => [...document.fonts].some((f) => f.family.replace(/["']/g, '') === fam && f.status === 'loaded');

  // A "voz display" é o maior texto visível na primeira tela, seja ele h1 ou não.
  let biggest = null;
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim();
    const el = n.parentElement;
    if (!t || !el || !visible(el)) continue;
    texts.push(t);
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (!biggest || size > biggest.size) biggest = { el, size, t };
  }
  const displayFont = biggest
    ? { texto: biggest.t.slice(0, 60), fonte: family(biggest.el), tamanhoPx: Math.round(biggest.size), webfont: webfont(family(biggest.el)), carregou: loaded(family(biggest.el)) }
    : null;
  const wa = [...document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]')];
  const h1s = [...document.querySelectorAll('h1')];
  const out = {
    fonteDisplay: displayFont,
    linksWhatsApp: wa.length,
    whatsappNaPrimeiraTela: wa.some(visible),
    quantidadeH1: h1s.length,
    lang: document.documentElement.getAttribute('lang'),
  };
  if (${extra}) {
    const h1 = h1s[0];
    out.waLinks = wa.map((a) => a.getAttribute('href')).slice(0, 10);
    out.textoPrimeiraTela = texts.join(' | ').slice(0, 2000);
    out.h1Texto = h1 ? h1.innerText.trim().replace(/\\s+/g, ' ').slice(0, 200) : null;
    out.h1Fonte = h1 ? family(h1) : null;
    out.textoDaPagina = document.body.innerText.replace(/\\s+/g, ' ').slice(0, 20000);
  }
  return out;
})()`;

const LAYOUT_JS = `(() => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const overflowX = doc.scrollWidth > vw + 1;
  const describe = (el) => {
    const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
    const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    return el.tagName.toLowerCase() + cls + (text ? ' "' + text + '"' : '');
  };
  const leaves = (list) => list.filter((el, _, all) => !all.some((other) => other !== el && el.contains(other)));
  const shown = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  };
  const all = [...document.querySelectorAll('body *')];

  // Elementos que passam da borda, ou cujo conteúdo (ex.: palavra gigante) vaza da própria caixa.
  const wide = overflowX
    ? leaves(all.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        const vazaConteudo = el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'visible';
        return r.right > vw + 1 || vazaConteudo;
      })).slice(0, 5).map(describe)
    : [];

  // Conteúdo cortado na borda: passa da tela, mas a rolagem lateral foi escondida
  // (overflow-x: hidden/clip no html ou body). Cortes dentro de um container da página
  // (carrossel, letreiro) são intencionais e ficam de fora.
  const cut = leaves(all.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    if (!(r.right > vw + 1 || r.left < -1)) return false;
    if (!shown(el)) return false;
    for (let a = el.parentElement; a && a !== document.body && a !== doc; a = a.parentElement) {
      if (getComputedStyle(a).overflowX !== 'visible') return false;
    }
    return true;
  })).slice(0, 5).map(describe);

  const fonts = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button')].map((el) => getComputedStyle(el).fontFamily))].slice(0, 6);
  return { scrollWidth: doc.scrollWidth, clientWidth: vw, overflowX, overflowingElements: wide, cortadoNaBorda: overflowX ? [] : cut, fonts };
})()`;

async function capture(browser, name, vp) {
  const { on } = browser;
  const tab = await openTab(browser);
  const { s, evaluate, sessionId } = tab;

  const errors = [];
  const failed = [];
  const urls = new Map();
  const off = on((msg) => {
    if (msg.sessionId !== sessionId) return;
    const p = msg.params;
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text);
    } else if (msg.method === 'Runtime.consoleAPICalled' && p.type === 'error') {
      errors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' '));
    } else if (msg.method === 'Network.requestWillBeSent') {
      urls.set(p.requestId, p.request.url);
    } else if (msg.method === 'Network.responseReceived' && p.response.status >= 400) {
      failed.push(`${p.response.status} ${p.response.url}`);
    } else if (msg.method === 'Network.loadingFailed' && !p.canceled) {
      failed.push(`${p.errorText} ${urls.get(p.requestId) ?? ''}`);
    }
  });

  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dsf,
    mobile: vp.mobile,
  });
  if (vp.mobile) {
    await s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await s('Emulation.setUserAgentOverride', { userAgent: MOBILE_UA });
  }

  await tab.navigate(target);
  await evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
  await sleep(extraWait);

  if (clickSelector) {
    const clicked = await evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(clickSelector)}); if (!el) return false; el.click(); return true; })()`,
    );
    if (!clicked) errors.push(`--click: seletor não encontrado: ${clickSelector}`);
    await sleep(extraWait);
  }

  const firstScreen = await evaluate(FIRST_SCREEN_JS(withExtra));

  const pageHeight = () =>
    evaluate('Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)');

  let height = await pageHeight();
  const files = [];

  // Rolagem virtual: o documento não rola, o conteúdo anda via JS ao receber eventos de roda.
  if (height <= vp.height + 10) {
    for (let i = 0; i < maxSlices; i++) {
      if (i > 0) {
        for (let k = 0; k < 6; k++) {
          await s('Input.dispatchMouseEvent', { type: 'mouseWheel', x: vp.width / 2, y: vp.height / 2, deltaX: 0, deltaY: vp.height / 6 });
          await sleep(60);
        }
        await sleep(1400);
      }
      const { data } = await s('Page.captureScreenshot', { format: 'png' });
      const file = `${name}-${String(i + 1).padStart(2, '0')}.png`;
      writeFileSync(join(outDir, file), Buffer.from(data, 'base64'));
      files.push(file);
    }
    off();
    await tab.close();
    return { viewport: `${vp.width}x${vp.height}`, pageHeight: height, virtualScroll: true, files, primeiraTela: firstScreen, errors, failedRequests: failed };
  }

  // Rola a página inteira uma vez para disparar animações de entrada e lazy-loading.
  for (let y = 0; y < height; y += Math.round(vp.height * 0.6)) {
    await evaluate(`window.scrollTo(0, ${y})`);
    await sleep(250);
    height = await pageHeight();
  }
  await evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
  await sleep(800);
  await evaluate('window.scrollTo(0, 0)');
  await sleep(1000);
  height = await pageHeight();

  const slices = Math.min(maxSlices, Math.max(1, Math.ceil(height / vp.height)));
  for (let i = 0; i < slices; i++) {
    await evaluate(`window.scrollTo(0, ${i * vp.height})`);
    await sleep(900);
    const { data } = await s('Page.captureScreenshot', { format: 'png' });
    const file = `${name}-${String(i + 1).padStart(2, '0')}.png`;
    writeFileSync(join(outDir, file), Buffer.from(data, 'base64'));
    files.push(file);
  }

  const layout = await evaluate(LAYOUT_JS);

  // Página inteira por último: se o Chrome travar aqui, as medições acima já estão salvas.
  let fullPageError = null;
  if (fullPage) {
    try {
      await evaluate('window.scrollTo(0, 0)');
      // Densidade 1: em densidade 2 uma página longa passa do limite de textura e derruba o Chrome.
      await s('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
      await sleep(800);
      const shot = s('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 75,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(height, 12000), scale: 1 },
      });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('tempo esgotado na captura da página inteira')), 45000));
      const { data } = await Promise.race([shot, timeout]);
      writeFileSync(join(outDir, `${name}-full.jpg`), Buffer.from(data, 'base64'));
      files.push(`${name}-full.jpg`);
    } catch (e) {
      fullPageError = e.message;
    }
  }

  off();
  await tab.close();
  return { viewport: `${vp.width}x${vp.height}`, pageHeight: height, files, primeiraTela: firstScreen, layout, errors, failedRequests: failed, fullPageError };
}

// Folha de contato: miniaturas numeradas de todas as telas numa imagem só.
// Dá a visão do ritmo da página inteira gastando uma imagem em vez de dez.
async function contactSheet(name, vp, files) {
  const slices = files.filter((f) => /-\d+\.png$/.test(f));
  if (slices.length < 2) return null;
  const thumb = vp.mobile ? 180 : 340;
  const cols = vp.mobile ? 7 : 4;
  const gap = 12;
  const width = 32 + cols * thumb + (cols - 1) * gap;
  const html = `<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; padding: 16px; background: #e6e6e6; font: 13px/1.2 system-ui, sans-serif; color: #222; }
    .grade { display: grid; grid-template-columns: repeat(${cols}, ${thumb}px); gap: 16px ${gap}px; }
    figure { margin: 0; }
    img { display: block; width: ${thumb}px; border: 1px solid #aaa; background: #fff; }
    figcaption { margin-top: 4px; font-weight: 600; }
  </style><div class="grade">${slices
    .map((f) => `<figure><img src="${f}"><figcaption>${f.replace('.png', '')}</figcaption></figure>`)
    .join('')}</div>`;
  const htmlPath = join(outDir, `_contato-${name}.html`);
  writeFileSync(htmlPath, html);
  const browser = await launch();
  try {
    const tab = await openTab(browser);
    await tab.s('Page.enable');
    await tab.s('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false });
    await tab.navigate(pathToFileURL(htmlPath).href);
    await sleep(300);
    const sheetHeight = await tab.evaluate('document.documentElement.scrollHeight');
    const { data } = await tab.s('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: sheetHeight, scale: 1 },
    });
    const file = `contato-${name}.png`;
    writeFileSync(join(outDir, file), Buffer.from(data, 'base64'));
    return file;
  } finally {
    await browser.close();
    try { rmSync(htmlPath); } catch {}
  }
}

// Um Chrome por tamanho de tela: se um travar, o outro não é afetado.
const report = { target, capturedAt: new Date().toISOString(), results: {} };
for (const [name, vp] of Object.entries(selected)) {
  const browser = await launch();
  try {
    report.results[name] = await capture(browser, name, vp);
  } catch (e) {
    report.results[name] = { viewport: `${vp.width}x${vp.height}`, files: [], errors: [`falha na captura: ${e.message}`], failedRequests: [] };
  } finally {
    await browser.close();
  }
  try {
    const sheet = await contactSheet(name, vp, report.results[name].files);
    if (sheet) report.results[name].folhaDeContato = sheet;
  } catch (e) {
    report.results[name].folhaDeContatoErro = e.message;
  }
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

for (const [name, r] of Object.entries(report.results)) {
  const notes = [];
  if (r.layout?.overflowX) notes.push(`ROLAGEM LATERAL (${r.layout.scrollWidth}px > ${r.layout.clientWidth}px): ${r.layout.overflowingElements.join(', ')}`);
  if (r.layout?.cortadoNaBorda?.length) notes.push(`CORTADO NA BORDA (vazamento escondido por overflow): ${r.layout.cortadoNaBorda.join(', ')}`);
  if (r.errors.length) notes.push(`${r.errors.length} erro(s) de JS`);
  if (r.failedRequests.length) notes.push(`${r.failedRequests.length} recurso(s) falharam`);
  const fd = r.primeiraTela?.fonteDisplay;
  if (fd?.webfont && !fd.carregou) notes.push(`FONTE "${fd.fonte}" NÃO CARREGOU (aparece a reserva)`);
  if (r.primeiraTela?.linksWhatsApp && !r.primeiraTela.whatsappNaPrimeiraTela && name === 'mobile') notes.push('WhatsApp fora da primeira tela no celular');
  const font = fd ? ` | título: ${fd.fonte} ${fd.tamanhoPx}px` : '';
  const sheet = r.folhaDeContato ? ` | ${r.folhaDeContato}` : '';
  console.log(`${name}: ${r.files.length} imagens, altura ${r.pageHeight}px${font}${sheet}${notes.length ? ' | ' + notes.join(' | ') : ' | ok'}`);
}
console.log(`Saída: ${outDir}`);
