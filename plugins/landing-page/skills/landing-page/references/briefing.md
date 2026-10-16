# Briefing com o cliente

O que mais limita a qualidade de uma landing page é a falta de conteúdo real. Sem ele, a página se enche de marcadores `[[...]]` e de frases genéricas. Este modo gera uma mensagem que o freelancer manda ao cliente pelo WhatsApp para conseguir esse conteúdo com o mínimo de esforço do cliente.

## 1. Antes de escrever a mensagem

- **Junte o que já se sabe:** o pedido do usuário, links, o perfil. Não pergunte o que já foi dito; peça para confirmar.
- **Faça uma escavação rápida do negócio** (a etapa 2 do `SKILL.md`). Ela orienta as perguntas e, principalmente, a lista de fotos: numa padaria, o forno aceso e a vitrine às 7h; numa oficina, a bancada e a peça gasta ao lado da nova.

## 2. Escrever a mensagem

Escreva na voz do freelancer, que é quem manda a mensagem, com um tom simples, próximo e sem jargão.

```
Oi, [nome]! Tudo bem? Pra fazer o site da [negócio] com a cara de vocês, preciso de algumas informações. Pode responder por áudio, do jeito que for mais fácil 🙂

*Sobre vocês*
1. …
2. …

*Funcionamento* (confere se está certo?)
• Endereço: …
• Horário: …

*Fotos* (pelo celular mesmo, com luz natural e sem filtro)
📸 …
📸 …

*Links*
• Instagram, site antigo, Google Maps: pode mandar o que tiver.

Obrigado!
```

**Regras da mensagem:**
- **No máximo 8 perguntas abertas.** Mensagem longa não é respondida. Separe o essencial do "se puder".
- **Pergunte por histórias e fatos, não por adjetivos.**
  - "Como vocês começaram?"
  - "O que os clientes mais elogiam?"
  - "Qual produto sai mais?"
  - "Tem alguma coisa que só vocês fazem?"
- **Peça avaliações reais:** prints das avaliações do Google de que o cliente mais gosta, com autorização para usar.
- **Lista de fotos específica** (de 4 a 6), tirada da escavação, com uma dica de como fotografar cada uma. "Foto do produto" é vago demais; "o pão de queijo partido ao meio, de perto, na luz da janela" é o nível certo.
- **Segmentos com regras próprias.**
  - *Saúde:* número do conselho (CRM, CRO, etc.) e se tem título de especialista registrado.
  - *Advocacia:* número da OAB.
- **Emojis:** só na mensagem do WhatsApp, onde são naturais. Nunca no site.
- **Nunca peça senhas,** nem do Instagram, nem do Google, nem da hospedagem.

## 3. Criar o `briefing.md`

Na pasta do cliente, crie `<cliente>/briefing.md` com o que já se sabe e a mensagem enviada:

```markdown
# Briefing: [negócio]

## Fatos
| Informação | Valor | Fonte |
|---|---|---|
| Endereço | Rua Mármore, 512, Santa Tereza, BH | pedido do usuário |

## Pendente
- [ ] História do dono
- [ ] Fotos (lista abaixo)

## Fotos pedidas
1. …

## Mensagem enviada ao cliente
(cópia da mensagem)
```

## 4. Quando a resposta chegar

A pessoa cola a resposta: texto, transcrição de áudio, fotos, prints.
1. **Organize** cada fato no `briefing.md`, com a fonte ("cliente, WhatsApp de 16/10").
2. **Guarde** as fotos e os prints em `<cliente>/material/`, com nomes que digam o que são (`forno-aceso.jpg`).
3. **Aponte o que falta ou não bate,** como um horário diferente no Instagram e na mensagem, e sugira uma pergunta curta de acompanhamento.
4. **Se vierem links,** siga para `aproveitar.md`.
