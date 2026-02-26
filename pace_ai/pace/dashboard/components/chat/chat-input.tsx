'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, Zap, Search, MessageCircle } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const quickActions = [
  {
    label: 'Build Project',
    icon: Zap,
    template: 'Build me a project: ',
    color: 'text-brand-purple border-brand-purple/30 hover:bg-brand-purple/10',
  },
  {
    label: 'Research Topic',
    icon: Search,
    template: 'Research the following topic: ',
    color: 'text-brand-sky border-brand-sky/30 hover:bg-brand-sky/10',
  },
  {
    label: 'Ask Pace',
    icon: MessageCircle,
    template: 'Hey Pace, ',
    color: 'text-brand-cyan border-brand-cyan/30 hover:bg-brand-cyan/10',
  },
];

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Message Pace... (e.g., 'Build me a portfolio site')",
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 5;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickAction = useCallback(
    (template: string) => {
      setValue(template);
      setTimeout(() => {
        textareaRef.current?.focus();
        adjustHeight();
      }, 0);
    },
    [adjustHeight]
  );

  const hasText = value.trim().length > 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Quick actions */}
      <div className="flex items-center gap-2 px-1">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => handleQuickAction(action.template)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border',
              'transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
              action.color
            )}
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="relative flex items-end gap-2 rounded-2xl bg-dark-card border border-dark-border p-3 focus-within:border-brand-cyan/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted',
            'resize-none outline-none scrollbar-thin',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ lineHeight: '24px' }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !hasText}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            hasText && !disabled
              ? 'bg-brand-cyan text-dark-bg hover:bg-brand-cyan/80 shadow-lg shadow-brand-cyan/20'
              : 'bg-dark-border/50 text-text-muted cursor-not-allowed'
          )}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
