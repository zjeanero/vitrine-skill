# claude-skills

Skills pessoais para o Claude Code.

## landing-page

Cria landing pages e sites de uma página com identidade própria, que não parecem feitos por IA, para clientes de freela/agência e negócios locais. O processo:

1. **Briefing.**
2. **Escavação do mundo do cliente:** os objetos do negócio (cardápio, comanda, recibo, letreiro) viram o conceito visual.
3. **Conceito e tipografia.**
4. **Texto em português,** sem dados inventados.
5. **Construção em HTML/CSS/JS,** com PHP opcional, SEO local e WhatsApp.
6. **Revisão visual por screenshot** no desktop e no celular.

Arquivos:
- `SKILL.md`: o processo completo.
- `references/`: anti-padrões de "cara de IA", análise dos sites de referência, tipografia, requisitos de negócio local, stack.
- `scripts/screenshot.mjs`: prints de desktop (1440×900) e celular (390×844), com relatório de erros de JS, recursos quebrados e rolagem horizontal. Não tem dependências.
- `registro.md`: fontes e paletas usadas em cada projeto, para os clientes não ficarem parecidos entre si.
- `evals/`: casos de teste.

### Instalar

Copie a pasta `landing-page` para a pasta de skills do Claude Code:

- Windows: `C:\Users\<você>\.claude\skills\landing-page`
- macOS/Linux: `~/.claude/skills/landing-page`

O script de screenshot precisa de Node 22 ou mais recente e de Chrome ou Edge instalado. Se o navegador estiver num lugar diferente do padrão, defina a variável `CHROME_PATH`.

### Usar

Peça uma landing page normalmente, por exemplo "faz uma landing page pra padaria do Sérgio…". A skill é acionada sozinha. Também dá para chamar com `/landing-page`.
