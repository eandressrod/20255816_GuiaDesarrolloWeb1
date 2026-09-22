const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'dist');
const pages = [];
function walk(dir) { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, item.name); item.isDirectory() ? walk(file) : pages.push(file); } }
walk(root);
const html = pages.filter(file => file.endsWith('.html'));
const broken = [];
for (const file of html) {
  const content = fs.readFileSync(file, 'utf8');
  if (!/<h1[ >]/i.test(content)) broken.push(`${path.relative(root, file)}: no contiene H1`);
  for (const match of content.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(https?:|tel:|mailto:|#)/.test(url)) continue;
    const clean = decodeURIComponent(url.split(/[?#]/)[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean.endsWith('/') ? `${clean}index.html` : clean);
    if (!target.startsWith(root) || !fs.existsSync(target)) broken.push(`${path.relative(root, file)} -> ${url}`);
  }
}
const projectCount = fs.readdirSync(path.join(root, 'proyectos'), { withFileTypes: true }).filter(item => item.isDirectory()).length;
if (!fs.existsSync(path.join(root, 'sitemap.xml'))) broken.push('Falta sitemap.xml');
if (!fs.existsSync(path.join(root, 'robots.txt'))) broken.push('Falta robots.txt');
if (broken.length) { console.error(`Validation failed (${broken.length}):\n${broken.slice(0, 30).join('\n')}`); process.exit(1); }
console.log(`Validation passed: ${html.length} HTML pages, ${projectCount} project routes, and no broken local references.`);
