#!/usr/bin/env node
// Serve a pasta do site num endereço local (http://127.0.0.1:porta) e abre no navegador.
// Serve para testar a planilha de verdade: aberta direto do arquivo, a página não consegue ler o Google.
// Fica no ar até fechar o terminal (Ctrl+C).
//
// Uso: node servir.mjs <pasta-do-site> [porta]

import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';

const [pastaArg, portaArg] = process.argv.slice(2);
if (!pastaArg) {
  console.error('Uso: node servir.mjs <pasta-do-site> [porta]');
  process.exit(1);
}
const site = resolve(pastaArg);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.csv': 'text/csv' };

const servidor = http.createServer((req, res) => {
  let f = join(site, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (f !== site && !f.startsWith(site + sep)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return res.writeHead(404).end('Não encontrado');
  res.writeHead(200, { 'Content-Type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(readFileSync(f));
});

servidor.listen(Number(portaArg) || 0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${servidor.address().port}/`;
  console.log(`Site no ar em ${url}  (Ctrl+C para parar)`);
  const [cmd, args] = process.platform === 'win32' ? ['explorer.exe', [url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try { spawn(cmd, args, { detached: true, stdio: 'ignore' }).on('error', () => {}).unref(); } catch {}
});
