---
description: Monta a apresentação com 2 ou 3 direções visuais para o cliente escolher (HTML + PDF)
argument-hint: "[cliente]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), PowerShell(node:*), Bash(mkdir:*), Bash(ls:*), Bash(cp:*), Bash(mv:*)
---

Use a skill `landing-page` (no plugin, `lp:landing-page`). Faça as etapas 1 a 3 do processo (briefing, escavação, conceito), aproveitando o `<cliente>/briefing.md` e o `material/` se existirem. Depois, gere a apresentação seguindo `references/apresentacao.md`.

Cliente: $ARGUMENTS

Na entrega, diga onde estão o `index.html` e o `pagina.pdf` e sugira a mensagem curta para mandar junto ao cliente.
