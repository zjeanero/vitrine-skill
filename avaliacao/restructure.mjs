// Move <eval>/<config>/{outputs,timing.json} para <eval>/<config>/run-1/ e copia o eval_metadata.json,
// no layout que o aggregate_benchmark.py e o generate_review.py esperam.
// Uso: node restructure.mjs <pasta-iteration>
import { readdirSync, statSync, existsSync, mkdirSync, renameSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const iterDir = process.argv[2];
for (const evalDir of readdirSync(iterDir).filter((d) => d.startsWith('eval-'))) {
  const evalPath = join(iterDir, evalDir);
  for (const config of readdirSync(evalPath).filter((d) => statSync(join(evalPath, d)).isDirectory())) {
    const configPath = join(evalPath, config);
    const runPath = join(configPath, 'run-1');
    if (existsSync(runPath)) continue;
    mkdirSync(runPath);
    for (const item of ['outputs', 'timing.json', 'review']) {
      if (existsSync(join(configPath, item))) renameSync(join(configPath, item), join(runPath, item));
    }
    copyFileSync(join(evalPath, 'eval_metadata.json'), join(runPath, 'eval_metadata.json'));
    console.log(`${evalDir}/${config} -> run-1`);
  }
}
