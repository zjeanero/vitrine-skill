# Montar ou atualizar o perfil pessoal

O perfil faz a skill trabalhar do jeito de quem a usa: o gosto, a stack e os clientes dessa pessoa. Ele fica em `~/.claude/landing-page/`, fora da pasta da skill, para não se perder quando a skill for atualizada.

## Quando usar

- A pessoa pede para configurar ou personalizar a skill ("configura do meu jeito", "monta meu perfil").
- A pessoa traz uma referência nova ("adiciona esse site nas minhas referências").
- A pessoa muda uma preferência ("agora trabalho com Astro", "nunca mais quero carrossel").
- A pessoa quer mandar o perfil para alguém (**exportar**), usar o perfil que recebeu de alguém (**importar**) ou guardar uma cópia (**salvar**). Veja as seções no fim deste arquivo.

Para mudanças pequenas, edite só o arquivo afetado. Não refaça o perfil inteiro.

## Passo a passo (perfil novo)

### 1. Perguntar de uma vez

Faça as perguntas numa lista curta. Se a pessoa não souber alguma, siga com o que tiver:
1. Para quem você faz sites? (tipo de cliente, região, idioma)
2. Qual stack você usa ou quer usar, e onde costuma hospedar?
3. De 3 a 5 referências que você admira, e o que gosta em cada uma. Podem ser links, prints (arraste a imagem para o chat) ou uma pasta com prints. Não precisam ser sites: vale embalagem, revista, cartaz.
4. Algum estilo ou site que você odeia, ou que acha a cara do "feito por IA"?
5. Tem alguma regra sua? (ex.: "nada de carrossel", "sempre botão de WhatsApp")

### 2. Analisar as referências

**Prints e imagens:** quando a pessoa manda imagens no chat, você as vê diretamente. Quando aponta uma pasta, leia os arquivos de imagem dela. Nos dois casos, analise o que está visível. Não dá para saber a fonte exata por um print, então descreva o estilo ("serifada de alto contraste, parecida com uma Didot") em vez de chutar um nome.

**Links:** para cada site, rode o script de screenshot:

```bash
node <pasta-desta-skill>/scripts/screenshot.mjs <url> <pasta-temporária>/<nome-do-site> --slices=6 --wait=4000
```

- **Site com tela de entrada** ("Enter", aviso de cookies): use `--click=<seletor do botão>`.
- **Site com rolagem em WebGL ou JS:** o script rola com a roda do mouse automaticamente.

Depois de capturar:
- **Prints:** olhe pelo menos `desktop-01`, `mobile-01` e duas ou três fatias do meio da página.
- **Fontes:** use o `report.json` e, se precisar, o HTML do site para ver as fontes realmente aplicadas.
- **Não chute:** se não der para identificar algo, diga que não identificou.

### 3. Escrever `referencias.md`

Use o mesmo formato de `referencias-exemplo.md`. Para cada site:
- **Ideia:** qual é a ideia que governa a página.
- **Tipografia:** quais fontes e como são usadas.
- **Cor e material:** paleta, textura, tratamento de imagem.
- **Interface:** quanto de interface existe e de que tipo.
- **Levar:** o que vale aplicar em projetos de cliente.
- **Não levar:** o que funciona só naquele contexto.

No fim, acrescente uma seção "O que têm em comum" com 3 a 5 princípios. Ela é a parte mais útil do arquivo: é o gosto da pessoa traduzido em regras.

### 4. Escrever `preferencias.md`

```markdown
# Preferências

## Para quem eu faço sites
(tipos de cliente, região, idioma)

## Stack
(tecnologias, hospedagem, o que evitar e por quê)

## Meu gosto
(o que me atrai; referências em referencias.md)

## Nunca fazer
(regras pessoais)
```

### 5. Criar `registro.md`

Crie o arquivo só se ele não existir. Nunca apague um registro antigo.

```
| Data | Cliente | Conceito | Fonte display / texto | Paleta dominante |
|---|---|---|---|---|
```

### 6. Confirmar

Mostre um resumo do perfil à pessoa: os princípios tirados das referências, a stack e as regras. Pergunte se ficou do jeito dela e ajuste o que ela pedir. Depois, ofereça salvar (veja "Salvar" abaixo).

## Exportar (mandar o seu perfil para alguém)

Junte o perfil num **arquivo só**, fácil de mandar por WhatsApp ou e-mail. Salve em `perfil-<nome>.md`, na pasta atual, ou onde a pessoa pedir:

```markdown
# Perfil da skill landing-page: <nome>

Para usar: instale o plugin (/plugin install lp --marketplace zjeanero/claude-skills)
e digite /lp:perfil importar <caminho deste arquivo>.

<!-- lp:arquivo preferencias.md -->
(conteúdo de preferencias.md)

<!-- lp:arquivo referencias.md -->
(conteúdo de referencias.md)
```

- **O `registro.md` fica de fora por padrão,** porque tem nomes de clientes. Inclua só se a pessoa pedir.
- **Antes de exportar, revise o conteúdo** e tire o que for particular (nome de cliente, telefone).
- **Exportação parcial:** se a pessoa pedir só uma parte ("exporta só as minhas referências"), inclua só aquela parte, com o mesmo marcador.
- **Na entrega,** diga onde o arquivo ficou e o que o amigo precisa fazer: instalar o plugin e usar `/lp:perfil importar <arquivo>`.

## Importar (usar o perfil que alguém mandou)

1. Leia o arquivo e separe as partes pelos marcadores `<!-- lp:arquivo ... -->`.
2. **Se a pessoa ainda não tem perfil,** crie os arquivos em `~/.claude/landing-page/`.
3. **Se ela já tem perfil,** pergunte o que fazer antes de tocar em qualquer coisa:
   - **juntar:** acrescenta as referências recebidas às dela e mantém as preferências dela;
   - **substituir:** guarda o perfil antigo numa subpasta `antigo-<data>/` antes de trocar;
   - **cancelar.**
4. **Nunca importe o `registro.md` de outra pessoa.** O registro é de cada um.
   - **Para desfazer um "substituir"** ("volta o meu perfil antigo"), copie de volta os arquivos da subpasta `antigo-<data>/` mais recente, depois de guardar o perfil atual do mesmo jeito.
5. **No fim, ofereça adaptar:** "Quer deixar com a sua cara? Me conte a sua stack, para quem você faz sites e mande referências suas". O perfil importado é **uma cópia**: o que a pessoa mudar não afeta o original de quem mandou.

## Salvar (cópia de segurança)

**Se a pasta `~/.claude/landing-page/` for um repositório git com destino configurado,** ofereça salvar depois de qualquer mudança. Se a pessoa aceitar, rode `git add -A`, depois `git commit -m "Update profile: <o que mudou, em poucas palavras>"` e por fim `git push`.

**Se não for um repositório,** explique que dá para guardar uma cópia privada no GitHub. Só crie com a pessoa de acordo, e confirme o nome:

```bash
cd ~/.claude/landing-page && git init -b main && git add -A && git commit -m "Create profile"
gh repo create <nome> --private --source . --push
```

**Num computador novo,** para recuperar o perfil: `git clone https://github.com/<usuario>/<nome>.git ~/.claude/landing-page`.
