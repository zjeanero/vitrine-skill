// Corrige as runs de uma iteração.
// Uso: node grade.mjs <pasta-iteration> [--skip-shots]
// - Roda review.mjs em cada site (salva em <run>/review/), copia prints para outputs/.
// - Avalia as assertions automáticas e mescla as manuais de <iteration>/manual.json, se existir.
// - Escreve <run>/grading.json e <run>/review/texto.txt (texto visível, para revisão manual).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [iterDir, ...rest] = process.argv.slice(2);
const skipShots = rest.includes('--skip-shots');
const manualPath = join(iterDir, 'manual.json');
const manual = existsSync(manualPath) ? JSON.parse(readFileSync(manualPath, 'utf8')) : {};

const GENERIC = ['inter', 'roboto', 'poppins', 'montserrat', 'open sans', 'lato', 'arial', 'helvetica', 'system-ui', '-apple-system', 'sans-serif', 'serif', 'dm sans', 'plus jakarta sans', 'manrope', 'outfit', 'sora', 'urbanist', 'figtree', 'geist', 'segoe ui'];
const LOCAL_TYPES = ['LocalBusiness', 'Bakery', 'CafeOrCoffeeShop', 'Restaurant', 'FoodEstablishment', 'AutoRepair', 'AutomotiveBusiness', 'AutoBodyShop', 'Dentist', 'MedicalBusiness', 'MedicalClinic', 'Physician', 'HealthAndBeautyBusiness', 'Store', 'ProfessionalService', 'HomeAndConstructionBusiness'];
const PHONES = { 'padaria-fermento-lenha': '5531988774410', 'oficina-pacheco': '5519997123088', 'odontopediatra-helena': '5581996542210' };

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'screenshots', 'review', '.git'].includes(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function findIndex(outputs) {
  if (existsSync(join(outputs, 'index.html'))) return join(outputs, 'index.html');
  const files = walk(outputs).filter((f) => /index\.(html|php)$/i.test(f));
  return files.sort((a, b) => a.length - b.length)[0] || null;
}

function stripTags(s) {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function gradeRun(evalName, assertions, runDir, config) {
  const outputs = join(runDir, 'outputs');
  const index = existsSync(outputs) ? findIndex(outputs) : null;
  const exp = [];
  const add = (text, passed, evidence) => exp.push({ text, passed: Boolean(passed), evidence });
  if (!index) {
    for (const a of assertions) add(a, false, 'Nenhum index.html encontrado em outputs/.');
    return exp;
  }

  const reviewDir = join(runDir, 'review');
  if (!skipShots || !existsSync(join(reviewDir, 'report.json'))) {
    const r = spawnSync(process.execPath, [join(here, 'review.mjs'), index, reviewDir, '--wait=2500', '--slices=12'], { encoding: 'utf8' });
    process.stdout.write(`[${evalName}/${runDir.split(/[\\/]/).pop()}] ${r.stdout}${r.stderr}`);
  }
  const report = JSON.parse(readFileSync(join(reviewDir, 'report.json'), 'utf8'));
  const D = report.results.desktop;
  const M = report.results.mobile;

  // Prints para a tela de comparação (direto em outputs/).
  const copies = [
    ['desktop-01.png', '1-desktop-primeira-tela.png'],
    ['mobile-01.png', '2-celular-primeira-tela.png'],
    ['desktop-full.jpg', '3-desktop-pagina-inteira.jpg'],
    ['mobile-full.jpg', '4-celular-pagina-inteira.jpg'],
  ];
  for (const [from, to] of copies) if (existsSync(join(reviewDir, from))) copyFileSync(join(reviewDir, from), join(outputs, to));

  // Fontes do site: HTML + CSS + JS locais.
  const siteFiles = walk(dirname(index)).filter((f) => ['.html', '.php', '.css', '.js', '.mjs'].includes(extname(f).toLowerCase()));
  const html = readFileSync(index, 'utf8');
  const all = siteFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
  const body = D.extra?.bodyText || stripTags(html);
  const nbody = norm(body);
  writeFileSync(join(reviewDir, 'texto.txt'), body);

  for (const a of assertions) {
    const key = norm(a);
    if (key.startsWith('link de whatsapp')) {
      const hrefs = [...all.matchAll(/(?:wa\.me\/|whatsapp\.com\/send\/?\?phone=)(\+?\d+)/gi)].map((m) => m[1].replace('+', ''));
      const ok = hrefs.includes(PHONES[evalName]);
      add(a, ok, hrefs.length ? `Números nos links: ${[...new Set(hrefs)].join(', ')} (esperado ${PHONES[evalName]})` : 'Nenhum link de WhatsApp encontrado.');
    } else if (key.startsWith('<html> com lang')) {
      const m = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
      add(a, m && m[1].toLowerCase() === 'pt-br', m ? `lang="${m[1]}"` : 'Sem atributo lang.');
    } else if (key.startsWith('json-ld')) {
      const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
      let found = null;
      const types = [];
      for (const b of blocks) {
        try {
          const j = JSON.parse(b);
          const items = [].concat(j['@graph'] || j);
          for (const it of items) {
            const t = [].concat(it['@type'] || []);
            types.push(...t);
            if (t.some((x) => LOCAL_TYPES.includes(x)) && it.address && (it.openingHoursSpecification || it.openingHours)) found = t.join('/');
          }
        } catch (e) {
          types.push('(JSON inválido)');
        }
      }
      add(a, found, blocks.length ? `Tipos: ${types.join(', ') || '(nenhum)'}${found ? ` — ${found} com endereço e horário` : ' — falta tipo local, endereço ou horário'}` : 'Nenhum bloco JSON-LD.');
    } else if (key.startsWith('sem rolagem horizontal')) {
      const L = M.layout || {};
      add(a, L.overflowX === false, L.overflowX ? `scrollWidth ${L.scrollWidth}px > ${L.clientWidth}px: ${(L.overflowingElements || []).join('; ')}` : `scrollWidth ${L.scrollWidth}px = viewport ${L.clientWidth}px`);
    } else if (key.startsWith('sem erros de javascript')) {
      const errs = [...new Set([...(D.errors || []), ...(M.errors || [])])];
      const fails = [...new Set([...(D.failedRequests || []), ...(M.failedRequests || [])])];
      add(a, errs.length === 0 && fails.length === 0, errs.length || fails.length ? `Erros: ${errs.join(' | ') || 'nenhum'}; recursos: ${fails.join(' | ') || 'nenhum'}` : 'Nenhum erro de JS nem recurso com falha (desktop e celular).');
    } else if (key.startsWith('fonte do titulo principal')) {
      const fam = D.extra?.h1Font || '';
      const first = fam.split(',')[0].trim().replace(/^["']|["']$/g, '');
      const generic = GENERIC.includes(first.toLowerCase());
      const loaded = D.extra?.h1FontLoaded;
      add(a, first && !generic && loaded, first ? `h1 em "${first}" (${generic ? 'genérica' : 'não genérica'}, ${loaded ? 'carregou' : 'NÃO carregou — aparece a fonte reserva'})` : 'Sem h1.');
    } else if (key.startsWith('botao/link do whatsapp visivel')) {
      add(a, M.extra?.waVisibleAboveFold, M.extra?.waVisibleAboveFold ? 'Link de WhatsApp visível em 390×844 sem rolar.' : `Nenhum link de WhatsApp visível na primeira tela do celular. Primeira tela: "${(M.extra?.aboveFoldText || '').slice(0, 200)}"`);
    } else if (key.startsWith('exatamente um <h1>')) {
      add(a, D.extra?.h1Count === 1, `${D.extra?.h1Count} h1 na página${D.extra?.h1Text ? `: "${D.extra.h1Text}"` : ''}`);
    } else if (key.startsWith('respeita prefers-reduced-motion')) {
      const hasMotion = /@keyframes|animation\s*:|transition\s*:|\.animate\(|requestAnimationFrame|animation-timeline/i.test(all);
      const handles = /prefers-reduced-motion/i.test(all);
      add(a, !hasMotion || handles, !hasMotion ? 'Sem animações/transições.' : handles ? 'Há movimento e prefers-reduced-motion é tratado.' : 'Há animação/transição e nenhuma regra prefers-reduced-motion.');
    } else if (key.startsWith('nenhum cta vazio')) {
      const ctas = [...html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => stripTags(m[2]));
      const bad = ctas.filter((t) => /saiba mais|comece agora|descubra|clique aqui/i.test(t));
      add(a, bad.length === 0, bad.length ? `CTAs vazios: ${bad.join(' | ')}` : `${ctas.length} links/botões, nenhum vazio.`);
    } else if (key.startsWith('sem emoji em titulos')) {
      const heads = [...html.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => stripTags(m[2]));
      const bad = heads.filter((t) => /\p{Extended_Pictographic}/u.test(t));
      add(a, bad.length === 0, bad.length ? `Títulos com emoji: ${bad.join(' | ')}` : `${heads.length} títulos sem emoji.`);
    } else if (key.startsWith('horario de funcionamento (6h30')) {
      const ok = /6h30|6:30/.test(nbody) && /19h30|19:30/.test(nbody) && /segunda/.test(nbody) && /\b7h|7:00|07:00|07h/.test(nbody) && /16h|16:00/.test(nbody);
      add(a, ok, `6h30:${/6h30|6:30/.test(nbody)} 19h30:${/19h30|19:30/.test(nbody)} segunda:${/segunda/.test(nbody)} 7h:${/\b7h|7:00|07:00|07h/.test(nbody)} 16h:${/16h|16:00/.test(nbody)}`);
    } else if (key.startsWith('endereco (rua marmore')) {
      add(a, /marmore/.test(nbody) && /512/.test(nbody), `Mármore:${/marmore/.test(nbody)} 512:${/512/.test(nbody)}`);
    } else if (key.startsWith('diferencial do video')) {
      const fold = norm(D.extra?.aboveFoldText || '');
      add(a, /video/.test(fold), `Primeira tela (desktop): "${(D.extra?.aboveFoldText || '').slice(0, 300)}"`);
    } else if (key.startsWith('horarios (seg')) {
      const ok = /8h|8:00|08:00/.test(nbody) && /18h|18:00/.test(nbody) && /12h|12:00|meio-dia|meio dia/.test(nbody) && /sab/.test(nbody) && /brasil/.test(nbody) && /2150|2\.150/.test(nbody);
      add(a, ok, `8h:${/8h|8:00|08:00/.test(nbody)} 18h:${/18h|18:00/.test(nbody)} 12h:${/12h|12:00|meio-dia|meio dia/.test(nbody)} sábado:${/sab/.test(nbody)} Av. Brasil:${/brasil/.test(nbody)} 2150:${/2150|2\.150/.test(nbody)}`);
    } else if (key.startsWith('registro cro-pe')) {
      add(a, /cro[\s-]*pe/.test(nbody) && /12345|12\.345/.test(nbody), `CRO-PE:${/cro[\s-]*pe/.test(nbody)} 12345:${/12345|12\.345/.test(nbody)}`);
    } else if (key.startsWith('horario (seg')) {
      const ok = /8h|8:00|08:00/.test(nbody) && /18h|18:00/.test(nbody) && /pernambucanas/.test(nbody) && /300/.test(nbody) && /804/.test(nbody);
      add(a, ok, `8h:${/8h|8:00|08:00/.test(nbody)} 18h:${/18h|18:00/.test(nbody)} Pernambucanas:${/pernambucanas/.test(nbody)} 300:${/300/.test(nbody)} sala 804:${/804/.test(nbody)}`);
    } else {
      const runId = `${evalName}/${config}`;
      const m = manual[runId]?.[a];
      if (m) add(a, m.passed, m.evidence);
      else exp.push({ text: a, passed: false, evidence: 'PENDENTE: revisão manual' });
    }
  }
  return exp;
}

for (const evalDir of readdirSync(iterDir).filter((d) => d.startsWith('eval-'))) {
  const meta = JSON.parse(readFileSync(join(iterDir, evalDir, 'eval_metadata.json'), 'utf8'));
  for (const config of readdirSync(join(iterDir, evalDir)).filter((d) => statSync(join(iterDir, evalDir, d)).isDirectory())) {
    const configDir = join(iterDir, evalDir, config);
    const runs = readdirSync(configDir).filter((d) => /^run-\d+$/.test(d));
    for (const runDir of runs.length ? runs.map((r) => join(configDir, r)) : [configDir]) {
    const expectations = gradeRun(meta.eval_name, meta.assertions, runDir, config);
    const passed = expectations.filter((e) => e.passed).length;
    const grading = {
      expectations,
      summary: { passed, failed: expectations.length - passed, total: expectations.length, pass_rate: Math.round((passed / expectations.length) * 100) / 100 },
    };
    writeFileSync(join(runDir, 'grading.json'), JSON.stringify(grading, null, 2));
    console.log(`${meta.eval_name}/${config}: ${passed}/${expectations.length}`);
    }
  }
}
