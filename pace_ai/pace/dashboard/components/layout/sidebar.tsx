'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Activity,
  FolderKanban,
  BookOpen,
  BarChart3,
  Target,
  MessageSquarePlus,
  X,
} from 'lucide-react';
import { PaceAvatarStatic } from '@/components/shared/pace-avatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/chat', label: 'Chat with Pace', icon: MessageSquarePlus, color: 'text-brand-cyan' },
  { href: '/', label: 'Kanban', icon: LayoutGrid, color: 'text-para-projects' },
  { href: '/activity', label: 'Activity', icon: Activity, color: 'text-text-secondary' },
  { href: '/projects', label: 'Projects', icon: FolderKanban, color: 'text-para-projects' },
  { href: '/research', label: 'Research', icon: BookOpen, color: 'text-para-resources' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-brand-purple' },
  { href: '/focus', label: 'Focus', icon: Target, color: 'text-status-warning' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 w-64 bg-dark-bg border-r border-dark-border z-40',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-card text-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pace Avatar */}
          <div className="flex flex-col items-center gap-2 py-4 border-b border-dark-border">
            <PaceAvatarStatic size={40} state="idle" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Pace AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-dark-card text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-dark-card/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && item.color)} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* PARA Legend */}
          <div className="p-4 border-t border-dark-border">
            <p className="text-xs text-text-muted mb-3 font-medium">PARA Categories</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-para-projects" />
                <span className="text-xs text-text-secondary">Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-para-areas" />
                <span className="text-xs text-text-secondary">Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-para-resources" />
                <span className="text-xs text-text-secondary">Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-para-archives" />
                <span className="text-xs text-text-secondary">Archives</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
