#!/usr/bin/env node
// Screenshots de uma página (URL ou arquivo local) em desktop e mobile, sem dependências.
// Usa o Chrome/Edge instalado via Chrome DevTools Protocol (Node 22+ tem WebSocket nativo).
//
// Uso:
//   node screenshot.mjs <url-ou-arquivo> <pasta-de-saida> [opções]
//
// Opções:
//   --only=desktop|mobile   captura só um dos tamanhos
//   --slices=N              máximo de "telas" capturadas rolando a página (padrão 10)
//   --wait=MS               espera extra após o load, para fontes e animações (padrão 2500)
//   --no-full               não gera a imagem da página inteira
//   --click=SELETOR         clica num elemento antes de capturar (ex.: botão "Enter", menu mobile)
//
// Sites com rolagem virtual (WebGL, scroll em JS) são rolados com eventos de roda do mouse.
//
// Saída (na pasta indicada):
//   desktop-01.png, desktop-02.png ...  uma imagem por tela rolada (1440x900)
//   mobile-01.png, mobile-02.png ...    idem no celular (390x844)
//   desktop-full.png, mobile-full.png   página inteira
//   report.json                         erros de JS, recursos que falharam, overflow horizontal

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
  console.error('Uso: node screenshot.mjs <url-ou-arquivo> <pasta-de-saida> [--only=desktop|mobile] [--slices=10] [--wait=2500] [--no-full]');
  process.exit(1);
}

let [target, outDir] = positional;
if (!/^(https?|file):/i.test(target)) target = pathToFileURL(resolve(target)).href;
outDir = resolve(outDir);
mkdirSync(outDir, { recursive: true });

const maxSlices = Number(flags.slices ?? 10);
const extraWait = Number(flags.wait ?? 2500);
const fullPage = !flags['no-full'];
const clickSelector = typeof flags.click === 'string' ? flags.click : null;

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

async function capture(browser, name, vp) {
  const { send, on } = browser;
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) =>
    (await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;

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
  await s('Page.navigate', { url: target });
  await loaded;
  await evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
  await sleep(extraWait);

  if (clickSelector) {
    const clicked = await evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(clickSelector)}); if (!el) return false; el.click(); return true; })()`,
    );
    if (!clicked) errors.push(`--click: seletor não encontrado: ${clickSelector}`);
    await sleep(extraWait);
  }

  const pageHeight = () =>
    evaluate('Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)');

  let height = await pageHeight();

  // Rolagem virtual: o documento não rola, o conteúdo anda via JS ao receber eventos de roda.
  if (height <= vp.height + 10) {
    const files = [];
    for (let i = 0; i < maxSlices; i++) {
      if (i > 0) {
        for (let k = 0; k < 6; k++) {
          await s('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: vp.width / 2,
            y: vp.height / 2,
            deltaX: 0,
            deltaY: vp.height / 6,
          });
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
    await send('Target.closeTarget', { targetId });
    return { viewport: `${vp.width}x${vp.height}`, pageHeight: height, virtualScroll: true, files, errors, failedRequests: failed };
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

  const files = [];
  const slices = Math.min(maxSlices, Math.max(1, Math.ceil(height / vp.height)));
  for (let i = 0; i < slices; i++) {
    await evaluate(`window.scrollTo(0, ${i * vp.height})`);
    await sleep(900);
    const { data } = await s('Page.captureScreenshot', { format: 'png' });
    const file = `${name}-${String(i + 1).padStart(2, '0')}.png`;
    writeFileSync(join(outDir, file), Buffer.from(data, 'base64'));
    files.push(file);
  }

  if (fullPage) {
    await evaluate('window.scrollTo(0, 0)');
    await sleep(600);
    const clipHeight = Math.min(height, 14000);
    const { data } = await s('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: vp.width, height: clipHeight, scale: 1 },
    });
    writeFileSync(join(outDir, `${name}-full.png`), Buffer.from(data, 'base64'));
    files.push(`${name}-full.png`);
  }

  const layout = await evaluate(`(() => {
    const doc = document.documentElement;
    const overflowX = doc.scrollWidth > doc.clientWidth + 1;
    const describe = (el) => {
      const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
      const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
      return el.tagName.toLowerCase() + cls + (text ? ' "' + text + '"' : '');
    };
    // Elementos que passam da borda, ou cujo conteúdo (ex.: palavra gigante) vaza da própria caixa.
    const wide = overflowX
      ? [...document.querySelectorAll('body *')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return false;
            const vazaConteudo = el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'visible';
            return r.right > doc.clientWidth + 1 || vazaConteudo;
          })
          .filter((el, _, all) => !all.some((other) => other !== el && el.contains(other)))
          .slice(0, 5)
          .map(describe)
      : [];
    const fonts = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button')].map((el) => getComputedStyle(el).fontFamily))].slice(0, 6);
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, overflowX, overflowingElements: wide, fonts };
  })()`);

  off();
  await send('Target.closeTarget', { targetId });
  return { viewport: `${vp.width}x${vp.height}`, pageHeight: height, files, layout, errors, failedRequests: failed };
}

const browser = await launch();
const report = { target, capturedAt: new Date().toISOString(), results: {} };
try {
  for (const [name, vp] of Object.entries(selected)) {
    report.results[name] = await capture(browser, name, vp);
  }
} finally {
  await browser.close();
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

for (const [name, r] of Object.entries(report.results)) {
  const flagsOut = [];
  if (r.layout?.overflowX) flagsOut.push(`OVERFLOW HORIZONTAL (${r.layout.scrollWidth}px > ${r.layout.clientWidth}px): ${r.layout.overflowingElements.join(', ')}`);
  if (r.errors.length) flagsOut.push(`${r.errors.length} erro(s) de JS`);
  if (r.failedRequests.length) flagsOut.push(`${r.failedRequests.length} recurso(s) falharam`);
  console.log(`${name}: ${r.files.length} imagens, altura ${r.pageHeight}px${flagsOut.length ? ' | ' + flagsOut.join(' | ') : ' | ok'}`);
}
console.log(`Saída: ${outDir}`);
