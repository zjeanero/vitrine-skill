# lp: landing pages que não parecem feitas por IA

Um plugin para o **Claude Code** que cria landing pages para clientes de freela e negócios locais. Cada página nasce do mundo do próprio cliente, como o saco de pão da padaria ou a ordem de serviço da oficina, e não de um template.

![Mesmo pedido, sem e com a skill: Padaria Fermento & Lenha](docs/img/comparacao-padaria-fermento-lenha.jpg)

<sub>Mesmo pedido, mesmo modelo de IA. À esquerda, sem a skill; à direita, com ela.</sub>

---

## Começar em 1 minuto

**1. Instale.** Dentro do Claude Code, digite:

```
/plugin install lp --marketplace zjeanero/claude-skills
```

**2. Reinicie o Claude Code e digite:**

```
/lp:inicio
```

Pronto: o Claude mostra o passo a passo e pergunta por onde você quer começar.

---

## Do pedido ao site, em 5 passos

| | Você digita | Você recebe |
|:-:|---|---|
| **0** | `/lp:perfil` *(uma vez só)* | O Claude aprende o seu gosto. Mande links ou prints de sites que você admira. |
| **1** | `/lp:briefing Padaria do Sérgio` | Uma mensagem pronta para mandar no WhatsApp do cliente, com as perguntas e a lista de fotos. |
| **2** | Cole a resposta do cliente, ou `/lp:aproveitar <link>` | Tudo organizado: o que já é fato e o que ainda falta. |
| **3** | `/lp:conceitos` | 2 ou 3 caminhos visuais, em HTML e PDF, para o cliente escolher. |
| **4** | `/lp:site` | O site pronto, conferido no computador e no celular, com a lista do que ficou pendente. |

Para ajustar depois, é só pedir: *"aumenta o título"*, *"o cliente mandou as fotos, troca as pendentes"*.

> Os comandos são só atalhos. Também funciona falando normalmente: *"faz uma landing page pra barbearia do Marcos em Contagem"*.

---

## Antes e depois

![Sem e com a skill: oficina mecânica](docs/img/comparacao-oficina-pacheco.jpg)

![Sem e com a skill: dentista de criança](docs/img/comparacao-odontopediatra-helena.jpg)

<sub>Os três negócios são fictícios e foram usados nos testes da skill. As duas versões de cada um receberam exatamente o mesmo pedido.</sub>

---

## O que muda com a skill

- **Começa pelo mundo do cliente.** Os objetos, as palavras e o jeito do negócio viram o conceito visual. Nada de "título centralizado + 3 cards com ícone".
- **Não inventa nada.** Depoimento, número ou prêmio que o cliente não deu aparece marcado `[[assim]]`, para você completar.
- **Confere o próprio trabalho.** Ela tira prints no computador e no celular, acha o que quebrou e corrige antes de entregar.
- **Foi feita para negócio local no Brasil.** WhatsApp com mensagem pronta, Google, horários e as regras de publicidade de dentista, médico e advogado.
- **Aprende o seu gosto.** O seu perfil (referências, stack, o que você odeia) fica salvo e vale para todo site.

---

## Todos os comandos

| Comando | Para quê |
|---|---|
| `/lp:inicio` | Mostra o passo a passo e por onde começar |
| `/lp:perfil` | Registra o seu gosto: referências (links ou prints), stack, o que evitar |
| `/lp:briefing` | Gera a mensagem para o cliente: perguntas e lista de fotos |
| `/lp:aproveitar` | Puxa o conteúdo do site, Instagram ou Google do cliente |
| `/lp:conceitos` | Monta os caminhos visuais para o cliente escolher (HTML + PDF) |
| `/lp:site` | Faz o site |
| `/lp:revisar` | Faz o diagnóstico de qualquer site: o que tem cara de IA e o que falta |

---

## Perguntas rápidas

<details>
<summary><b>Preciso saber programar?</b></summary>

Não. Você conversa com o Claude, e ele escreve o código e entrega a pasta pronta. Saber HTML ajuda nos ajustes finos, mas não é obrigatório.
</details>

<details>
<summary><b>Que tecnologia o site usa?</b></summary>

Por padrão, HTML, CSS e JavaScript puros, que abrem em qualquer hospedagem, com PHP quando precisa. Se você trabalha com outra stack (Astro, Next.js, WordPress…), diga isso no `/lp:perfil`, e a skill passa a usá-la.
</details>

<details>
<summary><b>Onde ficam os arquivos?</b></summary>

Cada cliente ganha uma pasta:

```
padaria-do-sergio/
├── briefing.md      o que sabemos do negócio (cada fato com a fonte)
├── material/        fotos, prints e logo que o cliente mandou
├── conceitos/       os caminhos visuais (index.html + pagina.pdf)
├── site/            o site pronto
└── NOTAS.md         pendências, lista de fotos, como publicar
```

O seu perfil fica em `~/.claude/landing-page/` e não se perde quando a skill é atualizada.
</details>

<details>
<summary><b>A skill gera fotos?</b></summary>

Não, e de propósito: foto inventada do negócio engana quem vai até lá. A skill usa as fotos reais do cliente com tratamento (duotone, recorte, granulação) e desenhos feitos em código. Onde ainda falta foto, ela deixa um espaço descrevendo exatamente qual foto tirar.
</details>

<details>
<summary><b>Quanto consome do meu plano?</b></summary>

Cerca de 650 tokens fixos por sessão, para o Claude saber que a skill existe, e uns 7 mil cada vez que ela é usada. Nos testes, um site completo com revisão visual ficou entre 240 e 330 mil tokens; a versão atual olha menos imagens na revisão e tende a gastar menos.
</details>

<details>
<summary><b>Precisa ter alguma coisa instalada?</b></summary>

Node 22 ou mais novo e Chrome ou Edge, que servem para tirar os prints de revisão. Se o navegador estiver num lugar diferente do padrão, defina a variável `CHROME_PATH`.
</details>

<details>
<summary><b>Como atualizar, desligar ou remover?</b></summary>

```
claude plugin update lp@claude-skills      atualizar (depois, reinicie o Claude Code)
claude plugin disable lp@claude-skills     desligar sem remover
claude plugin uninstall lp@claude-skills   remover
```
</details>

---

<details>
<summary><b>Para quem mantém este repositório</b></summary>

```
.claude-plugin/marketplace.json     catálogo que permite instalar com um comando
plugins/landing-page/               o plugin "lp"
├── .claude-plugin/plugin.json      nome, versão, descrição
├── commands/                       os comandos /lp:*
└── skills/landing-page/            a skill
    ├── SKILL.md                    modos de uso + processo em 7 etapas
    ├── references/                 anti-padrões, tipografia, negócio local, briefing, conceitos…
    └── scripts/screenshot.mjs      prints + folha de contato + relatório (sem dependências)
perfis/                             perfis de exemplo
avaliacao/                          testes com e sem a skill (casos, correção automática)
docs/img/                           imagens deste README
```

**Para lançar uma versão:**
1. Suba a `version` em `plugins/landing-page/.claude-plugin/plugin.json`.
2. Rode `claude plugin validate .`.
3. Faça o push e rode `claude plugin update lp@claude-skills`.

O histórico completo (o que fizemos, os testes e os próximos passos) está no **[GUIA.md](GUIA.md)**.
</details>
