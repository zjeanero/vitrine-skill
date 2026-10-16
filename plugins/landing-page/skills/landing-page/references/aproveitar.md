# Aproveitar o que o cliente já tem (e diagnosticar um site existente)

Muitos clientes já têm um site antigo, um Instagram ou um perfil no Google com conteúdo real: horários, fotos, histórias, avaliações. Este modo extrai esse conteúdo para o `briefing.md`, para que a página nova tenha menos marcadores `[[...]]` e mais verdade.

## Site atual

```bash
node <pasta-desta-skill>/scripts/screenshot.mjs <url> <cliente>/material/site-atual --extra --slices=8
```

O `report.json` traz, em `primeiraTela`:
- `textoDaPagina`: todo o texto visível;
- `imagens`: endereço, texto alternativo e tamanho das imagens.

Também saem os prints e as folhas de contato.

**O que extrair:**
- **Fatos:** horários, endereço, telefones, serviços, preços (se houver), história, nomes de pessoas, CNPJ, registros profissionais.
- **Fotos próprias do cliente:**
  - baixe para `material/` só as que são claramente dele, como a fachada, a equipe e os produtos;
  - site antigo costuma ter **fotos de banco de imagens**: não reaproveite (são anti-padrão e podem ter licença) e, na dúvida, pergunte;
  - registre a origem de cada foto.
- **O que manter:** texto que já tem a voz do dono, expressões do negócio, um slogan antigo de que os clientes gostam.

## Instagram e Google

Essas páginas costumam exigir login ou bloquear captura automática.
1. **Tente o link uma vez** com o script.
2. **Se aparecer tela de login ou página vazia,** não insista. Peça prints ao usuário:
   - *Instagram:* a bio, os destaques e os 6 a 9 posts de que o cliente mais gosta;
   - *Google:* a ficha do negócio (horário, endereço, nota) e as avaliações escolhidas.
3. **Os prints** que a pessoa mandar no chat você lê diretamente.

**Avaliações:**
- Transcreva **exatamente**, com o nome como aparece, a nota e a data. Para encurtar, use "[…]"; nunca reescreva.
- Use só com o cliente ciente e de acordo.
- Prefira as que falam de algo específico ("o vídeo da peça antes de trocar") às genéricas ("ótimo atendimento").

## Registrar

Atualize `<cliente>/briefing.md`: cada fato com a fonte ("site atual", "Instagram", "Google, avaliação de 03/2026"). Se duas fontes discordarem, como o horário no Google e no site, marque o conflito e sugira perguntar ao cliente.

## Diagnóstico do site atual (também usado em `/lp:revisar`)

Quando existe um site antigo, ou quando a pessoa pede para revisar um site, escreva um diagnóstico curto. Ele serve para o freelancer justificar o projeto ao cliente.
- **De 3 a 6 problemas,** cada um com o porquê e o efeito no cliente final:
  - "o horário não aparece no celular sem rolar 4 telas: quem vem do Google Maps desiste";
  - "o título 'Qualidade e tradição' serve para qualquer padaria";
  - "fotos de banco de imagens: o cliente não reconhece o lugar quando chega".
- **Fontes dos problemas:** use `anti-padroes.md`, o `report.json` (rolagem lateral, erros, WhatsApp fora da primeira tela, fonte que não carregou) e o checklist de `negocio-local.md`.
- **O que está bom e deve ficar.**
- **Tom respeitoso:** o site pode ter sido feito pelo próprio cliente ou por um sobrinho. Critique o resultado, nunca quem fez.

Em `/lp:revisar` sem projeto novo, entregue só o diagnóstico, com os prints da primeira tela, como `diagnostico.md` na pasta indicada (ou numa pasta nova com o nome do site).
