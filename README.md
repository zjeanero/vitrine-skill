# claude-skills

Skills pessoais para o Claude Code.

**Comece pelo [GUIA.md](GUIA.md):** o que fizemos, o que tem aqui, como usar a skill e como comparar resultados com e sem ela.

## landing-page

Cria landing pages e sites de uma página com identidade própria, que não parecem feitos por IA, para clientes de freela/agência e negócios locais. O processo:

1. **Briefing.**
2. **Escavação do mundo do cliente:** os objetos do negócio (cardápio, comanda, recibo, letreiro) viram o conceito visual.
3. **Conceito e tipografia.**
4. **Texto em português,** sem dados inventados.
5. **Construção em HTML/CSS/JS,** com PHP opcional, SEO local e WhatsApp.
6. **Revisão visual por screenshot** no desktop e no celular.

Arquivos (em `plugins/landing-page/skills/landing-page/`):
- `SKILL.md`: o processo completo.
- `references/`: anti-padrões de "cara de IA", análise dos sites de referência, tipografia, requisitos de negócio local, stack.
- `scripts/screenshot.mjs`: prints de desktop (1440×900) e celular (390×844), com relatório de erros de JS, recursos quebrados e rolagem horizontal. Não tem dependências.

Os casos de teste e as ferramentas de avaliação ficam em `avaliacao/`. Exemplos de perfil ficam em `perfis/`.

### Instalar

Dentro do Claude Code:

```
/plugin install landing-page --marketplace zjeanero/claude-skills
```

Ou no terminal:

```
claude plugin install landing-page --marketplace zjeanero/claude-skills
```

Para atualizar depois: `claude plugin update landing-page@claude-skills`. Para remover: `claude plugin uninstall landing-page@claude-skills`.

O script de screenshot precisa de Node 22 ou mais recente e de Chrome ou Edge instalado. Se o navegador estiver num lugar diferente do padrão, defina a variável `CHROME_PATH`.

### Usar

Depois de instalar, digite **`/lp-inicio`**: o Claude mostra o passo a passo e pergunta por onde começar.

| Comando | Para quê |
|---|---|
| `/lp-inicio` | Passo a passo e comandos |
| `/lp-perfil` | Monta o seu perfil: referências (links ou prints), stack, gosto |
| `/lp-briefing` | Mensagem pronta para o cliente no WhatsApp: perguntas e lista de fotos |
| `/lp-aproveitar` | Extrai conteúdo do site, Instagram ou Google do cliente |
| `/lp-conceitos` | Apresentação com 2 ou 3 direções para o cliente escolher (HTML + PDF) |
| `/lp-site` | Constrói o site, com revisão no computador e no celular |
| `/lp-revisar` | Diagnóstico de um site existente |

Também funciona falando normalmente, por exemplo "faz uma landing page pra padaria do Sérgio…". O passo a passo completo está no [GUIA.md](GUIA.md#4-como-usar-a-skill).

### Deixe do seu jeito (perfil pessoal)

A skill é a mesma para todo mundo. O gosto de cada um fica num **perfil** em `~/.claude/landing-page/`, fora do plugin, então as atualizações da skill não apagam nada. O perfil tem três arquivos:

- `preferencias.md`: para quem você faz sites, sua stack (HTML, PHP, Astro, Next…), o que você ama e o que odeia.
- `referencias.md`: sites que você admira, analisados pelo Claude.
- `registro.md`: seus projetos entregues, para cada cliente receber fontes e cores diferentes.

Para montar o seu, peça ao Claude:

> configura a skill landing-page do meu jeito

Ele faz algumas perguntas, tira prints dos sites que você admira, analisa e grava o perfil. Depois, para acrescentar uma referência, peça: "adiciona essa referência na skill landing-page: https://…". A pasta `perfis/` tem um perfil preenchido de exemplo.
