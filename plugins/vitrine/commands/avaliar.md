---
description: Página de aprovação (Aprovado / Em dúvida / Não aprovado) para sites prontos, e aprendizado do seu gosto com o resultado
argument-hint: "[pasta ou sites para avaliar, ou cole o resultado da aprovação]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), PowerShell(node:*), Bash(mkdir:*), Bash(ls:*)
---

Use a skill `landing-page` (no plugin, `vitrine:landing-page`) e siga `references/aprovacao.md`.

Pedido: $ARGUMENTS

- **Se o pedido tiver um bloco `<lp-aprovacao>`** (ou se a pessoa colou o resultado na conversa): processe o resultado (seção 2) e atualize o histórico e o `gosto-aprendido.md`.
- **Caso contrário:** gere a página de aprovação (seção 1) para os sites indicados. Sem indicação, pergunte quais sites ou pastas avaliar.
