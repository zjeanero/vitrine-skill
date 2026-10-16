---
name: landing-page
description: Cria landing pages com identidade própria, que não parecem feitas por IA, para clientes de freela e negócios locais (restaurante, padaria, clínica, oficina, barbearia, loja, escritório, profissional liberal). Cobre o trabalho inteiro - mensagem de briefing para o cliente, aproveitar o que ele já tem (site, Instagram, Google), apresentação de conceitos para aprovação, construção em HTML/CSS/JS (ou a stack do perfil), SEO local, WhatsApp e revisão visual por screenshot. Use sempre que o usuário pedir landing page, site, one-page, página de vendas, site institucional, página para cliente, redesign, briefing de cliente, proposta visual, ou disser que um site está genérico, "com cara de IA" ou "vibecodado", mesmo sem dizer "landing page". Use também para configurar o perfil da skill (referências, stack, gosto), para revisar um site existente e quando a pessoa perguntar como usar a skill.
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), PowerShell(node:*), Bash(mkdir:*), Bash(ls:*), Bash(cp:*), Bash(mv:*)
---

# Landing page autoral

O objetivo são páginas que um bom designer reconheceria como *decididas*, não geradas.

## Como esta skill é usada

A pessoa pode chegar por um comando (`/lp-...`) ou falando normalmente. Identifique o pedido e siga o modo certo:

| Pedido | O que fazer |
|---|---|
| "Como uso isso?", `/lp:inicio`, ou primeiro uso | `references/comecar.md` |
| Configurar o gosto, adicionar referência (link ou print), `/lp:perfil` | `references/perfil.md` |
| Preparar as perguntas para o cliente, `/lp:briefing` | `references/briefing.md` |
| Material do cliente: resposta, fotos, links de site, Instagram ou Google; `/lp:aproveitar` | `references/aproveitar.md` |
| Mostrar caminhos visuais para o cliente escolher, `/lp:conceitos` | Etapas 1 a 3 abaixo + `references/apresentacao.md` |
| Fazer o site, `/lp:site` | O processo completo abaixo |
| Avaliar um site que já existe, `/lp:revisar` | Diagnóstico em `references/aproveitar.md` |

**Primeiro uso:** se `~/.claude/landing-page/` não existir, a pessoa ainda não tem perfil.
- **Pedido vago** ("oi", "como funciona"): mostre a versão curta do guia de `references/comecar.md` e pergunte por onde ela quer começar.
- **Pedido concreto** (um site para um cliente): faça o trabalho e, na entrega, ofereça numa frase montar o perfil e conhecer os comandos.

**Pasta do cliente:** todo trabalho de cliente acontece numa pasta com o nome dele. O trabalho anterior que estiver nessa pasta (briefing, material, conceitos) é aproveitado nas etapas seguintes.

```
<cliente>/
├── briefing.md      fatos do negócio, cada um com a fonte
├── material/        fotos, prints e logo do cliente
├── conceitos/       apresentação das direções
├── site/            o site
└── NOTAS.md
```

## Por que páginas feitas por IA parecem todas iguais

Em cada decisão (fonte, cor, layout, frase do título), o caminho mais fácil é a opção mais provável. A soma dessas opções prováveis é exatamente o "visual vibecodado": hero centralizado, gradiente roxo, três cards com ícone, Inter em tudo, "Transforme seu negócio". Nenhum desses elementos é errado isoladamente; o problema é que ninguém decidiu nada.

A saída é trocar decisões prováveis por decisões que só fazem sentido para *este* cliente. Um teste vale para qualquer escolha: **se ela serviria igualmente para o concorrente do outro lado da rua, ela é padrão, não decisão.** Use esse teste o tempo todo: no conceito, na paleta, no título, na foto, no botão.

## O que bons sites autorais têm em comum

Sites de estúdios e designers premiados têm estilos muito diferentes entre si, mas costumam seguir o mesmo método:

1. **Uma ideia governa a página.** Um portfólio que *é* uma área de trabalho de computador; uma página pessoal que é uma tela de ícones de apps; um site de diretor de arte que é uma capa de revista. Nenhum deles começou de uma lista de seções.
2. **A ideia vem do mundo de quem é apresentado.** A área de trabalho é a ferramenta do designer; os ícones são os produtos de quem os criou. A metáfora nunca é genérica: sai da rotina, dos objetos e da linguagem do próprio sujeito.
3. **A personalidade é concentrada.** Há um ou dois gestos fortes (uma condensada gigante, uma letra manuscrita, uma foto enorme e desfocada) e o resto fica quieto. Muitos desses sites usam uma sem serifa comum, até a Inter, no texto corrido, e tudo bem: o texto de apoio precisa sumir para o gesto principal aparecer.
4. **Contraste de escala.** Tipografia enorme ao lado de rótulos pequenos, e muito espaço vazio. Nunca tudo em tamanho médio.
5. **A imagem é protagonista, e é real.** Fotos dirigidas (duotone, recorte, desfoque) e trabalho real. Nada de banco de imagens, ilustração genérica ou grade de ícones.
6. **Interface mínima.** Listas com fios finos em vez de cards, rótulos pequenos em caixa-alta espaçada, pills só onde filtram algo.
7. **Texto com voz humana.** Frases curtas, específicas e com o jeito de falar de quem está por trás, nunca slogans que serviriam para qualquer um.

