# Negócio local: o que a página precisa fazer

O design autoral não pode atrapalhar o trabalho da página: fazer a pessoa certa chamar, ligar ou aparecer. Tudo abaixo cabe dentro de qualquer conceito. O conceito decide a forma visual de cada item; a presença do item não é opcional.

## Ação principal

- **WhatsApp:** `https://wa.me/55DDDNUMERO?text=MENSAGEM`, só com dígitos no número.
  - Exemplo: `https://wa.me/5531987654321?text=Ol%C3%A1%21%20Vim%20pelo%20site`.
  - A mensagem pré-preenchida deve ser curta e combinar com o botão que a dispara ("Quero encomendar para sábado", "Quero orçamento de revisão").
  - Codifique a mensagem com URL encoding.
- **Telefone:** `<a href="tel:+5531987654321">(31) 98765-4321</a>`. O link usa só dígitos; o texto visível segue o formato brasileiro.
- **Como chegar:** use `https://www.google.com/maps/search/?api=1&query=<endereço codificado>`.
  - O endereço completo também aparece como texto, não só dentro do mapa.
  - Evite o iframe do Google Maps na primeira tela: ele pesa e atrasa a página. Se usar, coloque mais abaixo e com `loading="lazy"`.
- **Ação sempre ao alcance no celular:** a ação principal fica perto do polegar, numa barra fixa no rodapé da tela ou num botão que acompanha a rolagem.
  - O botão é desenhado dentro do conceito, mas o ícone do WhatsApp continua reconhecível.
  - Evite o balão verde flutuante genérico: ele é o "Saiba mais" das páginas locais.
- **Formulário só quando o fluxo pedir,** como em orçamentos com muitos detalhes ou anexos. Para negócio local no Brasil, o WhatsApp costuma funcionar melhor que formulário.

## Informações que não podem faltar

- Horário de funcionamento, com os dias. Se o cliente informar, inclua também feriados e exceções.
- Endereço com bairro e cidade.
- Áreas atendidas, se houver entrega ou atendimento em domicílio.
- Formas de pagamento.
- Como funciona: agendamento, ordem de chegada ou encomenda com antecedência.
- Preço ou faixa de preço, quando o cliente fornecer.
- CNPJ ou registro profissional no rodapé, quando for o caso.

## Confiança, sem inventar

- **Fotos:** fotos reais do lugar, das pessoas e do produto valem mais que qualquer efeito.
- **Avaliações:** só avaliações reais do Google (texto, nome como aparece, nota). Sem acesso a elas, use o marcador `[[AVALIAÇÃO REAL DO GOOGLE]]`.
- **Credenciais:** tempo de casa, número de atendimentos e prêmios só entram se o cliente informou.
- **Saúde** (médico, dentista, fisioterapeuta, psicólogo, nutricionista, veterinário): os conselhos profissionais (CFM, CFO, COFFITO, CFP, CFN, CFMV) regulam a publicidade. Regras comuns:
  - nome e número de registro do responsável técnico visíveis;
  - nada de promessa de resultado;
  - cuidado com "antes e depois", preço usado como chamariz e depoimentos de pacientes.

  Não use nada disso sem o cliente confirmar que está de acordo com as regras do conselho dele, e registre o ponto no `NOTAS.md`.

  **A página precisa parecer de saúde.** Mesmo quando o cliente pede para fugir do visual de clínica, mantenha:
  - aparência limpa, com respiro;
  - um tom calmo;
  - o registro profissional visível no topo;
  - pelo menos uma cor que passe higiene e cuidado (um fundo claro e limpo, um verde ou azul suave).

  O calor e a personalidade vêm do conceito e da tipografia. Página de saúde com clima de loja de brinquedos ou de café perde a confiança dos pais e dos pacientes.
- **Advocacia:** a OAB também restringe a publicidade. O tom deve ser informativo, sem captação ostensiva e sem promessa de resultado.

## SEO local

- **`<html lang="pt-BR">`.**
- **Um único `<h1>`, dizendo o que é e onde** (ex.: "Lavanderia na Savassi, Belo Horizonte"). Se o título de impacto for outra frase, ele pode ser um `<p>` grande, e o `<h1>` fica por perto como rótulo. Melhor ainda é um título que faça as duas coisas.
- **`<title>`:** "Nome · Serviço em Bairro, Cidade", com cerca de 60 caracteres.
- **Meta description:** cerca de 150 caracteres, com o diferencial e a ação.
- **Open Graph** (`og:title`, `og:description`, `og:image` em 1200×630, `og:locale` = `pt_BR`): o link vai ser compartilhado no WhatsApp, e essas tags montam o card que aparece na conversa. Esse card é a primeira impressão de muita gente.
- **JSON-LD** com o tipo mais específico do schema.org: `Restaurant`, `Bakery`, `CafeOrCoffeeShop`, `AutoRepair`, `Dentist`, `MedicalClinic`, `Physiotherapy`, `HairSalon`, `BeautySalon`, `HealthClub`, `Store`, `LegalService`, `AccountingService`, `DryCleaningOrLaundry`, ou `LocalBusiness` se nenhum servir:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Nome do negócio",
  "url": "https://dominio.com.br/",
  "image": "https://dominio.com.br/assets/img/og.jpg",
  "telephone": "+55-31-98765-4321",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Exemplo, 123",
    "addressLocality": "Cidade",
    "addressRegion": "UF",
    "postalCode": "00000-000",
    "addressCountry": "BR"
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:00", "closes": "18:00" }
  ],
  "sameAs": ["https://www.instagram.com/perfil"]
}
</script>
```

- **Mesmos dados em todo lugar:** nome, endereço e telefone idênticos aos do Perfil da Empresa no Google.
- **Favicon:** um SVG simples, tirado do conceito.

## Desempenho (celular comum no 4G)

- **Meta:** página inicial abaixo de cerca de 1 MB, com o conteúdo principal visível em menos de 2,5 s.
- **Imagens:**
  - formato WebP ou AVIF;
  - `width` e `height` sempre, para a página não pular enquanto carrega;
  - `loading="lazy"` abaixo da primeira tela;
  - `fetchpriority="high"` na imagem principal;
  - `srcset` para servir tamanhos diferentes.
- **Fontes:** até duas famílias e poucos pesos, com `display=swap`.
- **JavaScript:** o mínimo. Nada de biblioteca para efeito que o CSS resolve, e nada de jQuery.
- **Vídeo de fundo:** evite no celular. Se usar, que seja curto, mudo, com `playsinline` e um poster leve.

## Acessibilidade

- **Contraste AA:** 4,5:1 para texto normal e 3:1 para texto grande.
- **Navegação:** foco visível e alvos de toque com pelo menos 44px.
- **Textos alternativos:** `alt` descritivo em toda imagem, inclusive nas fotos pendentes.
- **Movimento:** `prefers-reduced-motion` respeitado.
- **Texto:** texto real, nunca texto dentro de imagem, com headings em ordem lógica.

## LGPD

- **Formulário que coleta dados:** diga para que servem e quem recebe, inclua link para a política de privacidade se houver, e não use checkbox pré-marcado.
- **Cookies e rastreamento:** sem cookies de rastreamento, não precisa de banner. Com Pixel do Meta ou Google Analytics, precisa de aviso e consentimento.
