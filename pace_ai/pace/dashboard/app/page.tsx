import { KanbanBoard } from '@/components/kanban/board';
import { mockKanbanBoard } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <div className="h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">PARA Kanban</h1>
          <p className="text-text-secondary mt-1">
            Drag and drop tasks across columns to update status
          </p>
        </div>
      </div>

      <KanbanBoard initialBoard={mockKanbanBoard} />
    </div>
  );
}
