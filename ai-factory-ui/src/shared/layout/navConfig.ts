import { Images, LayoutDashboard, Library, Settings2, WandSparkles } from 'lucide-react';

export const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate', icon: WandSparkles },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

export const pageTitles: Record<string, string> = {
  '/': 'System Dashboard',
  '/generate': 'Generation Console',
  '/library': 'Library Manager',
  '/gallery': 'Results Gallery',
  '/settings': 'Settings',
};
