[Português](README.md) · **English**

# lp: landing pages that don't look AI-generated

A **Claude Code** plugin that builds landing pages for freelance clients and local businesses. Each page grows out of the client's own world (the bakery's paper bread bag, the auto shop's work order) instead of a template.

> The skill is built for Brazilian small businesses. It writes in Brazilian Portuguese and knows local needs like WhatsApp ordering, Google listings and professional advertising rules. The command names are in Portuguese too, and the table below translates them.

![Same request, without and with the skill: a bakery](docs/img/comparacao-padaria-fermento-lenha.jpg)

<sub>Same request, same AI model. Left: without the skill ("Sem a skill"). Right: with it ("Com a skill").</sub>

---

## Get started in 1 minute

**1. Install.** In Claude Code, type:

```
/plugin install lp --marketplace zjeanero/claude-skills
```

**2. Restart Claude Code and type:**

```
/lp:inicio
```

That's it: Claude walks you through the steps and asks where you'd like to start.

---

## From request to website in 5 steps

| | You type | You get |
|:-:|---|---|
| **0** | `/lp:perfil` *(once)* | Claude learns your taste. Send links or screenshots of sites you admire. |
| **1** | `/lp:briefing Padaria do Sérgio` | A ready-to-send WhatsApp message for your client, with the questions and a photo shot list. |
| **2** | Paste the client's reply, or `/lp:aproveitar <link>` | Everything organized: what's confirmed and what's still missing. |
| **3** | `/lp:conceitos` | 2 or 3 visual directions, in HTML and PDF, for the client to choose from. |
| **4** | `/lp:site` | The finished site, checked on desktop and mobile, with a list of what's still pending. |

Need changes later? Just ask: *"make the headline bigger"*, *"the client sent the photos, swap out the placeholders"*.

> Commands are just shortcuts. Plain language works too: *"make a landing page for Marcos's barbershop in Contagem"*.

---

## Before and after

![Without and with the skill: an auto repair shop](docs/img/comparacao-oficina-pacheco.jpg)

![Without and with the skill: a pediatric dentist](docs/img/comparacao-odontopediatra-helena.jpg)

<sub>All three businesses are fictional and were used to test the skill. Both versions of each one got exactly the same request.</sub>

---

## What the skill does differently

- **It starts from the client's world.** The objects, words and habits of the business become the visual concept. No "centered headline + 3 icon cards".
- **It never makes things up.** Testimonials, numbers or awards the client didn't provide are marked `[[like this]]` for you to fill in.
- **It checks its own work.** It screenshots the page on desktop and mobile, finds what broke and fixes it before delivering.
- **It's made for local businesses in Brazil.** WhatsApp with a pre-filled message, Google listings, opening hours, and the advertising rules for dentists, doctors and lawyers.
- **It learns your taste.** Your profile (references, stack, pet peeves) is saved and applies to every site.

---

## Your version of the skill

The skill is the same for everyone. What changes from person to person lives in a **profile** saved on your computer:

| | Ships with the plugin (same for everyone) | Lives in your profile (yours only) |
|---|---|---|
| **What** | The method, the "AI look" anti-patterns, typography, local-business checklist, commands | Your references, your stack, your taste, your projects |
| **Where** | Installed by `/plugin install` | `~/.claude/landing-page/` |
| **Updates** | Arrive with `claude plugin update` | Never erased by updates |

**To create yours, type `/lp:perfil`.** Claude asks who you build sites for and which stack you use, then asks for 3 to 5 references: links, screenshots, even packaging or a magazine you like. It analyzes them and saves your profile. From then on, **your profile wins** on taste and stack.

The skill ships with 4 studio websites analyzed as a **format example**, and your references take their place. A complete example profile lives in [`perfis/zjeanero/`](perfis/zjeanero/).

---

## All commands

| Command | Means | What it does |
|---|---|---|
| `/lp:inicio` | start | Shows the step-by-step and where to begin |
| `/lp:perfil` | profile | Records your taste: references (links or screenshots), stack, what to avoid |
| `/lp:briefing` | briefing | Writes the message for your client: questions and photo list |
| `/lp:aproveitar` | reuse | Pulls content from the client's website, Instagram or Google listing |
| `/lp:conceitos` | concepts | Builds visual directions for the client to choose from (HTML + PDF) |
| `/lp:site` | site | Builds the website |
| `/lp:revisar` | review | Audits any website: what looks AI-made and what's missing |

---

## Quick questions

<details>
<summary><b>Do I need to know how to code?</b></summary>

No. You talk to Claude, and it writes the code and delivers a finished folder. Knowing HTML helps with fine-tuning, but it isn't required.
</details>

<details>
<summary><b>What technology do the sites use?</b></summary>

By default, plain HTML, CSS and JavaScript, which run on any host, plus PHP when needed. If you work with another stack (Astro, Next.js, WordPress…), say so in `/lp:perfil` and the skill will use it.
</details>

<details>
<summary><b>Where do the files go?</b></summary>

Each client gets a folder:

```
padaria-do-sergio/
├── briefing.md      what we know about the business (each fact with its source)
├── material/        photos, screenshots and logo the client sent
├── conceitos/       the visual directions (index.html + pagina.pdf)
├── site/            the finished website
└── NOTAS.md         pending items, photo list, how to publish
```

Your profile lives in `~/.claude/landing-page/` and survives skill updates.
</details>

<details>
<summary><b>Does the skill generate photos?</b></summary>

No, on purpose: a made-up photo of a business misleads the people who go there. The skill uses the client's real photos with art direction (duotone, cut-outs, grain) and drawings made in code. Where a photo is still missing, it leaves a placeholder describing exactly which shot to take.
</details>

<details>
<summary><b>How much of my plan does it use?</b></summary>

About 650 tokens per session, so Claude knows the skill exists, and roughly 7k each time it's used. In testing, a complete site with visual review took 240k to 330k tokens; the current version looks at fewer images during review and should use less.
</details>

<details>
<summary><b>Do I need anything installed?</b></summary>

Node 22 or newer and Chrome or Edge, which are used to take the review screenshots. If your browser lives somewhere unusual, set the `CHROME_PATH` environment variable.
</details>

<details>
<summary><b>How do I update, disable or remove it?</b></summary>

```
claude plugin update lp@claude-skills      update (then restart Claude Code)
claude plugin disable lp@claude-skills     turn off without removing
claude plugin uninstall lp@claude-skills   remove
```
</details>

---

<details>
<summary><b>For maintainers</b></summary>

```
.claude-plugin/marketplace.json     catalog that enables one-command install
plugins/landing-page/               the "lp" plugin
├── .claude-plugin/plugin.json      name, version, description
├── commands/                       the /lp:* commands
└── skills/landing-page/            the skill (in Portuguese)
    ├── SKILL.md                    usage modes + 7-step process
    ├── references/                 anti-patterns, typography, local business, briefing, concepts…
    └── scripts/screenshot.mjs      screenshots + contact sheet + report (no dependencies)
perfis/                             example profiles
avaliacao/                          with/without-skill tests (cases, automatic grading)
docs/img/                           images for this README
```

**To release a version:**
1. Bump `version` in `plugins/landing-page/.claude-plugin/plugin.json`.
2. Run `claude plugin validate .`.
3. Push, then run `claude plugin update lp@claude-skills`.

The full history (what was built, the tests and the next steps) is in **[GUIA.md](GUIA.md)**, in Portuguese.
</details>
