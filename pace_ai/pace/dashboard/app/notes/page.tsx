'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/shared/button';
import { ParaBadge } from '@/components/shared/para-badge';
import { SearchBar } from '@/components/shared/search-bar';
import { mockNotes } from '@/lib/mock-data';
import { Send, Sparkles } from 'lucide-react';
import type { ParaCategory } from '@/lib/types';

export default function NotesPage() {
  const [noteContent, setNoteContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParaCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredNotes = mockNotes.filter(
    (note) =>
      searchQuery === '' ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!noteContent.trim()) return;

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNoteContent('');
    setSelectedCategory(null);
    setIsSending(false);
  };

  const quickPrefixes = [
    { label: 'Research:', prefix: 'Research: ' },
    { label: 'Task:', prefix: 'Task: ' },
    { label: 'Idea:', prefix: 'Idea: ' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notes Panel</h1>
          <p className="text-text-secondary mt-1">
            Drop notes, ideas, or tasks for Pace to pick up
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Note Input */}
        <div className="p-6 rounded-lg bg-dark-card border border-dark-border">
          <h2 className="text-lg font-semibold text-text-primary mb-4">New Note</h2>

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Drop a note, idea, or task for Pace..."
            className={cn(
              'w-full h-32 p-4 rounded-lg resize-none',
              'bg-dark-bg border border-dark-border',
              'text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan'
            )}
          />

          {/* Quick Prefixes */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-text-muted">Quick:</span>
            {quickPrefixes.map((item) => (
              <button
                key={item.label}
                onClick={() =>
                  setNoteContent(item.prefix + noteContent.replace(/^(Research:|Task:|Idea:)\s*/i, ''))
                }
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  'bg-dark-bg border border-dark-border',
                  'text-text-secondary hover:text-text-primary hover:border-brand-cyan/50',
                  'transition-colors'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* PARA Category Selection */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-text-muted">Category:</span>
            {(['projects', 'areas', 'resources'] as ParaCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={cn(
                  'px-2 py-0.5 rounded text-xs capitalize',
                  selectedCategory === cat
                    ? 'bg-dark-bg border border-brand-cyan text-brand-cyan'
                    : 'bg-dark-bg border border-dark-border text-text-secondary hover:border-dark-border'
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
            className="w-full mt-6"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Pace
          </Button>
        </div>

        {/* Note History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Note History</h2>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notes..."
              className="w-48"
            />
          </div>

          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-dark-card border border-dark-border"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-text-primary">{note.content}</p>
                  {note.paraCategory && <ParaBadge category={note.paraCategory} size="sm" />}
                </div>
                <p className="text-xs text-text-muted">{formatRelativeTime(note.sentAt)}</p>

                {note.paceResponse && (
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="w-3 h-3 text-brand-cyan" />
                      <span className="text-xs text-brand-cyan font-medium">Pace</span>
                    </div>
                    <p className="text-sm text-text-secondary">{note.paceResponse}</p>
                    {note.respondedAt && (
                      <p className="text-xs text-text-muted mt-1">
                        {formatRelativeTime(note.respondedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="flex items-center justify-center h-32 text-text-muted">
                No notes found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
