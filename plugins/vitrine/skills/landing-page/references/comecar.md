# Guia de início

Mostre este guia quando a pessoa usar `/vitrine:inicio`, pedir ajuda ("como uso isso?", "o que você faz?") ou usar a skill pela primeira vez (sem perfil em `~/.claude/landing-page/`).

**Como mostrar:**
- **Formato:** apresente o texto da seção abaixo, adaptando o tom. No primeiro uso, mostre a versão curta (o passo a passo e os comandos) e pergunte por onde a pessoa quer começar.
- **Quando já há um pedido concreto:** se a pessoa chegou pedindo um site, faça o site e ofereça o guia numa frase no final.
- **Linguagem:** sem jargão. Diga "objetos do dia a dia do negócio", não "artefatos"; diga "teste", não "eval".

---

## O que eu faço

Eu crio landing pages com identidade própria, que não parecem feitas por IA, para os seus clientes: restaurante, padaria, clínica, oficina, loja, escritório, profissional liberal. Cada página nasce do mundo do cliente, com os objetos, as palavras e o jeito do negócio dele. Nada de template.

## Passo a passo

**Uma vez só: monte o seu perfil (uns 5 minutos)**
`/vitrine:perfil`: me conte para quem você faz sites, qual stack usa, o que odeia, e me mande de 3 a 5 referências de sites que você admira. Podem ser **links ou prints** (arraste a imagem para o chat). Eu analiso e guardo o seu gosto. Todo site sai mais com a sua cara.

**Para cada cliente:**

1. **Briefing:** `/vitrine:briefing Padaria do Sérgio`
   Eu escrevo uma mensagem pronta para você mandar no WhatsApp do cliente, com as perguntas certas e a lista de fotos que ele precisa tirar.

2. **Material:** cole aqui a resposta do cliente (texto, fotos, prints, transcrição de áudio).
   Se ele já tem site, Instagram ou Google: `/vitrine:aproveitar https://site-do-cliente.com.br`
   Eu organizo tudo num `briefing.md`, separando o que é fato do que ainda falta.

3. **Conceitos:** `/vitrine:conceitos`
   Eu monto uma apresentação com 2 ou 3 direções visuais (fontes, cores, a primeira tela de cada uma), em HTML e PDF, para você mandar ao cliente escolher.

4. **Site:** `/vitrine:site` (ou "faz o site na direção 2")
   Eu construo, tiro prints no computador e no celular, corrijo o que precisar e entrego a pasta com o site e as notas: o que ficou pendente e a lista de fotos.

5. **Ajustes:** fale normalmente. "Aumenta o título", "troca a cor do botão", "o cliente mandou fotos novas, coloca no lugar das pendentes".

6. **Aprovação:** `/vitrine:avaliar`
   Uma página com os prints, para marcar Aprovado, Em dúvida ou Não aprovado. Com o tempo, eu aprendo o que funciona pra você e puxo os próximos sites para esse lado.

## Comandos

| Comando | Para quê |
|---|---|
| `/vitrine:inicio` | Mostra este guia |
| `/vitrine:perfil` | Monta ou atualiza o seu perfil (referências, stack, gosto) |
| `/vitrine:briefing` | Mensagem de briefing para o cliente |
| `/vitrine:aproveitar` | Extrai conteúdo do site, Instagram ou Google do cliente |
| `/vitrine:conceitos` | Apresentação das direções para o cliente escolher |
| `/vitrine:site` | Constrói o site |
| `/vitrine:revisar` | Diagnóstico de um site existente: o que tem "cara de IA" e o que falta |
| `/vitrine:avaliar` | Página para aprovar ou reprovar sites prontos. Eu aprendo o seu gosto com isso |

Nada disso é obrigatório: dá para pedir tudo falando normalmente, por exemplo "faz uma landing page pra barbearia do Marcos em Contagem…".

## Onde fica cada coisa

```
<cliente>/
├── briefing.md      o que sabemos do negócio (cada fato com a fonte)
├── material/        fotos, prints e logo que o cliente mandou
├── conceitos/       apresentação das direções (index.html + pagina.pdf)
├── site/            o site (index.html, assets/, screenshots/)
└── NOTAS.md         conceito escolhido, pendências, lista de fotos, como publicar
```

O seu perfil fica em `~/.claude/landing-page/`.

## Dicas

- **Material real vale mais que qualquer efeito.** Quanto mais fotos e histórias do cliente, melhor a página.
- **Conte histórias, não adjetivos.** "O Sérgio largou a engenharia pra fazer pão" rende mais que "padaria de qualidade".
- **Eu não invento depoimento, número nem prêmio.** O que falta aparece marcado como `[[assim]]`, para você completar com o cliente.
