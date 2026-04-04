const fs = require('fs');
const path = require('path');
const dirs = ['about', 'cluster', 'powerbi', 'search', 'sentiment', 'settings', 'trend', ''];
dirs.forEach(d => {
  const p = d ? path.join('src/app/dashboard', d, 'page.tsx') : 'src/app/dashboard/page.tsx';
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('role={session.role}')) {
    content = content.replace(/fullName={session\.fullName}/, 'fullName={session.fullName}\n      role={session.role}');
  }
  fs.writeFileSync(p, content);
});
console.log('Pages updated');
