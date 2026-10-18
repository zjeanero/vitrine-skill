# Aprovação: aprender com o que a pessoa aprova

A pessoa avalia sites prontos (dela, de teste ou de cliente) numa página simples: Aprovado, Em dúvida ou Não aprovado, com etiquetas do que gostou e do que não curtiu e uma observação. Cada avaliação vira histórico, e o histórico vira o arquivo **"o que funciona pra mim"**, que a skill lê em todo trabalho. É assim que o gosto da pessoa entra na skill pelas decisões dela, e não só pelas referências.

## 1. Gerar a página de aprovação

1. **Escolha os sites:** os da pasta indicada, os projetos recentes do `registro.md` ou um lote de testes. Mais de 8 cansa; divida em lotes.
2. **Garanta os prints de cada site:**
   - `desktop-01.png`, `mobile-01.png` e `desktop-full.jpg`;
   - para a pessoa poder **marcar no print** o lugar exato de cada ajuste, também `mobile-full.jpg`, `desktop-mapa.json` e `mobile-mapa.json` na mesma pasta.

   O `scripts/screenshot.mjs` gera tudo isso; rode-o no `index.html` do site. Prints antigos, sem os mapas, ainda funcionam: aí a página só deixa desenhar uma área.
3. **Escreva o manifesto** (`aprovacao-manifesto.json`), com caminhos relativos a ele:

```json
{
  "lote": "2026-10-padaria",
  "titulo": "Aprovação: Padaria do Sérgio",
  "cego": false,
  "itens": [
    { "id": "padaria-direcao-1", "grupo": "Padaria do Sérgio", "rotulo": "Direção 1: balcão de encomendas",
      "imagens": { "desktop": "site/screenshots/desktop-01.png", "celular": "site/screenshots/mobile-01.png", "inteira": "site/screenshots/desktop-full.jpg" } }
  ]
}
```

- **Use `"cego": true`** para comparar versões do mesmo pedido, como em teste com e sem a skill ou direções concorrentes. A página mostra "Versão A/B" em ordem sorteada, e o mapa fica em `<saída>-chaves.json`. **Nunca revele o mapa antes de receber o resultado.**

4. **Gere a página:**

```bash
node <pasta-desta-skill>/scripts/aprovacao.mjs <manifesto.json> <pasta>/aprovacao.html
```

   Para publicar a página no claude.ai (por exemplo, para a pessoa avaliar pelo celular, longe do computador), gere com `--artefato` e publique esse arquivo como página privada.

5. **Entregue o caminho do `aprovacao.html`** (ou o link da página publicada) e explique em uma frase: abrir, carimbar, marcar no print o que quiser mudar, tocar em **Assinar e copiar resultado** e colar aqui.

## 2. Processar o resultado

O texto colado termina com um bloco `<lp-aprovacao>{...}</lp-aprovacao>`. Ele tem:
- o lote e a data;
- para cada site: o código, o veredito (`aprovado`, `duvida`, `nao` ou nulo), as listas `gostei` e `naoCurti`, a `obs` e as `marcas` (ajustes apontados no print, veja abaixo);
- `escolhas`: em cada grupo com mais de uma versão, qual iria para o cliente (um código, `nenhuma` ou nulo).

**A escolha é o sinal mais forte de preferência.** Ela desempata quando tudo foi aprovado.

1. **Traduza os códigos.** No modo cego, use o `-chaves.json` do lote; fora dele, o código é o próprio `id`.
2. **Levante as características de cada site.** São elas que permitem aprender alguma coisa:
   - **Conceito:** uma linha, tirada do `NOTAS.md` do site.
   - **Fonte do título e fonte do texto:** use `fonteDisplay` do `report.json` do screenshot e o CSS do site.
   - **Paleta:** clara ou escura, mais a cor dominante.
   - **Estrutura marcante:** lista com fios, cards, seções que empilham, ilustração grande, mockup de celular.
   - **Comprimento no celular:** a altura da página no celular dividida por 844, em número de telas.
   - **Contexto:** o tipo de negócio, e se é teste ou cliente real.
3. **Acrescente uma linha por site** em `~/.claude/landing-page/aprovacoes.md`. Crie o arquivo se não existir; nunca apague linhas antigas.

```
| Data | Lote | Site | Veredito | Escolhido p/ cliente | Gostei | Não curti | Observação | Características |
|---|---|---|---|---|---|---|---|---|
```

Em "Escolhido p/ cliente", use "Sim", "Não" ou "—" quando não houve comparação.

4. **Recalcule `~/.claude/landing-page/gosto-aprendido.md`** a partir de **todo** o histórico (formato abaixo).
5. **Anote os ajustes marcados** no `NOTAS.md` do site (veja "Marcas no print", abaixo).
6. **Responda à pessoa** com:
   - o placar do lote;
   - o que aprendeu de novo;
   - no modo cego, a revelação de qual era qual;
   - o que vai mudar nos próximos sites;
   - se houver marcas: quantos ajustes ficaram anotados, e a pergunta se é para aplicar agora.

