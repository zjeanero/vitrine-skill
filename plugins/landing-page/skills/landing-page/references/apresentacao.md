# Apresentação de conceitos para o cliente

Antes de construir o site inteiro, mostre ao cliente as 2 ou 3 direções da etapa 3 do `SKILL.md` numa página bonita e simples, para ele escolher. Isso evita retrabalho e ajuda a vender o projeto: o cliente vê que houve pensamento sobre o negócio dele, e não um template.

## Entregáveis

```
<cliente>/conceitos/
├── index.html        a apresentação (abre no celular e no computador)
├── pagina.pdf        a mesma coisa em PDF, fácil de mandar no WhatsApp
└── screenshots/      prints da revisão
```

Gere o PDF e os prints com:

```bash
node <pasta-desta-skill>/scripts/screenshot.mjs <cliente>/conceitos/index.html <cliente>/conceitos/screenshots --pdf
```

Depois, mova `pagina.pdf` para `<cliente>/conceitos/`.

## Estrutura da página

1. **Abertura:** o nome do negócio e uma frase como "Três caminhos para o site da [negócio]".
2. **O que entendemos do negócio:** de 3 a 5 linhas com o resumo da escavação, em linguagem do cliente: os objetos, as palavras e o jeito do lugar. O cliente precisa sentir que foi entendido.
3. **O que vamos resolver** (só se houver site antigo): de 2 a 4 pontos do diagnóstico (ver `aproveitar.md`).
4. **Uma seção por direção, com:**
   - **Nome e ideia em uma frase:** "O balcão de encomendas: a página funciona como o saco de pão com a etiqueta do pedido".
   - **De onde vem:** o objeto ou o jeito do negócio que inspirou a direção.
   - **Tipografia ao vivo:** o nome do negócio e um título real escritos nas fontes da direção, com acentos (ã, ç). Use texto, nunca imagem.
   - **Cores:** de 3 a 5 amostras, com nomes que digam de onde vêm ("casca do pão", "papel do saco") e não códigos.
   - **A primeira tela da direção, de verdade:** feita em HTML e CSS, numa moldura de computador reduzida (um bloco de 1440×900 com `transform: scale()`) e numa moldura de celular. É o que mais convence o cliente.
   - **O momento especial:** em 2 linhas, a coisa de que as pessoas vão lembrar.
   - **O que essa direção evita.**
5. **Fechamento:** "Qual caminho tem mais a cara de vocês? Pode responder 1, 2 ou 3, e pode misturar ('as cores da 2 com o título da 1')."

## Regras

- **A apresentação não compete com as direções.** O layout dela é neutro e editorial, com fundo claro e uma fonte de texto discreta. A personalidade aparece dentro de cada direção.
- **O cliente vai abrir no celular,** pelo WhatsApp. Ela precisa funcionar bem em 390px: as molduras de computador viram rolagem lateral só dentro da moldura, ou dão lugar à versão de celular.
- **Para o PDF,** use `@media print`, com cada direção começando numa página nova (`break-before: page`) e sem botões nem animação.
- **Sem jargão:** nada de "tokens", "display", "artefato" ou "hero". Escreva "letras", "cores", "primeira tela", "objetos do dia a dia".
- **Sem dados inventados,** como no site: o que faltar aparece como `[[…]]`.
- **Revise como o site:**
  - rode o script acima;
  - olhe a primeira tela, as folhas de contato e o PDF;
  - confira os acentos nas amostras de fonte.

## Depois da escolha

Registre a direção escolhida, e as misturas pedidas, no `briefing.md` e no `NOTAS.md`. Siga para a construção (etapa 5 do `SKILL.md`) usando os tokens e a primeira tela já feitos na apresentação. Esse trabalho não se perde.
