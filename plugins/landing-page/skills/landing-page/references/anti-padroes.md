# Anti-padrões: sinais de página no piloto automático

Cada item abaixo é o que aparece quando ninguém decide. Nenhum é proibido: se o conceito realmente pedir um deles, use e saiba explicar por quê. O problema é quando aparecem por inércia.

Para qualquer elemento, pergunte: **ele serviria igual para o concorrente?** Se sim, troque por algo tirado do mundo do cliente.

## Estrutura e layout

- **Hero centralizado de SaaS:** selo em pill ("✨ Novo"), título com uma palavra em gradiente, subtítulo cinza, dois botões (cheio e contorno) e um print ou mockup embaixo.
  → Comece pelo elemento mais característico do cliente: o artefato, a foto do lugar, o produto em escala gigante ou a informação mais útil (horário, endereço, o que está saindo agora).
- **Grade de 3, 4 ou 6 cards,** cada um com ícone num quadrado arredondado, título e duas linhas de texto.
  → Use a forma de informação que o artefato do cliente já usa: lista com fios, tabela, índice numerado, cardápio, linha do tempo, comanda.
- **Zigue-zague** de imagem e texto alternando os lados.
  → Varie escala e largura entre as seções. Nem toda seção precisa de imagem.
- **Toda seção com o mesmo esqueleto:** título centralizado, subtítulo e conteúdo no mesmo container, com o mesmo espaçamento.
  → Alterne a densidade: uma seção sangrada, uma coluna estreita de texto, uma lista densa, um tipo gigante.
- **Blocos de prova social em fôrma:**
  - faixa de logos cinza "Empresas que confiam";
  - linha de 4 números grandes ("+10 mil clientes", "98% de satisfação");
  - 3 depoimentos com avatar redondo e 5 estrelas;
  - tabela de 3 planos com o do meio marcado "Mais popular";
  - FAQ em sanfona seguido de uma faixa final de CTA em gradiente.

  → Use só se o conteúdo existir de verdade e, mesmo assim, na forma do conceito. Uma avaliação real do Google pode aparecer como um recado preso na parede, por exemplo.
- **Rodapé de 4 colunas de links** numa página que não tem para onde levar.
  → Rodapé com o que importa: endereço, horário, contato, CNPJ ou registro profissional, e uma frase com voz.

## Visual

- **Gradientes roxo, índigo ou azul-violeta,** blobs desfocados ("aurora"), mesh gradient de fundo.
  → Use as cores dos materiais reais do cliente. Gradiente só se vier do conceito, como um duotone que imita a luz de estúdio no site de um fotógrafo.
- **Glassmorphism** (cards com backdrop-blur), brilho neon, borda com glow sobre fundo escuro.
  → Superfícies com material: papel, grão, cor chapada, fotografia.
- **Modo escuro com brilho radial atrás do título.**
  → Fundo escuro só se o mundo do cliente for escuro (bar noturno, estúdio de tatuagem), e com textura própria.
- **O mesmo `border-radius` grande e a mesma sombra suave em tudo.**
  → Escolha o tratamento de cantos e de profundidade pelo conceito: canto vivo, fio de 1px, sombra dura ou nenhuma.
- **Texto em gradiente** numa palavra do título.
  → Dê ênfase com escala, peso, itálico ou cor chapada.
- **Ícones Lucide ou Heroicons em quadradinhos coloridos; emoji como ícone.**
  → Desenhe ícones a partir do artefato (símbolos de lavagem, pictogramas de placa, carimbos) ou não use ícones.
- **Paleta padrão do Tailwind:** texto `slate-500`, botão `indigo-600`, destaques em `emerald`.
  → Tokens próprios em `oklch`, com nomes que dizem de onde a cor vem.
- **Fundo de grade ou pontinhos esmaecido** usado como "textura de designer".
  → Só se a grade fizer parte do artefato, como papel milimetrado ou planta técnica.
- **Imagens prontas e genéricas:** fotos de banco (pessoas sorrindo com notebook, aperto de mão, equipe olhando para a tela), ilustrações no estilo unDraw, blobs 3D gerados por IA, mockup falso de celular ou navegador.
  → Foto real do cliente, "foto pendente" dirigida ou grafismo derivado do artefato.

## Tipografia

- **Uma fonte só para tudo,** sempre em pesos médios e em tamanhos entre 16 e 48px.
  → Uma voz forte e uma quieta, com contraste real de escala.
- **Padrões de primeira ordem como fonte única:** Inter, Geist, Roboto, Poppins, Montserrat, Open Sans, Lato, Arial, system-ui, e as de SaaS genérico (DM Sans, Plus Jakarta Sans, Manrope, Outfit, Sora, Urbanist, Figtree).
  → Elas podem ser a voz *quieta*. A voz de personalidade vem de outro lugar.
- **Padrões de segunda ordem,** fontes que viraram o "diferente" de toda página feita por IA: Instrument Serif (sobretudo o itálico), Fraunces, Playfair Display, DM Serif Display, Space Grotesk, Syne, Clash Display, Satoshi, General Sans, Cabinet Grotesk, Bricolage Grotesque. Não são ruins; estão gastas.
  → Use só se a escolha nascer do artefato e você souber explicar. Caso contrário, procure com o método de `tipografia.md`.

## Texto

- **Frases-fôrma:** "Transforme seu negócio", "Eleve sua experiência", "Soluções inovadoras", "Tudo o que você precisa em um só lugar", "A solução completa para…", "Potencialize", "Desbloqueie", "Revolucione", "Feito para quem…", "Mais do que um X, um Y".
- **Trincas de adjetivos:** "rápido, seguro e confiável"; "qualidade, tradição e excelência".
- **Título no molde "[Verbo] seu [X] com [Y]".**
- **CTAs vazios:** "Saiba mais", "Comece agora", "Descubra".
- **Tiques de estilo:**
  - emojis em títulos (✨🚀💡);
  - travessão em toda frase;
  - perguntas retóricas em série ("Cansado de…? Quer…?").
- **Dados inventados:** números, depoimentos, prêmios, "referência na região", "líder de mercado".

→ Para tudo isso: nomes próprios, fatos verificáveis, a voz do dono e uma ação concreta no botão.

## Movimento

- **Fade-up idêntico em todo elemento ao rolar.**
  → Um momento coreografado que reforça o conceito; o resto aparece sem cerimônia.
- **`hover: scale(1.05)` em todo card,** bordas com gradiente girando, blobs flutuando.
  → Hover que revela informação útil ou faz parte do artefato, como uma comanda que é "carimbada".
- **Preloader, portão de entrada, cursor customizado ou scroll-jacking** em página de negócio local.
  → Conteúdo imediato. No celular nem existe cursor.

## Teste final

Antes de entregar, responda com honestidade:
1. Se eu trocar o nome do cliente pelo de um concorrente, a página continua funcionando? (Deveria parar de fazer sentido.)
2. Qual é o momento-assinatura, e ele aparece nos screenshots?
3. Quantos itens desta lista estão na página sem uma razão que venha do cliente?
