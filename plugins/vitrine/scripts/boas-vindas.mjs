#!/usr/bin/env node
// Boas-vindas da Vitrine. Na primeira sessão do Claude Code depois da instalação, abre a página
// boas-vindas/index.html no navegador e avisa no terminal. Roda pelo hook SessionStart do plugin;
// nas sessões seguintes, sai sem fazer nada.
//
// Uso:
//   node boas-vindas.mjs           pelo hook: só age na primeira vez
//   node boas-vindas.mjs --abrir   abre a página agora (usado pelo /vitrine:inicio)

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagina = join(raiz, 'boas-vindas', 'index.html');

function abrir(arquivo) {
  // Sem tela (servidor, contêiner, sessão remota): não tenta abrir.
  if (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) return false;
  const [cmd, args] = process.platform === 'win32' ? ['explorer.exe', [arquivo]]
    : process.platform === 'darwin' ? ['open', [arquivo]]
    : ['xdg-open', [arquivo]];
  try {
    const p = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    p.on('error', () => {});
    p.unref();
    return true;
  } catch {
    return false;
  }
}

if (process.argv.includes('--abrir')) {
  console.log(abrir(pagina) ? 'Página de boas-vindas aberta no navegador.' : `Abra no navegador: ${pagina}`);
  process.exit(0);
}

const pasta = process.env.CLAUDE_PLUGIN_DATA || join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude'), 'vitrine');
const marca = join(pasta, 'boas-vindas.json');
if (existsSync(marca)) process.exit(0);
try {
  mkdirSync(pasta, { recursive: true });
  writeFileSync(marca, JSON.stringify({ mostrado: new Date().toISOString() }));
} catch {
  process.exit(0); // sem conseguir marcar, não abre: abriria em toda sessão
}

const abriu = abrir(pagina);
console.log(JSON.stringify({
  systemMessage: `Vitrine instalada. ${abriu ? 'Abri as boas-vindas no seu navegador. ' : ''}Para começar, digite /vitrine:inicio`,
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `A skill Vitrine acabou de ser instalada e esta é a primeira sessão depois disso${abriu ? '; a página de boas-vindas foi aberta no navegador' : ''}. Se a pessoa cumprimentar ou perguntar o que fazer, apresente a versão curta do guia do /vitrine:inicio.`,
  },
}));
