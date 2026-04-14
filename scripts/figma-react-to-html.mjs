/**
 * Converts Figma MCP get_design_context React snippet (saved as .txt) to static HTML.
 * Usage: node figma-react-to-html.mjs <input.txt> <output.html> [wrapperClass]
 */
import fs from 'fs';

const [,, inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Usage: node figma-react-to-html.mjs <input.txt> <output.html>');
  process.exit(1);
}

let s = fs.readFileSync(inPath, 'utf8');
const urls = {};
for (const m of s.matchAll(/const (img\w+) = "(https:\/\/[^"]+)"/g)) {
  urls[m[1]] = m[2];
}

const ret = s.indexOf('return (');
if (ret === -1) {
  console.error('No return ( found');
  process.exit(1);
}
const openParen = ret + 'return '.length; // points at '('
let depth = 0;
let end = -1;
for (let i = openParen; i < s.length; i++) {
  const ch = s[i];
  if (ch === '(') depth++;
  else if (ch === ')') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
if (end === -1) {
  console.error('Could not find closing paren for return (');
  process.exit(1);
}

let jsx = s.slice(openParen + 1, end).trim();

jsx = jsx.replace(/className=/g, 'class=');
for (const [k, v] of Object.entries(urls)) {
  jsx = jsx.replaceAll(`src={${k}}`, `src="${v}"`);
}

// style={{ maskImage: `url('${imgRectangle1}')` }}  (optional, multiline)
jsx = jsx.replace(
  /style=\{\{\s*maskImage:\s*`url\('\$\{(\w+)\}'\)`\s*\}\}/gs,
  (_, name) => `style="mask-image:url('${urls[name] || ''}');"`,
);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>html,body{margin:0;padding:0;}</style>
</head>
<body>
<div class="h-[188px] w-[262px] overflow-hidden bg-gradient-to-b from-[#bfd3ff] to-[#588bff]">
${jsx}
</div>
</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log('Wrote', outPath, Object.keys(urls).length, 'asset vars');
