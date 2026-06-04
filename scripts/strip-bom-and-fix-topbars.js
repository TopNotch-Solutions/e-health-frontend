/**
 * Strip UTF-8 BOM from src files and ensure topbars use TopbarSignOutButton only.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function readUtf8(filePath) {
  let buf = fs.readFileSync(filePath);
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    buf = buf.slice(3);
  }
  return buf.toString('utf8').replace(/^\uFEFF/, '');
}

function writeUtf8NoBom(filePath, content) {
  fs.writeFileSync(filePath, content.replace(/^\uFEFF/, ''), { encoding: 'utf8' });
}

let bomCount = 0;
for (const file of walk(SRC)) {
  if (!/\.(jsx?|tsx?|css)$/.test(file)) continue;
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    writeUtf8NoBom(file, readUtf8(file));
    bomCount += 1;
    console.log('BOM stripped:', path.relative(SRC, file));
  }
}

const topbars = walk(SRC).filter((f) => f.endsWith('Topbar.jsx'));
let fixed = 0;

for (const filePath of topbars) {
  let content = readUtf8(filePath);
  const before = content;

  content = content.replace(/import \{ useConfirmSignOut \} from '[^']+';\r?\n/g, '');
  content = content.replace(/import \{ performSignOut \} from '[^']+';\r?\n/g, '');
  content = content.replace(
    /import \{ useNavigate(?:, ([^}]+))? \} from 'react-router-dom';\r?\n/g,
    (m, rest) => {
      if (rest && rest.includes('NavLink')) {
        const parts = rest.split(',').map((s) => s.trim()).filter((p) => p && p !== 'useNavigate');
        return parts.length
          ? `import { ${parts.join(', ')} } from 'react-router-dom';\n`
          : `import { NavLink } from 'react-router-dom';\n`;
      }
      return '';
    }
  );
  content = content.replace(/\n\s*const navigate = useNavigate\(\);\r?\n/g, '\n');
  content = content.replace(/\n\s*const handleSignOut = useConfirmSignOut\([^)]*\);\r?\n/g, '\n');
  content = content.replace(
    /\n\s*const handleSignOut = \(\) => performSignOut\(navigate, [^)]*\);\r?\n/g,
    '\n'
  );

  if (!content.includes('TopbarSignOutButton')) {
    const rel = path
      .relative(path.dirname(filePath), path.join(SRC, 'components', 'TopbarSignOutButton.jsx'))
      .replace(/\\/g, '/')
      .replace(/\.jsx$/, '');
    const importPath = rel.startsWith('.') ? rel : `./${rel}`;
    const firstNl = content.indexOf('\n', content.indexOf('import '));
    content = `${content.slice(0, firstNl + 1)}import TopbarSignOutButton from '${importPath}';\n${content.slice(firstNl + 1)}`;
  }

  content = content.replace(
    /<button type="button" className=\{([^}]+)\} onClick=\{handleSignOut\}>\s*Sign Out\s*<\/button>/g,
    (_, cls) => `<TopbarSignOutButton moduleLabel="Sign out" className={${cls}} />`
  );

  writeUtf8NoBom(filePath, content);
  if (content !== before || content.includes('useConfirmSignOut')) {
    if (content.includes('useConfirmSignOut') || /handleSignOut/.test(content)) {
      console.error('STILL BROKEN:', path.relative(SRC, filePath));
    } else {
      fixed += 1;
      console.log('Rewrote:', path.relative(SRC, filePath));
    }
  }
}

// Ensure TopbarSignOutButton exists
const btnPath = path.join(SRC, 'components', 'TopbarSignOutButton.jsx');
writeUtf8NoBom(btnPath, `import { useNavigate } from 'react-router-dom';
import { performSignOut } from '../utils/performSignOut';

export default function TopbarSignOutButton({ moduleLabel, className, children = 'Sign Out' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={className}
      onClick={() => performSignOut(navigate, moduleLabel)}
    >
      {children}
    </button>
  );
}
`);

console.log(`Done. BOM stripped: ${bomCount}, topbars touched: ${fixed}`);
