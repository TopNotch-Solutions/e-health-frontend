import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const srcRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const brandFile = path.join(srcRoot, 'components', 'brand', 'AppBrand.jsx');

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'node_modules') walk(p, files);
    else if (ent.isFile() && ent.name.endsWith('.jsx')) files.push(p);
  }
  return files;
}

const re = /<span className=\{([^}]+)\}>E-Health Management system<\/span>/g;
let count = 0;

for (const file of walk(srcRoot)) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('E-Health Management system')) continue;
  re.lastIndex = 0;
  if (!re.test(src)) continue;
  re.lastIndex = 0;
  const newSrc = src.replace(re, '<AppBrand className={$1} />');
  if (newSrc === src) continue;

  let output = newSrc;
  if (!output.includes("import AppBrand")) {
    let rel = path.relative(path.dirname(file), brandFile).replace(/\\/g, '/').replace(/\.jsx$/, '');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    const imp = `import AppBrand from '${rel}';`;
    const lines = output.split('\n');
    const lastImport = lines.reduce((idx, line, i) => (line.startsWith('import ') ? i : idx), 0);
    lines.splice(lastImport + 1, 0, imp);
    output = lines.join('\n');
  }
  fs.writeFileSync(file, output);
  count += 1;
}

console.log(`Updated ${count} files`);
