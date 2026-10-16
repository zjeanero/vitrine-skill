# Referências do usuário

Estes são os sites que o usuário escolheu como norte de qualidade. Use-os para calibrar o método e o nível de acabamento, não para copiar efeitos.

Para adicionar uma referência nova:
1. Capture com `node scripts/screenshot.mjs <url> <pasta>`. Use `--click=<seletor>` para passar por telas de entrada.
2. Olhe as imagens.
3. Acrescente uma seção aqui, no mesmo formato.

## Unseen Studio (unseen.co/projects)

Estúdio de marca, digital e motion.
- **Ideia:** a página é uma experiência, não um documento. Começa com um portão de entrada (dois olhos de desenho animado e um botão "Enter", com ou sem áudio). Depois vem uma galeria 3D com arcos brancos, telas curvas e partículas flutuando.
- **Tipografia:** Saol Display (serifada de alto contraste, peso light e itálico) na marca; Neue Montreal (grotesca neutra) em todo o resto. O título "Selected Projects" é grande e tem espaçamento entre letras negativo.
- **Cor e material:** fundo rosado pálido no portão; a galeria é quase branca, com granulação de filme e uma leve aberração cromática. Essa textura é o que tira a cara de "renderização limpa".
- **Interface:** quase nenhuma. Logo, três links, um botão redondo de menu e filtros em pills com contagem ("Branding 5", "Motion 5").
- **Levar:**
  - granulação como material;
  - serifada de display com grotesca neutra;
  - contagem nos filtros;
  - legenda de projeto com nome, categoria, seta e um fio embaixo.
- **Não levar para negócio local:** o portão, o áudio, o WebGL pesado e a rolagem virtual.

## bychudy (bychudy.com)

Portfólio de designer gráfico com projetos da cena musical polonesa. Feito em Framer.
- **Ideia:** o site é a área de trabalho do designer. Um retrato enorme e desfocado fica no fundo, com miniaturas de projetos espalhadas por cima como arquivos. Embaixo, uma dock do macOS reúne os apps que ele usa (After Effects, Photoshop, Illustrator) e os contatos (Instagram, e-mail).
- **Tipografia:** SF Pro em caixa-alta, bold e com sombra, imitando o rótulo de arquivo do macOS; Inter no resto.
- **Levar:**
  - uma metáfora tirada da ferramenta de trabalho do próprio sujeito;
  - uma navegação que *é* o conceito;
  - desfoque como forma de criar profundidade.
- **Não levar:** a tela única sem rolagem e o caos controlado. Funcionam porque o público é de criativos.

## pixelwrld (pixelwrld.co)

Página pessoal de um product designer. Feita em Framer.
- **Ideia:** "meu cantinho da internet". A página mostra quatro ícones de app em 3D, cada um com um rótulo em pill: três são os produtos dele, e o quarto é a foto dele recortada com contorno branco, como uma figurinha.
- **Tipografia:** uma fonte manuscrita própria no título, levemente inclinada; Inter no texto. A letra manuscrita carrega sozinha a personalidade da página.
- **Cor e material:** cinza muito claro, com uma grade de pontos quase invisível e um halo radial suave.
- **Levar:**
  - um único gesto pessoal (a letra da pessoa) sustentando a página;
  - texto curto e com voz ("Hey there! I'm Roman…");
  - foto recortada como figurinha.
- **Não levar:** a estrutura de tela única.

## dão (daofor.design)

Diretor de arte freelancer, nascido no Vietnã e baseado em Amsterdã. Feito em Framer.
- **Ideia:** uma capa de revista que muda de disciplina. O hero alterna "FOR PHOTOGRAPHY" e "FOR WEB DESIGN", cada um com um retrato em duotone (azul, amarelo) que se funde ao fundo em gradiente.
- **Tipografia:** Vina Sans em tamanho gigante, sangrando da coluna. É uma condensada gratuita no Google Fonts, com minúsculas que se misturam à caixa-alta. No menu e no texto, Inter Display em Bold e SemiBold.
- **Layout dos projetos:** cada projeto ocupa a tela inteira e empilha sobre o anterior ao rolar. A composição é sempre a mesma: foto sangrada, miniatura no centro, nome à esquerda e "VIEW MORE" à direita.
- **Rodapé editorial:**
  - "Design with class. Built to last." na condensada;
  - serviços em lista, com fios finos e marcadores;
  - rótulos pequenos em caixa-alta espaçada ("SERVICES", "FOLLOW");
  - "Made in Vietnam • Based in Amsterdam".
- **Levar:**
  - condensada gigante com uma grotesca bold;
  - duotone como sistema de imagem;
  - serviços em lista com fios, não em cards;
  - rodapé com voz;
  - seções de tela cheia que empilham, o que dá para fazer com `position: sticky`, sem biblioteca.
- **Não levar:** o carrossel automático no hero, se ele esconder informação essencial no celular.

## O que as quatro têm em comum

O resumo está no `SKILL.md`:
- uma ideia que vem do mundo do próprio sujeito;
- personalidade concentrada em um ou dois gestos;
- contraste de escala;
- imagem real e dirigida;
- interface mínima;
- texto com voz.
