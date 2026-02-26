'use client';

import { useState, useMemo } from 'react';
import { KanbanColumn } from './column';
import { SearchBar } from '@/components/shared/search-bar';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KanbanBoard as KanbanBoardType, TaskStatus, ParaCategory, Priority } from '@/lib/types';

interface KanbanBoardProps {
  initialBoard: KanbanBoardType;
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
  { status: 'blocked', title: 'Blocked' },
];

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [searchQuery, setSearchQuery] = useState('');
  const [paraFilter, setParaFilter] = useState<ParaCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter cards based on search and filters
  const filteredBoard = useMemo(() => {
    const filterCards = (cards: typeof board.columns.todo) => {
      return cards.filter((card) => {
        const matchesSearch =
          searchQuery === '' ||
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPara = paraFilter === 'all' || card.paraCategory === paraFilter;
        const matchesPriority = priorityFilter === 'all' || card.priority === priorityFilter;

        return matchesSearch && matchesPara && matchesPriority;
      });
    };

    return {
      columns: {
        todo: filterCards(board.columns.todo),
        in_progress: filterCards(board.columns.in_progress),
        done: filterCards(board.columns.done),
        blocked: filterCards(board.columns.blocked),
      },
    };
  }, [board, searchQuery, paraFilter, priorityFilter]);

  const handleMoveCard = (cardId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    setBoard((prev) => {
      const fromColumn = [...prev.columns[fromStatus]];
      const toColumn = [...prev.columns[toStatus]];

      const cardIndex = fromColumn.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = fromColumn.splice(cardIndex, 1);
      card.status = toStatus;
      card.daysInColumn = 0;
      toColumn.push(card);

      return {
        columns: {
          ...prev.columns,
          [fromStatus]: fromColumn,
          [toStatus]: toColumn,
        },
      };
    });
  };

  const handleAddCard = () => {
    // In real implementation, this would open a modal or form
    console.log('Add card clicked');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tasks..."
          className="w-64"
        />

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border',
            'text-sm font-medium transition-colors',
            showFilters
              ? 'bg-dark-card border-brand-cyan text-brand-cyan'
              : 'bg-dark-card border-dark-border text-text-secondary hover:text-text-primary'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-lg bg-dark-card border border-dark-border">
          {/* PARA Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">PARA:</span>
            {(['all', 'projects', 'areas', 'resources'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setParaFilter(cat)}
                className={cn(
                  'px-2 py-1 rounded text-xs capitalize',
                  paraFilter === cat
                    ? 'bg-brand-cyan/20 text-brand-cyan'
                    : 'bg-dark-bg text-text-secondary hover:text-text-primary'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Priority:</span>
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((pri) => (
              <button
                key={pri}
                onClick={() => setPriorityFilter(pri)}
                className={cn(
                  'px-2 py-1 rounded text-xs capitalize',
                  priorityFilter === pri
                    ? 'bg-brand-purple/20 text-brand-purple'
                    : 'bg-dark-bg text-text-secondary hover:text-text-primary'
                )}
              >
                {pri}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 pb-4 min-w-max">
          {columns.map(({ status, title }) => (
            <KanbanColumn
              key={status}
              title={title}
              status={status}
              cards={filteredBoard.columns[status]}
              onAddCard={status === 'todo' ? handleAddCard : undefined}
              onMoveCard={handleMoveCard}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
