'use client';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType, BuildPhase } from '@/lib/types';
import type { ReactNode } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

const phaseLabels: Record<BuildPhase, string> = {
  researching: 'Researching',
  planning: 'Planning',
  coding: 'Coding',
  testing: 'Testing',
  deploying: 'Deploying',
  complete: 'Complete',
};

const phaseColors: Record<BuildPhase, string> = {
  researching: 'bg-brand-sky/15 text-brand-sky border-brand-sky/30',
  planning: 'bg-brand-purple/15 text-brand-purple border-brand-purple/30',
  coding: 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30',
  testing: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  deploying: 'bg-status-success/15 text-status-success border-status-success/30',
  complete: 'bg-status-success/15 text-status-success border-status-success/30',
};

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const matches = Array.from(text.matchAll(/(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g));
  let lastIndex = 0;

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const matchIndex = m.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    if (m[2]) {
      parts.push(
        <strong key={`b-${i}`} className="font-semibold text-text-primary">
          {m[2]}
        </strong>
      );
    } else if (m[3]) {
      parts.push(<em key={`i-${i}`}>{m[3]}</em>);
    } else if (m[4]) {
      parts.push(
        <code
          key={`c-${i}`}
          className="px-1 py-0.5 rounded bg-dark-bg font-mono text-[0.85em] text-brand-cyan"
        >
          {m[4]}
        </code>
      );
    }

    lastIndex = matchIndex + m[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function renderContent(content: string) {
  const lines = content.split('\n');

  return lines.map((line, i) => {
    if (line === '') {
      return <br key={i} />;
    }

    if (line.startsWith('# ')) {
      return (
        <span key={i} className="block text-lg font-bold text-text-primary">
          {parseInline(line.slice(2))}
        </span>
      );
    }

    if (line.startsWith('## ')) {
      return (
        <span key={i} className="block text-base font-semibold text-text-primary">
          {parseInline(line.slice(3))}
        </span>
      );
    }

    if (line.startsWith('- ')) {
      return (
        <span key={i} className="flex gap-2">
          <span className="text-text-muted">•</span>
          <span>{parseInline(line.slice(2))}</span>
        </span>
      );
    }

    return (
      <span key={i} className="block">
        {parseInline(line)}
      </span>
    );
  });
}

function StatusIcon({ status }: { status?: ChatMessageType['status'] }) {
  if (!status) return null;

  switch (status) {
    case 'sending':
      return <Loader2 className="w-3 h-3 text-text-muted animate-spin" />;
    case 'sent':
      return <Check className="w-3 h-3 text-text-muted" />;
    case 'error':
      return <AlertCircle className="w-3 h-3 text-status-error" />;
    default:
      return null;
  }
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
        className
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-dark-border mt-1">
          <img
            src="/pace-avatar.png"
            alt="Pace"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'top center' }}
            draggable={false}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-cyan/15 border border-brand-cyan/20 text-text-primary rounded-br-md'
              : 'bg-dark-card border border-dark-border text-text-secondary rounded-bl-md'
          )}
        >
          <div className="space-y-0.5">{renderContent(message.content)}</div>

          {message.metadata?.phase && (
            <div className="mt-2 pt-2 border-t border-dark-border/50">
              <span
                className={cn(
                  'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border',
                  phaseColors[message.metadata.phase]
                )}
              >
                {phaseLabels[message.metadata.phase]}
              </span>
            </div>
          )}

          {message.metadata?.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full h-1 rounded-full bg-dark-bg overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-500"
                  style={{ width: `${message.metadata.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 px-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span className="text-[11px] text-text-muted">
            {formatRelativeTime(message.timestamp)}
          </span>
          {isUser && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
