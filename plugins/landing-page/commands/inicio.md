---
description: Mostra o passo a passo da skill landing-page, confere se o computador está pronto e diz como começar
allowed-tools: Read, Glob, Bash(node:*)
---

Faça duas verificações rápidas antes de mostrar o guia:

1. **Requisitos:** rode `node "${CLAUDE_PLUGIN_ROOT}/skills/landing-page/scripts/screenshot.mjs" --verificar`.
   - Se tudo der "ok", não comente nada.
   - Se o comando `node` não existir, ou se faltar o navegador, explique em linguagem simples o que instalar e onde. O Node LTS se baixa em https://nodejs.org, depois de instalar é preciso fechar e abrir o terminal, e o Chrome ou o Edge servem como navegador. Diga também que o resto da skill funciona, mas que sem isso ela não consegue tirar os prints de revisão.
2. **Perfil:** use a ferramenta Glob com o padrão `*.md` na pasta `~/.claude/landing-page/`. Se não houver arquivos, destaque que o primeiro passo recomendado é `/lp:perfil`.

Depois, mostre à pessoa o guia de início abaixo, adaptando o tom e sem jargão. Termine perguntando por onde ela quer começar.

---

@${CLAUDE_PLUGIN_ROOT}/skills/landing-page/references/comecar.md
