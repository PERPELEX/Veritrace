const fs = require('fs');
const path = require('path');

const dir = 'src/components/dashboard';
const targetFiles = [
  'about-client.tsx',
  'cluster-client.tsx',
  'overview-client.tsx',
  'powerbi-client.tsx',
  'search-client.tsx',
  'sentiment-client.tsx',
  'settings-client.tsx',
  'trend-client.tsx'
];

targetFiles.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf8');

  // Add import if missing
  if (!content.includes('DashboardSidebar')) {
    content = content.replace(/(import .* from ".*";\n)/, '$1import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";\n');
  }

  // Replace <aside> ... </aside>
  content = content.replace(/<aside\b[^>]*className="hidden w-\[260px\][^"]*"[\s\S]*?<\/aside>/, '<DashboardSidebar fullName={fullName} />');

  // Replace <nav classname="... lg:hidden"> ... </nav>
  content = content.replace(/<nav\b[^>]*className="[^"]*lg:hidden[^"]*"[\s\S]*?<\/nav>/, '<DashboardMobileNav />');

  // Remove some unused icons to prevent eslint warnings
  // ChartBarSquareIcon, GlobeAltIcon, MagnifyingGlassIcon, ComputerDesktopIcon, ChartPieIcon, Squares2X2Icon, ClockIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon
  // They might be used in the actual page if they are imported elsewhere, but it's okay for now.

  fs.writeFileSync(p, content);
  console.log(`Updated ${f}`);
});
