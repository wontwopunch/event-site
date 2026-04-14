/**
 * Extract Figma MCP export (BackgroundBorder card) → only illustration frame 3:4999 subtree.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  process.env.AGENT_TOOLS ||
    'C:\\Users\\MASTER\\.cursor\\projects\\c-Users-MASTER-Desktop-code-sandbox-light-7e62cd2b-1776041677\\agent-tools',
  '05b1c691-9c0e-4eee-a18b-508f67b58832.txt',
);
const dest = path.join(__dirname, 'figma-raw-card5.txt');

const raw = fs.readFileSync(src, 'utf8');
const lines = raw.split(/\r?\n/);

const iStart = lines.findIndex((l) => l.includes('data-node-id="3:4999"'));
const iEnd = lines.findIndex((l, i) => i > iStart && l.includes('data-node-id="3:1088"'));
if (iStart === -1 || iEnd === -1) {
  console.error('markers not found', { iStart, iEnd });
  process.exit(1);
}

const constBlock = lines.filter((line) => /^const img/.test(line));

const inner = lines.slice(iStart, iEnd).join('\n');
const out =
  constBlock.join('\n') +
  `

export default function Frame1707486764() {
  return (
${inner}
  );
}
`;

fs.writeFileSync(dest, out, 'utf8');
console.log('Wrote', dest, 'lines', iStart + 1, '-', iEnd);
