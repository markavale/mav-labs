'use client';

import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared/button';
import { ParaBadge } from '@/components/shared/para-badge';
import { mockNotes } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import type { ParaCategory } from '@/lib/types';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  const [noteContent, setNoteContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParaCategory | null>(null);
  const [isSending, setIsSending] = useState(false);

  const quickPrefixes = [
    { label: 'Research:', prefix: 'Research: ' },
    { label: 'Task:', prefix: 'Task: ' },
    { label: 'Idea:', prefix: 'Idea: ' },
  ];

  const handleSend = async () => {
    if (!noteContent.trim()) return;

    setIsSending(true);
    // In real implementation, this would publish to Redis pace:notes
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNoteContent('');
    setSelectedCategory(null);
    setIsSending(false);
  };

  const handleQuickPrefix = (prefix: string) => {
    setNoteContent(prefix + noteContent.replace(/^(Research:|Task:|Idea:)\s*/i, ''));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-dark-bg border-l border-dark-border z-50',
          'transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              <h2 className="font-semibold text-text-primary">Notes to Pace</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-card text-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Note Input */}
          <div className="p-4 border-b border-dark-border">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Drop a note, idea, or task for Pace..."
              className={cn(
                'w-full h-24 p-3 rounded-lg resize-none',
                'bg-dark-card border border-dark-border',
                'text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan'
              )}
            />

            {/* Quick Prefixes */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickPrefixes.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleQuickPrefix(item.prefix)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    'bg-dark-card border border-dark-border',
                    'text-text-secondary hover:text-text-primary hover:border-brand-cyan/50',
                    'transition-colors'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* PARA Category Selection */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-text-muted">Category:</span>
              {(['projects', 'areas', 'resources'] as ParaCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs capitalize',
                    selectedCategory === cat
                      ? 'bg-dark-card border border-brand-cyan text-brand-cyan'
                      : 'bg-dark-card border border-dark-border text-text-secondary hover:border-dark-border'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!noteContent.trim()}
              isLoading={isSending}
              variant="primary"
              className="w-full mt-4"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Pace
            </Button>
          </div>

          {/* Note History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Recent Notes</h3>
              <div className="space-y-4">
                {mockNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-dark-card border border-dark-border"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-text-primary">{note.content}</p>
                      {note.paraCategory && (
                        <ParaBadge category={note.paraCategory} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      {formatRelativeTime(note.sentAt)}
                    </p>

                    {note.paceResponse && (
                      <div className="mt-3 pt-3 border-t border-dark-border">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-brand-cyan" />
                          <span className="text-xs text-brand-cyan font-medium">Pace</span>
                        </div>
                        <p className="text-sm text-text-secondary">{note.paceResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
