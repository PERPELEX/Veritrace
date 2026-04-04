const fs = require('fs');
const path = require('path');

const dir = 'src/components/dashboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-client.tsx') && f !== 'admin-users-client.tsx' && f !== 'admin-add-user-client.tsx');

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');

  // Add import
  if (!content.includes('DashboardSidebar')) {
    content = content.replace(/(import .* from ".*";\n)/, '$1import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";\n');
  }

  // Add `role: string;` to Props
  if (content.includes('type Props = {') && !content.includes('role: string')) {
    content = content.replace(/fullName: string;\n/, 'fullName: string;\n  role: string;\n');
  }

  // Update component signature
  const compMatch = content.match(/export function ([A-Za-z]+)\({ fullName(.*?)}: Props\)/);
  if (compMatch && !compMatch[0].includes('role')) {
    content = content.replace(compMatch[0], `export function ${compMatch[1]}({ fullName, role${compMatch[2]} }: Props)`);
  }

  // Replace <aside> ... </aside>
  content = content.replace(/<aside className="hidden w-\[260px\].*?<\/aside>/s, '<DashboardSidebar fullName={fullName} role={role} />');

  // Replace <nav classname="... lg:hidden"> ... </nav>
  // or <nav classname="... lg:hidden"> ... </nav>
  content = content.replace(/<nav className="[^"]*lg:hidden"[^>]*>.*?<\/nav>/s, '<DashboardMobileNav role={role} />');
  
  // Remove unused imports
  content = content.replace(/ArrowRightStartOnRectangleIcon,?\n?/g, '');
  
  fs.writeFileSync(p, content);
});

console.log('Refactoring complete');
