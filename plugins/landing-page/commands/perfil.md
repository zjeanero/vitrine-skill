---
description: Monta, atualiza, exporta, importa ou salva seu perfil na skill landing-page (referências, stack, gosto)
argument-hint: "[links, ou: exportar | importar <arquivo> | salvar]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), Bash(mkdir:*), Bash(ls:*), Bash(cp:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*)
---

Use a skill `landing-page` (no plugin, `lp:landing-page`) e siga `references/perfil.md`.

Pedido: $ARGUMENTS

- **Sem pedido e sem perfil** em `~/.claude/landing-page/`: comece pelas perguntas do passo 1.
- **Com links ou prints:** analise-os e atualize só o que mudou no perfil.
- **"exportar":** gere o arquivo único `perfil-<nome>.md` (seção "Exportar").
- **"importar" e um arquivo:** siga a seção "Importar", sem apagar nada sem perguntar.
- **"salvar":** siga a seção "Salvar".
