const fs = require('fs');
const path = require('path');

const dir = 'src/components/dashboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-client.tsx'));

const oldAside = 'aside className="hidden w-[260px] shrink-0 bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col"';
const oldAsideOverview = 'aside className="hidden w-[260px] shrink-0 overflow-y-auto bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col"';

const newAside = 'aside className="hidden w-[260px] shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col"';

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(oldAside, newAside);
  content = content.replace(oldAsideOverview, newAside);
  fs.writeFileSync(p, content);
});
console.log('Fixed aside tags');
