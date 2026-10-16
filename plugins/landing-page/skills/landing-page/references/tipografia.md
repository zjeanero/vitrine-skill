# Tipografia

A tipografia carrega a maior parte da personalidade de uma landing page, porque é o único elemento presente em todas as seções.

## Método

1. **Voz forte (display): nasce do artefato ou do lugar do cliente.** Que letras existem no mundo dele? Letreiro pintado à mão, placa de rua, etiqueta de máquina, carimbo, receituário, embalagem antiga, neon, quadro de giz, jornal de bairro, painel de LED, ficha técnica. Procure uma fonte com o *espírito* dessa letra, sem precisar imitá-la.
2. **Voz quieta (texto): legível, neutra, com bom suporte a português.** Aqui Inter e companhia são aceitáveis, porque a função delas é sumir.
3. **No máximo duas famílias.** Uma família só, bem usada (pesos e larguras extremos), também funciona.
4. **Contraste claro em uma dimensão:** serifada × sem serifa, condensada × larga ou mono × proporcional. Duas sem serifa parecidas viram ruído.
5. **Confira o registro** (`~/.claude/landing-page/registro.md`) e não repita a fonte display de um projeto recente.
6. **Teste os acentos antes de decidir:** renderize "Ação, pão, coração, Vovó, ÇÃÕÉÊÍ". Muita fonte display gratuita fora do Google Fonts não tem ã, õ ou ç. O navegador troca só aquela letra pela fonte reserva, e a palavra fica remendada. Isso aparece no screenshot; confira.

## Pontos de partida por espírito

Use estas listas para começar a busca; elas não são um cardápio fechado. Todas foram verificadas no Google Fonts ou na Fontshare. Navegue além delas, sobretudo nas páginas menos populares do Google Fonts.

- **Letreiro, placa, sinalização (condensadas):** Vina Sans, Antonio, Big Shoulders, Sofia Sans Extra Condensed, Alumni Sans, Tanker (Fontshare).
- **Gesto tipográfico com eixo de largura:**
  - Anybody, Archivo, Mona Sans, Hubot Sans: larguras variáveis, para alternar condensado e expandido;
  - Climate Crisis: tem um eixo que "derrete" a letra.
- **Editorial, jornal, documento, tradição:** Newsreader, Literata, Libre Caslon Display, Bodoni Moda, Gloock, Young Serif, Brygada 1918, Petrona; Erode, Boska, Zodiak, Gambetta, Sentient (Fontshare).
- **Máquina, etiqueta, recibo, ficha técnica (mono):** Courier Prime (máquina de escrever), Martian Mono, Azeret Mono, Fragment Mono, Doto (matriz de pontos, como painel ou impressora térmica).
- **Carimbo, estêncil, caixote:** Big Shoulders Stencil, Saira Stencil One.
- **Mão, giz, letreiro pintado, retrô gordinho:** Gochi Hand, Kalam, Yellowtail, Shrikhand, Caprasimo, Bagel Fat One, Rammetto One.
- **Voz quieta (texto):** Hanken Grotesk, Schibsted Grotesk, Familjen Grotesk, Host Grotesk, Rethink Sans, Onest, Golos Text, Inter; Switzer, Supreme, Author (Fontshare).

As fontes de SaaS genérico (DM Sans, Plus Jakarta Sans, Manrope, Outfit, Sora, Urbanist, Figtree, Lexend) e as de segunda ordem listadas em `anti-padroes.md` só entram como escolha consciente.

## Onde procurar

Sempre confira a licença da fonte específica antes de usar em projeto de cliente.
- **Google Fonts:** licenças OFL/Apache, livres para uso comercial. As fontes têm bom suporte a acentos.
- **Fontshare** (Indian Type Foundry): gratuita para uso comercial pela licença própria da ITF.
- **Velvetyne, Collletttivo, Open Foundry, The League of Moveable Type, uncut.wtf:** fontes livres e experimentais. Vale o teste de acentos com atenção redobrada.
- **Fundições pagas:** quando o cliente puder pagar licença, inclusive fundições brasileiras (ex.: Plau, Blackletra). Uma fonte brasileira num negócio brasileiro é um diferencial que nenhum template tem.

## Escala e ajustes

```css
:root {
  --texto: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);   /* 17 → 19px */
  --titulo: clamp(2rem, 1.2rem + 3.5vw, 4rem);
  --display: clamp(3.5rem, 1rem + 13vw, 13rem);          /* ajuste pela palavra mais longa */
}
.rotulo { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; }
h1, h2, h3 { text-wrap: balance; }
p { text-wrap: pretty; max-width: 65ch; }
.preco, .horario { font-variant-numeric: tabular-nums; }
```

- **Contraste de escala:** no hero do desktop, o display deve ter pelo menos 4 vezes o tamanho do texto.
- **Entrelinha:** 0,85 a 1,0 no display; 1,5 a 1,65 no texto corrido.
- **Espaçamento entre letras:** de −0,02em a −0,04em em sem serifa grande; de +0,08em a +0,14em em caixa-alta pequena. Condensada em caixa-alta normalmente não precisa de ajuste.
- **Palavra longa no celular:** calcule o tamanho do display pela palavra mais longa do título em 390px de largura e confira no screenshot. Prefira reduzir o tamanho a hifenizar o título.
- **Colunas estreitas de texto:** use `hyphens: auto`, que funciona com `<html lang="pt-BR">`.

## Carregamento

Durante o desenvolvimento e nos testes, use o CSS do provedor, carregando só os pesos usados:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=NOME+DA+FONTE:wght@400;700&display=swap" rel="stylesheet">
<!-- Fontshare: https://api.fontshare.com/v2/css?f[]=nome-da-fonte@400,700&display=swap -->
```

**O `preload` de fonte falha quando a página é aberta direto do arquivo (`file://`).** O navegador bloqueia a requisição por CORS, gera erro no console e o `report.json` acusa o problema. Durante o desenvolvimento e a revisão, deixe o `preload` comentado. Na entrega, anote no `NOTAS.md`, em "Como publicar", que ele deve ser ativado depois que o site estiver num servidor.

Em produção, prefira hospedar os arquivos `.woff2` junto do site, com `@font-face`, `font-display: swap` e `<link rel="preload">` da fonte display. Há dois motivos:
- **Desempenho:** uma conexão a menos para abrir.
- **LGPD:** o IP do visitante deixa de ir para um terceiro.
