import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderKanban,
  FileQuestion,
  Users,
  Settings,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onNewProject: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'questionnaire', label: 'Questionnaire', icon: FileQuestion },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentView, onNavigate, onNewProject }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">MKQ</span>
              </div>
              <span className="font-display font-bold text-lg">Consulting</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">M</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', collapsed && 'absolute right-2')}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* New Project Button */}
        <div className="p-4">
          <Button
            onClick={onNewProject}
            className={cn('w-full', collapsed && 'px-0')}
            size={collapsed ? 'icon' : 'default'}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>New Project</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              <p>MKQ Consulting</p>
              <p className="opacity-70">Web Development</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
