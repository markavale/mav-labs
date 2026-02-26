import { ActivityFeed } from '@/components/activity/feed';
import { mockActivityFeed } from '@/lib/mock-data';

export default function ActivityPage() {
  return (
    <div className="h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity Feed</h1>
          <p className="text-text-secondary mt-1">
            Real-time log of every action Pace takes
          </p>
        </div>
      </div>

      <ActivityFeed entries={mockActivityFeed} />
    </div>
  );
}
