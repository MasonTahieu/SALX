const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', '.git']);
const files = [];

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
  }
};

walk(root);

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}

console.log(`✅ Syntax hợp lệ: ${files.length} file JavaScript`);
