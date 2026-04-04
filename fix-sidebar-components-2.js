const fs = require('fs');
const path = require('path');

const dir = 'src/components/dashboard';
const targetFiles = [
  'about-client.tsx',
  'cluster-client.tsx',
  'powerbi-client.tsx',
  'search-client.tsx',
  'sentiment-client.tsx',
  'settings-client.tsx',
  'trend-client.tsx' // Add trend-client.tsx back since it didn't update previously
];

targetFiles.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) {
      console.log('Skipping ' + f);
      return;
  }
  
  let content = fs.readFileSync(p, 'utf8');

  // Add import if missing
  if (!content.includes('DashboardSidebar')) {
    content = content.replace(/(import .* from ".*";\n)/, '$1import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";\n');
  }

  // Replace <aside> ... </aside>
  content = content.replace(/<aside [^>]*className="hidden [^>]+>[\s\S]*?<\/aside>/i, '<DashboardSidebar fullName={fullName} />');

  // Replace <nav classname="... lg:hidden"> ... </nav>
  // We notice the <nav> doesn't just match <nav className="...">, it might be split across lines.
  content = content.replace(/<nav[^>]*lg:hidden[\s\S]*?<\/nav>/i, '<DashboardMobileNav />');

  fs.writeFileSync(p, content);
  console.log(`Updated ${f}`);
});

// Fix admin files to not pass role
['admin-add-user-client.tsx', 'admin-users-client.tsx'].forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/<DashboardSidebar fullName=\{fullName\} role=\{role\} \/>/g, '<DashboardSidebar fullName={fullName} />');
  content = content.replace(/<DashboardMobileNav role=\{role\} \/>/g, '<DashboardMobileNav />');
  fs.writeFileSync(p, content);
  console.log(`Updated admin file ${f}`);
});
