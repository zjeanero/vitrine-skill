# Perfil-modelo

Estes três arquivos são o **seu perfil**: o que faz a skill trabalhar do seu jeito.

| Arquivo | O que vai nele |
|---|---|
| `preferencias.md` | Para quem você faz sites, a sua stack, o seu gosto, o que nunca fazer |
| `referencias.md` | Sites, embalagens, cartazes de que você gosta, cada um analisado |
| `registro.md` | Os projetos entregues, preenchido sozinho, para não repetir fontes e cores |

## Jeito fácil (recomendado)

Não precisa copiar nada. No Claude Code, digite:

```
/alfaiate:perfil
```

O Claude faz algumas perguntas, analisa as suas referências (links ou prints) e cria os arquivos para você.

## Jeito manual

Copie os três arquivos para a pasta `~/.claude/landing-page/` (no Windows, `C:\Users\<você>\.claude\landing-page\`) e preencha.

## Recebeu o perfil de alguém?

```
/alfaiate:perfil importar perfil-<nome>.md
```

O perfil importado vira uma cópia sua. Depois, é só pedir para adaptar ao seu gosto.
