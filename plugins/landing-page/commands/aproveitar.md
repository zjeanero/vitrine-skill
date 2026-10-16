---
description: Extrai conteúdo real do que o cliente já tem (site, Instagram, Google, resposta do briefing)
argument-hint: "[links do cliente, ou: colei a resposta do cliente acima]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), PowerShell(node:*), Bash(mkdir:*), Bash(ls:*), Bash(cp:*)
---

Use a skill `landing-page` (no plugin, `lp:landing-page`).
- **Links:** siga `references/aproveitar.md`.
- **Resposta do briefing colada na conversa** (texto, áudio transcrito, fotos): siga o passo 4 de `references/briefing.md`.

Material: $ARGUMENTS

Descubra a pasta do cliente. Se houver mais de uma possível, pergunte qual. No fim, mostre o que virou fato no `briefing.md` e o que ainda falta.
