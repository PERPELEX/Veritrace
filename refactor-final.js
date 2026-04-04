const fs = require('fs');
const path = require('path');

const pages = [
  'src/app/dashboard/trend/page.tsx',
  'src/app/dashboard/powerbi/page.tsx',
  'src/app/dashboard/search/page.tsx',
  'src/app/dashboard/sentiment/page.tsx',
  'src/app/dashboard/about/page.tsx',
  'src/app/dashboard/settings/page.tsx',
  'src/app/dashboard/cluster/page.tsx',
];

pages.forEach(p => {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('role={session.role}')) {
      content = content.replace(/fullName=\{session\.fullName\}/, 'fullName={session.fullName} role={session.role}');
      fs.writeFileSync(p, content);
      console.log('Fixed', p);
    }
  }
});

const clients = [
  'src/components/dashboard/trend-client.tsx',
  'src/components/dashboard/powerbi-client.tsx',
  'src/components/dashboard/search-client.tsx',
  'src/components/dashboard/sentiment-client.tsx',
  'src/components/dashboard/about-client.tsx',
  'src/components/dashboard/settings-client.tsx',
  'src/components/dashboard/cluster-client.tsx',
];

clients.forEach(c => {
  if (fs.existsSync(c)) {
    let content = fs.readFileSync(c, 'utf8');
    if (!content.includes('role: string;')) {
      content = content.replace(/type Props = \{[\s\S]*?fullName: string;/, '$& role: string;');
    }
    
    // update function signature to accept role
    const sigRegex = /export function [A-Za-z]+\(\{ fullName(.*?)\}: Props\)/;
    const match = content.match(sigRegex);
    if (match && !match[0].includes('role')) {
      content = content.replace(sigRegex, (fullMatch, p1) => {
        return fullMatch.replace('fullName', 'fullName, role');
      });
    }

    fs.writeFileSync(c, content);
    console.log('Fixed', c);
  }
});

console.log('Done mapping.');
