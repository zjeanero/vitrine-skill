// Gera eval_metadata.json de cada eval e atualiza evals/evals.json com as assertions.
// Uso: node write-metadata.cjs <pasta-iteration> <evals.json>
const fs = require('fs');
const path = require('path');

const [iterDir, evalsPath] = process.argv.slice(2);

const common = [
  'Link de WhatsApp funcional (wa.me ou api.whatsapp.com) com o número do briefing e o código 55',
  '<html> com lang="pt-BR"',
  'JSON-LD schema.org de negócio local (LocalBusiness ou subtipo) com endereço e horário de funcionamento',
  'Sem rolagem horizontal nem conteúdo cortado na borda no celular (390px)',
  'Sem erros de JavaScript e sem recursos quebrados (imagens, fontes, CSS)',
  'Fonte display (maior texto da primeira tela) não é genérica nem gasta (listas de 1ª e 2ª ordem de anti-padroes.md) e carregou de fato',
  'Botão/link do WhatsApp visível na primeira tela do celular, sem rolar',
  'Exatamente um <h1> na página',
  'Respeita prefers-reduced-motion quando há animação ou transição',
  'Nenhum dado inventado: sem depoimentos atribuídos a pessoas, números de clientes, notas/estrelas, prêmios ou credenciais fora do briefing',
  "Nenhum CTA vazio ('Saiba mais', 'Comece agora', 'Descubra', 'Clique aqui')",
  'Sem emoji em títulos (h1–h3)',
];

const evals = [
  { id: 1, name: 'padaria-fermento-lenha', extra: [
    'Horário de funcionamento (6h30–19h30, fecha segunda) e das fornadas (7h e 16h) visíveis',
    'Endereço (Rua Mármore, 512) visível',
  ] },
  { id: 2, name: 'oficina-pacheco', extra: [
    'Diferencial do vídeo pelo WhatsApp aparece na primeira tela do desktop',
    'Horários (seg–sex 8h–18h, sáb 8h–12h) e endereço (Av. Brasil, 2150) visíveis',
  ] },
  { id: 3, name: 'odontopediatra-helena', extra: [
    'Registro CRO-PE 12345 visível',
    'Horário (seg–sex 8h–18h) e endereço (Rua das Pernambucanas, 300, sala 804) visíveis',
    'Respeita regras do CFO: sem promessa de resultado, sem antes/depois, sem depoimentos de pacientes inventados',
  ] },
];

const data = JSON.parse(fs.readFileSync(evalsPath, 'utf8'));
for (const e of evals) {
  const p = data.evals.find((x) => x.id === e.id);
  const meta = { eval_id: e.id, eval_name: e.name, prompt: p.prompt, assertions: [...common, ...e.extra] };
  fs.writeFileSync(path.join(iterDir, `eval-${e.name}`, 'eval_metadata.json'), JSON.stringify(meta, null, 2));
  p.assertions = meta.assertions;
}
fs.writeFileSync(evalsPath, JSON.stringify(data, null, 2));
console.log('ok');
