---
description: Mostra o passo a passo da skill landing-page, os comandos e como começar
allowed-tools: Read, Glob, Bash(ls:*)
---

Mostre à pessoa o guia de início da skill landing-page, que está abaixo, adaptando o tom e sem jargão.

Perfil da pessoa (pasta `~/.claude/landing-page/`): !`ls ~/.claude/landing-page 2>/dev/null || echo "ainda não existe"`

Se o perfil ainda não existe, destaque que o primeiro passo recomendado é `/lp-perfil`. Termine perguntando por onde a pessoa quer começar.

---

@${CLAUDE_PLUGIN_ROOT}/skills/landing-page/references/comecar.md