O que **não** levar para cliente local: portão de entrada ("Enter"), áudio, rolagem virtual em WebGL, site de uma tela só. Isso funciona em portfólio de estúdio, cujo público quer ser surpreendido. Na padaria do bairro, atrapalha quem só quer o horário e o WhatsApp. Leve o *método*, não os efeitos.

O formato de uma boa análise de referência está em `references/referencias-exemplo.md`. As referências que definem o gosto de quem usa a skill ficam no perfil dela (veja abaixo).

## Perfil pessoal

Cada pessoa que usa esta skill pode ter um perfil próprio na pasta `~/.claude/landing-page/` (no Windows, `C:\Users\<nome>\.claude\landing-page\`). Ele fica fora da pasta da skill para sobreviver às atualizações. São três arquivos:
- `preferencias.md`: para quem a pessoa faz sites, a stack preferida, o gosto, o que ela ama e o que odeia.
- `referencias.md`: sites que ela admira, analisados no mesmo formato de `references/referencias-exemplo.md`.
- `registro.md`: projetos já entregues, com fontes e paletas, para não repetir.

No início de cada trabalho, leia os arquivos que existirem. Em gosto e stack, o perfil tem prioridade sobre os padrões desta skill. O método continua valendo sempre: escavação, honestidade, revisão visual. Se a pasta não existir, siga com os padrões e, na entrega, ofereça em uma frase montar o perfil.

Para criar ou atualizar o perfil, siga `references/perfil.md`. Isso vale quando a pessoa pedir algo como "configura a skill do meu jeito", "adiciona essa referência" ou "eu trabalho com Next.js".

## Processo

Siga as etapas na ordem. Pular o conceito e ir direto ao código é o caminho mais curto para a página genérica.

### 1. Briefing

Junte o necessário para não precisar inventar nada:
- **Negócio:** nome, o que faz, desde quando, quem toca (pessoas reais têm nome), bairro e cidade.
- **Diferença real:** o que torna esse lugar diferente *de verdade*. Pergunte por histórias e hábitos, não por adjetivos.
- **Público:** quem é e o que ele precisa saber para comprar, agendar ou visitar.
- **Contato e funcionamento:** WhatsApp, telefone, endereço, horários, Instagram, formas de pagamento, entrega ou atendimento em domicílio.
- **Material existente:** logo, cores da fachada/uniforme/embalagem, fotos reais, avaliações do Google.
- **Ação principal:** quase sempre chamar no WhatsApp, ligar ou ir até o local.

Se já existir `<cliente>/briefing.md`, comece por ele e pelo `material/`.

Se o usuário estiver disponível, faça as perguntas que faltam de uma vez, numa lista curta. Quando faltar muito e só o cliente souber responder (histórias, fotos, avaliações), ofereça a mensagem de briefing de `references/briefing.md`. Se o usuário não estiver disponível, ou pedir para seguir, assuma o razoável, anote cada suposição e continue. As suposições vão para o `NOTAS.md` da entrega.

### 2. Escavação do mundo do cliente

Antes de pensar em layout, faça por escrito um inventário do mundo desse negócio:
- **Artefatos:** objetos que o negócio e os clientes dele manuseiam. Cardápio, comanda, recibo, etiqueta, tabela de preços, ficha, receituário, embalagem, letreiro, uniforme, ferramenta.
- **Materiais e cores reais:** do lugar, do produto, da fachada, do bairro.
- **Vocabulário:** como o dono fala, os termos do ofício, os apelidos dos produtos.
- **Rituais e tempo:** o que acontece em cada horário, sazonalidade, filas, fornadas, plantões, prazos.
- **Lugar:** rua, bairro, cidade, clima, referências locais.

Os artefatos são a fonte mais rica de design único. Cada um já traz uma tipografia, uma grade, uma paleta e um jeito de organizar informação que nenhum template tem.

Dois exemplos do raciocínio. Eles ilustram o *método*; não reaproveite estas ideias em outros clientes.
- **Lavanderia de bairro.** Artefatos: comanda numerada com via de carbono, tabela de preço por peça, símbolos de lavagem da etiqueta das roupas. Conceito: "a comanda". A página se organiza como o tíquete que o cliente recebe (número, itens, prazo de retirada), e os símbolos de lavagem reais viram o sistema de ícones. Tipografia: monoespaçada de máquina de etiqueta + grotesca neutra. Paleta: o papel, o carbono rosado, o azul do cabide. Momento-assinatura: um simulador de cesto que soma as peças e diz quando buscar.
- **Escritório de contabilidade.** Artefatos: livro-razão, guias de imposto, calendário de obrigações. Conceito: "o calendário fiscal". A página abre com os próximos vencimentos, calculados pela data de hoje, usando numerais tabulares e fios de livro contábil. Momento-assinatura: "o que vence este mês" para MEI, autônomo e empresa.

### 3. Conceito

Leia o registro de projetos anteriores em `~/.claude/landing-page/registro.md` (se existir) para não repetir a fonte display nem a paleta dominante de um cliente recente. Ele fica fora da pasta da skill para não se perder quando a skill for atualizada. Depois, escreva 2 ou 3 direções realmente diferentes entre si. Cada uma deve ter:
- **Ideia em uma frase** e o artefato ou a metáfora que a sustenta.
- **Tipografia:** uma voz com personalidade e uma voz quieta. Veja `references/tipografia.md`.
- **Paleta:** 3 a 5 cores tiradas dos materiais reais, com a função de cada uma.
- **Imagem:** que fotos e com que tratamento, ou que elementos gráficos substituem as fotos.
- **Momento-assinatura:** a única coisa de que alguém vai se lembrar depois de fechar a aba. O melhor é útil: responde uma pergunta real do cliente de um jeito que só esse negócio responderia.
- **O que ela evita de propósito.**

Se o usuário estiver disponível, apresente as direções e deixe que ele escolha. Quando quem decide é o cliente final, gere a apresentação de `references/apresentacao.md` e espere a escolha. Se o usuário não estiver disponível, escolha a mais forte, explique por quê e siga. Antes de construir, leia `references/anti-padroes.md`: ali estão os sinais de piloto automático que você vai ser tentado a usar.

### 4. Estrutura e texto

Monte as seções a partir das perguntas que o cliente final faz antes de agir, e não do molde "hero → features → depoimentos → CTA". Para negócio local, quase sempre são: *o que é, onde fica, quando abre, quanto custa (ou como pedir orçamento), por que confiar, como falar.* A ordem e a forma de cada resposta vêm do conceito: o horário pode ser um quadro de giz, uma linha de comanda ou um relógio.

Texto em português do Brasil, com a voz do dono do negócio:
- **Concreto:** substantivos e nomes próprios (rua, bairro, produto, pessoa) no lugar de adjetivos como "qualidade", "excelência" ou "inovador".
- **Título:** afirma algo específico ou convida para algo concreto. "Deixe até as 10h, busque às 18h. Rua Aimorés, 1020." diz mais que "Cuidado e qualidade para suas roupas".
- **Botões:** nomeiam a ação real, como "Chamar no WhatsApp", "Ver como chegar" ou "Pedir orçamento da revisão". Evite "Saiba mais" e "Comece agora".
- **Nunca invente** depoimentos, números ("+500 clientes"), prêmios, certificações, preços ou anos de experiência. Use marcadores visíveis, como `[[DEPOIMENTO REAL DE CLIENTE]]`, e liste-os no `NOTAS.md`. Dado inventado expõe o cliente (Código de Defesa do Consumidor, conselhos profissionais) e destrói a confiança quando é descoberto.
- **Conteúdo ilustrativo** é permitido quando serve ao conceito: uma conversa de WhatsApp de exemplo, o desenho de uma peça, uma etiqueta preenchida. Ele precisa estar rotulado como exemplo na própria página, e não pode trazer preço, nome de cliente ou número que pareça real.
- **Serviço que ninguém informou também é invenção.** Não afirme como fato como o atendimento funciona (adaptações, garantias, prazos) se o briefing não disse. Escreva como pendência para o cliente confirmar.

### 5. Construção

A stack padrão é HTML + CSS escrito à mão + JavaScript puro só onde houver interação. Use PHP apenas quando houver motivo concreto, como um formulário que envia e-mail ou partes repetidas em várias páginas.

Se o perfil pessoal pedir outra stack (Astro, Next.js, WordPress…), use a dele, e o método continua valendo. Em projetos com Tailwind ou bibliotecas de componentes, substitua os padrões delas (paleta, fontes, raios, sombras, ícones) pelos tokens do conceito, porque são justamente esses padrões que dão a "cara de IA".

Antes de escrever o código, leia:
- `references/stack.md`: estrutura, CSS, movimento, imagens e PHP.
- `references/negocio-local.md`: WhatsApp, horários, SEO local, dados estruturados, desempenho no 4G e regras de conselhos profissionais.

Os pontos que mais afetam o resultado:
- **Tokens primeiro.** Defina cores, fontes, escala e espaçamentos como variáveis CSS a partir do conceito, antes de escrever as seções.
- **Celular é uma composição própria,** não o desktop empilhado. A maioria dos clientes de negócio local abre a página no celular, vindo do Instagram ou do Google Maps.
- **Palavras longas.** Português tem palavras como "odontopediatria" e "fisioterapeuta". A tipografia gigante precisa caber em 390px sem quebrar no meio da palavra nem criar rolagem lateral.
- **Sem foto real, sem banco de imagens.** Use "fotos pendentes" dirigidas (um bloco no tamanho e na cor certos, com a descrição da foto a ser feita) ou elementos gráficos derivados do artefato. As descrições viram a lista de fotos do `NOTAS.md`, um entregável útil para o cliente.

### 6. Revisão visual (obrigatória)

Você não enxerga a página enquanto escreve o código, então tire screenshots e olhe:

```bash
node <pasta-desta-skill>/scripts/screenshot.mjs <cliente>/site/index.html <cliente>/site/screenshots
```

O script usa o Chrome ou o Edge instalado, sem dependências. Ele imprime um resumo (fonte do título, alertas) e gera:
- `contato-desktop.png` e `contato-mobile.png`: **folhas de contato**, com miniaturas numeradas de todas as telas numa imagem só.
- `desktop-01.png`, `desktop-02.png` e assim por diante: uma imagem por tela rolada, em 1440×900.
- `mobile-01.png` e seguintes, em 390×844.
- `desktop-full.jpg` e `mobile-full.jpg`: a página inteira, para quem for revisar depois.
- `report.json`, com:
  - erros de JavaScript e recursos que falharam;
  - rolagem lateral e conteúdo cortado na borda;
  - a fonte do maior texto da primeira tela e se ela carregou;
  - se o WhatsApp aparece sem rolar.

**Olhe pouco e bem, porque cada imagem aberta custa caro.** A ordem é:
1. Leia o resumo e o `report.json`.
2. Abra `desktop-01.png` e `mobile-01.png`: a primeira tela é a que mais importa.
3. Abra as duas folhas de contato para ver o ritmo da página inteira.
4. Abra uma tela individual só quando a folha mostrar algo suspeito (texto cortado, sobreposição, seção estranha). Não abra todas, e nunca abra a página inteira: ela é para pessoas, não para você.

Avalie com olhar de diretor de arte:
- **Primeira tela:** existe um elemento dominante? Em 3 segundos dá para saber o que é, onde fica e como agir? Dá para reconhecer este cliente, ou poderia ser qualquer um do setor?
- **Ritmo (folhas de contato):** as seções variam em densidade, escala e largura, ou repetem o mesmo esquema "título centralizado + blocos"? Alguma seção ficou longa demais no celular?
- **Anti-padrões:** algum item de `references/anti-padroes.md` entrou sem querer?
- **Detalhes:** acentos (ã, ç, ê) na fonte certa, contraste legível, nada cortado ou sobreposto, botão principal visível no celular sem rolar.
- **report.json:** no celular, `overflowX` precisa ser `false` e `cortadoNaBorda` precisa estar vazio. Erros de JS e recursos com falha precisam ser zero. A `fonteDisplay` precisa ser a fonte que você escolheu, com `carregou: true`.

Corrija e tire os screenshots de novo. Faça pelo menos uma rodada de ajuste: a primeira versão quase nunca é a melhor, e a maior parte da qualidade aparece na segunda passada. Nas rodadas seguintes, olhe só o que mudou.

### 7. Entrega

O site vai para a pasta do cliente:

```
<cliente>/
├── site/
│   ├── index.html        (ou index.php, se usar PHP)
│   ├── assets/           (css/, js/, img/, fonts/)
│   └── screenshots/      (da última revisão)
└── NOTAS.md
```

Se o usuário pedir outra estrutura, ou se for uma pasta de projeto que já existe, siga a dele.

O `NOTAS.md` deve ser curto e em português, com:
- O conceito em um parágrafo.
- As suposições feitas.
- Tudo o que está pendente ou com marcador: depoimentos, fotos, dados a confirmar.
- A lista de fotos para o cliente produzir.
- Como publicar.

Acrescente uma linha a `~/.claude/landing-page/registro.md`. Se o arquivo não existir, crie-o com este cabeçalho:

```
| Data | Cliente | Conceito | Fonte display / texto | Paleta dominante |
|---|---|---|---|---|
```

Na resposta ao usuário, dê o conceito em duas ou três frases, o que ficou pendente e o caminho da pasta. Termine com o próximo passo natural. Por exemplo: "quando o cliente mandar as fotos, cole aqui que eu troco as pendentes".
