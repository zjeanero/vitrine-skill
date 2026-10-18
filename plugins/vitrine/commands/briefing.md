---
description: Gera a mensagem de briefing para mandar ao cliente no WhatsApp (perguntas + lista de fotos)
argument-hint: "[cliente e o que você já sabe, ex.: Padaria do Sérgio, Santa Tereza, BH]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(mkdir:*), Bash(ls:*)
---

Use a skill `landing-page` (no plugin, `vitrine:landing-page`) e siga `references/briefing.md`.

Cliente e informações: $ARGUMENTS

Se faltar o nome do cliente ou o tipo de negócio, pergunte só isso antes de escrever a mensagem. Crie a pasta do cliente com o `briefing.md` inicial.
