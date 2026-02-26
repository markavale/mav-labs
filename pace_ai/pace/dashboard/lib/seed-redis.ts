import { getRedis, set, addToStream } from './redis';
import type { KanbanBoard, AgentStatus, AnalyticsData, FocusPlan } from './types';

const KANBAN_KEY = 'pace:kanban:board';
const STATUS_KEY = 'pace:status';
const PROJECTS_KEY = 'pace:projects';
const RESEARCH_KEY = 'pace:research:results';
const ANALYTICS_KEY = 'pace:analytics';
const FOCUS_KEY = 'pace:focus';
const ACTIVITY_STREAM_KEY = 'pace:stream:activity';

/**
 * Seeds Redis with initial data if no data exists yet.
 * Checks for pace:kanban:board as the sentinel key.
 */
export async function seedRedisIfEmpty(): Promise<void> {
  const redis = getRedis();
  const exists = await redis.exists(KANBAN_KEY);

  if (exists) {
    console.log('[seed-redis] pace:kanban:board already exists, skipping seed');
    return;
  }

  console.log('[seed-redis] Seeding Redis with initial data...');

  const kanbanBoard: KanbanBoard = {
    columns: {
      todo: [],
      in_progress: [],
      done: [],
      blocked: [],
    },
  };
  await set(KANBAN_KEY, kanbanBoard);
  console.log('[seed-redis] Set pace:kanban:board');

  const agentStatus: AgentStatus = {
    state: 'idle',
    lastHeartbeat: new Date().toISOString(),
    uptime: 0,
    tasksCompletedToday: 0,
    modelUsage: { sonnetCalls: 0, opusCalls: 0 },
  };
  await set(STATUS_KEY, agentStatus);
  console.log('[seed-redis] Set pace:status');

  await set(PROJECTS_KEY, []);
  console.log('[seed-redis] Set pace:projects');

  await set(RESEARCH_KEY, []);
  console.log('[seed-redis] Set pace:research:results');

  const analytics: AnalyticsData = {
    taskThroughput: [],
    paraDistribution: { projects: 0, areas: 0, resources: 0 },
    projectVelocity: [],
    skillsRadar: [],
    fitnessTrends: [],
    learningProgress: [],
    researchOutput: [],
  };
  await set(ANALYTICS_KEY, analytics);
  console.log('[seed-redis] Set pace:analytics');

  const focusPlan: FocusPlan = {
    todayTasks: [],
    weeklyPriorities: [],
    generatedAt: new Date().toISOString(),
  };
  await set(FOCUS_KEY, focusPlan);
  console.log('[seed-redis] Set pace:focus');

  const now = new Date().toISOString();
  await addToStream(ACTIVITY_STREAM_KEY, {
    action: 'heartbeat',
    description: 'Pace dashboard initialized',
    timestamp: now,
    type: 'system_init',
  });
  await addToStream(ACTIVITY_STREAM_KEY, {
    action: 'heartbeat',
    description: 'Redis seed completed',
    timestamp: now,
    type: 'system_init',
  });
  await addToStream(ACTIVITY_STREAM_KEY, {
    action: 'heartbeat',
    description: 'Ready to receive tasks',
    timestamp: now,
    type: 'system_init',
  });
  console.log('[seed-redis] Added 3 activity stream entries');

  console.log('[seed-redis] Seed complete');
}
