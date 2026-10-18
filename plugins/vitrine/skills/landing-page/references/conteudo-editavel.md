# Conteúdo que o cliente edita sozinho

Preço, cardápio, horário e aviso mudam toda semana. Em vez de o cliente chamar o freela a cada mudança, ele edita uma planilha do Google, e o site lê dali. O visual continua todo no código, e só o conteúdo que muda fica na planilha.

## Quando usar

- **Use** quando o cliente disser no briefing que quer mudar sozinho, ou quando o site tiver lista que muda: cardápio, tabela de preços, serviços com valor, horários, aviso de feriado, prato do dia, promoção.
- **Não use** para texto longo, títulos e seções. Isso é design e fica no código. Também não use para foto: imagem mexe no layout e no peso da página.
- **Não use WordPress só por isso.** Ele só entra quando o cliente exigir, e aí vale a stack do perfil.

## Como funciona

1. **O HTML sai com o conteúdo escrito,** como sempre. É o que o Google lê e o que aparece se a planilha não responder.
2. **Cada parte editável ganha uma marcação:**
   - **campo solto:** `data-campo` (horário, aviso, telefone);
   - **lista:** `data-lista` (cardápio, preços), com um `<template>` que repete o HTML de um item escrito à mão.
3. **O `assets/js/conteudo.js` lê a planilha** publicada como CSV e troca só o que estiver lá. Copie-o de `scripts/conteudo/conteudo.js`.

```html
<p class="aviso" data-campo="aviso" data-some-vazio>Fechado no feriado de 2/11</p>
<p>Seg a sex <b data-campo="horario_semana">7h às 19h</b></p>

<div data-lista="cardapio" data-agrupar="secao">
  <!-- itens escritos à mão, iguais ao resultado: é o que o Google lê -->
  <section><h3>Pães</h3><div class="item"><span>Pão francês</span><span>R$ 0,90</span></div></section>
  <template data-grupo><section><h3 data-col="secao"></h3><div data-itens></div></section></template>
  <template data-item><div class="item"><span data-col="item"></span><span data-col="preco" data-formato="preco"></span></div></template>
</div>

<script>window.PLANILHAS = { informacoes: 'URL-DO-CSV', cardapio: 'URL-DO-CSV' };</script>
<script src="assets/js/conteudo.js"></script>
```

**Regras da marcação:**
- **Aba "informacoes":** colunas `campo` e `valor`. Cada `data-campo` procura a linha de mesmo nome. A comparação ignora acento, maiúscula e espaço, então "Horário sábado" encontra `horario_sabado`.
- **Uma aba por lista,** com o nome do `data-lista`. A primeira linha tem os nomes das colunas, que os `data-col` usam.
- **Coluna `disponivel`:** "não" tira o item do site sem apagar a linha. É assim que o cliente marca "acabou hoje".
- **`data-formato="preco"`** transforma "28" ou "28,5" em "R$ 28,00" ou "R$ 28,50".
- **`data-some-vazio`** esconde o elemento quando a célula está vazia, como uma descrição opcional ou um aviso que acabou.
- **O `<template>` repete o HTML exato do item escrito à mão.** Assim, o print da revisão vale para o conteúdo vindo da planilha.
- **Segurança:** o script só insere texto, nunca HTML. Link, cor e layout não vêm da planilha.

## Montar a planilha

1. **Gere os CSVs com os dados atuais** em `<cliente>/conteudo/`: um por aba (`informacoes.csv`, `cardapio.csv`…), com as colunas que o HTML usa. Comece com o que está no site, para a planilha nascer igual a ele.
2. **Teste antes de publicar:**
   ```bash
   node <pasta-desta-skill>/scripts/conteudo/testar.mjs <cliente>/site <cliente>/conteudo <cliente>/site/screenshots-planilha
   ```
   - O teste serve o site num endereço local, faz cada aba ler o CSV de mesmo nome e tira os prints.
   - No fim, ele mostra `CONTEÚDO: ok`, com quantos campos e itens vieram dos CSVs.
   - Confira a folha de contato. Para ter certeza de que a planilha é que está valendo, mude um preço no CSV, rode de novo e veja o print.
3. **Passe para o usuário este roteiro.** Ele faz uma vez, no Google:
   1. Criar uma planilha no Google Planilhas. O melhor é na conta do cliente; senão, na do freela, compartilhada com o cliente.
   2. Para cada CSV, em **Arquivo > Importar > Upload**, escolher **Inserir nova página**. O nome da página deve ser igual ao do arquivo (`cardapio`).
   3. Proteger a primeira linha de cada página, em **Dados > Proteger páginas e intervalos**, para o cliente não apagar os nomes das colunas.
   4. Publicar cada página como CSV: **Arquivo > Compartilhar > Publicar na Web**, escolher a página e **Valores separados por vírgula (.csv)**, e clicar em **Publicar**. Copiar o link.
   5. Colar os links aqui. A skill coloca cada um no `window.PLANILHAS` do `index.html`.
4. **Compartilhe com o cliente** como **Editor**: em **Compartilhar**, coloque o e-mail dele.

**Hospedagem com PHP:** prefira o intermediário `scripts/conteudo/planilha.php`.
- Copie-o para a raiz do site e cole os links de publicação nele.
- No HTML, aponte as abas para ele: `window.PLANILHAS = { cardapio: 'planilha.php?aba=cardapio' }`.
- Ele guarda uma cópia por 10 minutos. Assim, o site fica mais rápido e continua com a última versão boa se o Google cair.
- Ele também resolve o caso raro de o navegador bloquear a leitura direta da planilha.

## Entrega

**No `NOTAS.md`,** crie uma seção "Conteúdo editável" com:
- o link da planilha;
- quem tem acesso;
- o que cada página controla;
- o tempo para a mudança aparecer: até 5 minutos, ou até 10 com o `planilha.php`.

**Mensagem pronta para o cliente:**

> Oi, [nome]! Agora você mesmo pode mudar [os preços, o cardápio e os horários] do site, sem precisar me chamar. É só abrir esta planilha: [link].
> - Mude o que precisar nas linhas. A primeira linha, com os títulos, fica como está.
> - Para tirar um item do site sem apagar, escreva **não** na coluna Disponível.
> - Em até 5 minutos a mudança aparece no site.
> Qualquer dúvida, me chama!
