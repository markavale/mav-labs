'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentStatusIndicator } from '@/components/shared/status-indicator';
import { PaceAvatarStatic } from '@/components/shared/pace-avatar';
import { mockAgentStatus } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  onMenuClick?: () => void;
  onNotesClick?: () => void;
}

export function Header({ onMenuClick, onNotesClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const status = mockAgentStatus;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const navItems = [
    { href: '/chat', label: 'Chat' },
    { href: '/', label: 'Kanban' },
    { href: '/activity', label: 'Activity' },
    { href: '/projects', label: 'Projects' },
    { href: '/research', label: 'Research' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/focus', label: 'Focus' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur border-b border-dark-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-card text-text-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/chat" className="flex items-center gap-2">
            <PaceAvatarStatic
              size={32}
              state={status.state === 'running_subagent' ? 'working' : status.state === 'thinking' ? 'thinking' : status.state === 'error' ? 'error' : 'idle'}
            />
            <span className="font-semibold text-text-primary hidden sm:block">Pace</span>
          </Link>
        </div>

        {/* Center: Navigation (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-dark-card text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-dark-card/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Agent Status + Notes */}
        <div className="flex items-center gap-4">
          {/* Agent Status */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border">
            <AgentStatusIndicator state={status.state} size="sm" />
            <div className="hidden sm:block">
              <p className="text-xs text-text-primary font-medium capitalize">
                {status.state.replace('_', ' ')}
              </p>
              <p className="text-xs text-text-muted">
                {formatRelativeTime(status.lastHeartbeat)}
              </p>
            </div>
          </div>

          {/* Notes Button */}
          <button
            onClick={onNotesClick}
            className="p-2 rounded-lg bg-dark-card border border-dark-border hover:border-brand-cyan/50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-dark-card border border-dark-border hover:border-status-error/50 hover:text-status-error transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
}
