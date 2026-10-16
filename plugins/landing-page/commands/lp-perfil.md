---
description: Monta ou atualiza seu perfil na skill landing-page (referências por link ou print, stack, gosto)
argument-hint: "[links ou pedido, ex.: adiciona https://site.com]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), Bash(mkdir:*), Bash(ls:*)
---

Use a skill `landing-page` (no plugin, `landing-page:landing-page`) e siga `references/perfil.md`.

Pedido: $ARGUMENTS

- **Sem pedido e sem perfil** em `~/.claude/landing-page/`: comece pelas perguntas do passo 1.
- **Com links ou prints:** analise-os e atualize só o que mudou no perfil.