## Marcas no print

Cada marca é um pedido de ajuste com lugar exato. Ela vem assim:

```json
{ "n": 1, "vista": "celular",
  "alvo": { "seletor": "section.abertura h1", "tipo": "título", "rotulo": "Pouco de cada vez" },
  "dentro": null, "contem": [], "area": { "x": 20, "y": 640, "w": 350, "h": 120 },
  "obs": "Título um pouco menor no celular" }
```

- **`alvo`:** o componente que a pessoa tocou, com o seletor CSS do site renderizado.
- **`dentro` e `contem`:** quando ela desenhou uma área livre, `alvo` vem nulo. `dentro` é o menor componente que contém a área, e `contem` lista os componentes que estão inteiros dentro dela.
- **`area`:** a posição em pixels da página inteira, na `vista` indicada (computador com 1440 de largura, celular com 390).

**Como tratar:**
1. **Anote no `NOTAS.md`** do site, numa seção "Ajustes pedidos na aprovação (<data>)", um item por marca: `- [ ] (celular) título "Pouco de cada vez" (section.abertura h1): Título um pouco menor no celular`.
2. **Marca sem anotação** quer dizer "isto me incomodou". Pergunte o que mudar antes de mexer.
3. **Para aplicar:**
   - ache o elemento pelo seletor (id e classes aparecem no HTML e no CSS do site). Numa área livre, use `dentro` e `contem`;
   - respeite a `vista`. Ajuste de celular vai nos estilos base, que são mobile-first; ajuste de computador vai dentro do `@media` de tela larga. Assim um não estraga o outro.
4. **Confira só o lugar mexido:** rode o screenshot de novo e abra a tela que contém a marca, sem precisar abrir todas. A tela é `floor(area.y / altura da tela) + 1`: 900 no computador e 844 no celular. Por exemplo, `y: 1900` no computador fica em `desktop-03.png`. Depois marque o item como feito no `NOTAS.md`.
5. **O que vai para o `gosto-aprendido.md`:** só anotações que falam de gosto em geral, como "linha fina demais some". Elas entram em "Pedidos diretos". Correções específicas do site, como "trocar esta foto", ficam só no `NOTAS.md`.

## Formato do `gosto-aprendido.md`

```markdown
# O que funciona pra mim
Aprendido das aprovações. Atualizado em <data>: <N> sites avaliados (<A> aprovados, <D> em dúvida, <R> não aprovados).

## Tendências (3 ou mais sites)
- Funciona: títulos em letra condensada (média 0,9 em 4 sites)
- Não funciona: página com mais de 10 telas no celular (média 0,2 em 3 sites)

## Sinais iniciais (1 ou 2 sites, ainda não são regra)
- Funciona: papel e materiais como textura (1 de 1)

## Pedidos diretos
- "A etiqueta ficou pequena no celular" (Padaria, 16/10)
```

**Regras do cálculo:**
- **Média por característica:** Aprovado vale 1, Em dúvida vale 0,5, Não aprovado vale 0. Sempre mostre a média **e** a quantidade de sites.
- **Escolhas:** conte à parte ("escolhida para o cliente em 3 de 4 comparações"). Quando a média não separa as opções, é a escolha que diz o que a pessoa prefere.
- **O que vira tendência:** só características com 3 ou mais sites. Abaixo disso, vão em "Sinais iniciais".
- **Peso das etiquetas:** "Gostei/Não curti" valem mais que o veredito. Um site aprovado com "Não curti: Cores" conta contra a paleta dele.
- **Observações escritas:** entram literalmente em "Pedidos diretos", com o site e a data. São os sinais mais fortes que existem.
- **Contexto:** não condene uma característica por um único site de briefing difícil. Na dúvida, deixe em "Sinais iniciais".
- **Edição pela pessoa:** ela pode editar o arquivo. Se uma linha foi escrita à mão, preserve-a.

## Como o que foi aprendido é usado

- **Nas etapas 3 e 5 do `SKILL.md`,** junto com `preferencias.md` e `referencias.md`, leia o `gosto-aprendido.md` se ele existir:
  - **Tendências:** puxe as direções para o que funciona.
  - **Pedidos diretos:** trate como regras.
  - **Sinais iniciais:** valem só como desempate.
- **O aprendizado não substitui o método.** O conceito continua saindo do mundo do cliente; o gosto aprendido decide como dar forma a ele.
- **Falhas do método** que se repetem em sites diferentes (por exemplo, "longa demais no celular" 3 vezes) também viram sugestão de melhoria da própria skill. Avise a pessoa: isso vale para todo mundo, não só para ela.
