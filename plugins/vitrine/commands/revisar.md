---
description: Diagnóstico de um site existente — o que tem "cara de IA", o que falta para negócio local, o que manter
argument-hint: "[url ou pasta do site]"
allowed-tools: Read, Glob, Grep, Write, Bash(node:*), PowerShell(node:*), Bash(mkdir:*), Bash(ls:*)
---

Use a skill `landing-page` (no plugin, `vitrine:landing-page`) e faça o diagnóstico descrito na seção "Diagnóstico" de `references/aproveitar.md`.

Site: $ARGUMENTS

Capture o site com o `scripts/screenshot.mjs`. Avalie com `references/anti-padroes.md` e com o checklist de `references/negocio-local.md`. Entregue um `diagnostico.md` e um resumo na conversa com os 3 problemas mais importantes e o que vale manter.
