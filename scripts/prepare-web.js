const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');
const required = ['index.html', 'css', 'js', 'images', 'audio'];

for (const item of required) {
  if (!fs.existsSync(path.join(root, item))) {
    throw new Error('Required project item is missing: ' + item);
  }
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const item of required) {
  fs.cpSync(path.join(root, item), path.join(out, item), { recursive: true });
}

console.log('LiLiAi V70 web assets copied to www/.');
