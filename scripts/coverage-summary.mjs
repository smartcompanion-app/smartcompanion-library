// Writes a markdown table of each package's coverage to the GitHub job summary,
// read from the json-summary reports `npm run coverage` leaves in
// packages/*/coverage. Prints to stdout outside of Actions.
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';

const metrics = ['lines', 'statements', 'functions', 'branches'];
const rows = [];

const packages = readdirSync('packages').filter(name => existsSync(`packages/${name}/package.json`));

for (const name of packages.sort()) {
  const file = `packages/${name}/coverage/coverage-summary.json`;
  if (!existsSync(file)) {
    rows.push(`| ${name} | ${metrics.map(() => '–').join(' | ')} |`);
    continue;
  }
  const { total } = JSON.parse(readFileSync(file, 'utf8'));
  rows.push(`| ${name} | ${metrics.map(metric => `${total[metric].pct}%`).join(' | ')} |`);
}

const table = ['## Coverage', '', `| Package | ${metrics.join(' | ')} |`, `| --- | ${metrics.map(() => '---:').join(' | ')} |`, ...rows, ''].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${table}\n`);
} else {
  console.log(table);
}
