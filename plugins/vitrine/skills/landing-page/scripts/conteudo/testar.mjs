#!/usr/bin/env node
// Testa o conteúdo editável sem a planilha publicada: serve a pasta do site num endereço local,
// faz cada aba ler o CSV de mesmo nome da pasta de CSVs e tira os prints com o screenshot.mjs.
//
// Uso:
//   node testar.mjs <pasta-do-site> <pasta-dos-csv> <pasta-de-saida> [opções do screenshot.mjs]
//
// Exemplo: node testar.mjs cliente/site cliente/conteudo cliente/site/screenshots-planilha --slices=4

import http from 'node:http';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, extname, dirname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [siteArg, csvArg, saida, ...extra] = process.argv.slice(2);
if (!siteArg || !csvArg || !saida) {
  console.error('Uso: node testar.mjs <pasta-do-site> <pasta-dos-csv> <pasta-de-saida> [opções do screenshot.mjs]');
  process.exit(1);
}
const site = resolve(siteArg);
const csvs = resolve(csvArg);
const abas = readdirSync(csvs).filter((f) => f.toLowerCase().endsWith('.csv')).map((f) => f.slice(0, -4));
if (!abas.length) {
  console.error(`Nenhum .csv em ${csvs}`);
  process.exit(1);
}
const teste = Object.fromEntries(abas.map((a) => [a, '/__planilha/' + encodeURIComponent(a)]));
const injecao = `<script>window.PLANILHAS_TESTE = ${JSON.stringify(teste)};</script>`;

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.pdf': 'application/pdf' };
const resultados = [];

const servidor = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (req.method === 'POST' && url === '/__resultado') {
    let corpo = '';
    req.on('data', (d) => { corpo += d; });
    req.on('end', () => { try { resultados.push(JSON.parse(corpo)); } catch {} res.writeHead(204).end(); });
    return;
  }
  if (url.startsWith('/__planilha/')) {
    const f = join(csvs, url.slice('/__planilha/'.length) + '.csv');
    if (!f.startsWith(csvs + sep) || !existsSync(f)) return res.writeHead(404).end();
    return res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' }).end(readFileSync(f));
  }
  let f = join(site, url);
  if (f !== site && !f.startsWith(site + sep)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return res.writeHead(404).end();
  const tipo = MIME[extname(f).toLowerCase()] || 'application/octet-stream';
  let corpo = readFileSync(f);
  if (tipo.startsWith('text/html')) corpo = corpo.toString('utf8').replace(/<head[^>]*>/i, (m) => m + injecao);
  res.writeHead(200, { 'Content-Type': tipo }).end(corpo);
});

servidor.listen(0, '127.0.0.1', () => {
  const endereco = `http://127.0.0.1:${servidor.address().port}/`;
  if (!existsSync(join(site, 'index.html'))) console.warn('Aviso: sem index.html na pasta do site (PHP não roda neste teste; use a versão .html).');
  const screenshot = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'screenshot.mjs');
  const p = spawn(process.execPath, [screenshot, endereco, saida, ...extra], { stdio: 'inherit' });
  p.on('exit', (codigo) => {
    servidor.close();
    if (!resultados.length) {
      console.log('CONTEÚDO: a página não usou o conteudo.js (ou ele não terminou). Confira se o script está incluído.');
      process.exit(codigo || 1);
    }
    for (const r of resultados) {
      const listas = Object.entries(r.listas).map(([n, q]) => `${n}: ${q} itens`).join(', ') || 'nenhuma';
      console.log(`CONTEÚDO (${r.largura}px): ${r.falhas.length ? 'FALHOU em ' + r.falhas.join(', ') : 'ok'} · ${r.campos} campos · listas: ${listas}`);
    }
    process.exit(codigo || 0);
  });
});
