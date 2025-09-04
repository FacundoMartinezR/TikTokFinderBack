// inspect-debug.js
const fs = require('fs');
const p = require('path');
const file = p.join(process.cwd(), 'debug.html');
if (!fs.existsSync(file)) {
  console.error('No existe debug.html en', process.cwd());
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');
const keys = ['SIGI_STATE','ItemModule','playCount','diggCount','commentCount','shareCount','followerCount','og:image','signature'];
for (const k of keys) {
  let idx = html.indexOf(k);
  if (idx === -1) {
    console.log(`${k}: NOT FOUND`);
    continue;
  }
  const start = Math.max(0, idx - 200);
  const end = Math.min(html.length, idx + 200);
  console.log('---', k, 'context ---');
  console.log(html.slice(start, end).replace(/\n/g,'\n'));
  console.log('----------------------------------------\n');
}
