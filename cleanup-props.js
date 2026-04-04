const fs = require('fs');
const path = require('path');

const updateDir = (directory, fileSuffix, replaceRules) => {
  if (!fs.existsSync(directory)) return;
  const items = fs.readdirSync(directory);
  items.forEach(item => {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      updateDir(fullPath, fileSuffix, replaceRules);
    } else if (fullPath.endsWith(fileSuffix)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      replaceRules.forEach(rule => {
        content = content.replace(rule.search, rule.replace);
      });
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Cleaned', fullPath);
      }
    }
  });
};

// 1. Clean page.tsx
updateDir('src/app/dashboard', 'page.tsx', [
  { search: / role=\{session\.role\}/g, replace: '' },
  { search: /\n\s*role=\{session\.role\}/g, replace: '' }
]);

// 2. Clean *-client.tsx
updateDir('src/components/dashboard', '-client.tsx', [
  // Remove role property passed to DashboardSidebar and DashboardMobileNav
  { search: /<DashboardSidebar fullName=\{fullName\} role=\{role\} \/>/g, replace: '<DashboardSidebar fullName={fullName} />' },
  { search: /<DashboardMobileNav role=\{role\} \/>/g, replace: '<DashboardMobileNav />' },
  // Remove role from function signature export function X({ fullName, role...
  { search: /export function ([A-Za-z]+)\(\{\s*fullName,\s*role(.*?)\}\:\s*Props\)/g, replace: 'export function $1({ fullName$2 }: Props)' },
  // Remove role from Props 
  { search: /\n\s*role:\s*string;/g, replace: '' },
]);
