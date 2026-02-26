// PARA Categories
export type ParaCategory = 'projects' | 'areas' | 'resources' | 'archives';

// Task/Card Status
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

// Priority Levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Kanban Card
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  paraCategory: ParaCategory;
  priority: Priority;
  projectSlug?: string;
  areaSlug?: string;
  daysInColumn: number;
  createdAt: string;
  updatedAt: string;
}

// Kanban Board State
export interface KanbanBoard {
  columns: {
    todo: KanbanCard[];
    in_progress: KanbanCard[];
    done: KanbanCard[];
    blocked: KanbanCard[];
  };
}

// Activity Entry
export interface ActivityEntry {
  id: string;
  timestamp: string;
  action: ActivityAction;
  description: string;
  paraCategory?: ParaCategory;
  duration?: number; // in milliseconds
  details?: {
    filesModified?: string[];
    outputSummary?: string;
    metadata?: Record<string, unknown>;
  };
}

export type ActivityAction =
  | 'task_created'
  | 'task_completed'
  | 'task_moved'
  | 'research_started'
  | 'research_completed'
  | 'note_received'
  | 'heartbeat'
  | 'skill_executed'
  | 'error'
  | 'briefing_sent';

// Project
export interface Project {
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'blocked' | 'paused' | 'archived';
  progress: number; // 0-100
  lastActivity: string;
  topBlocker?: string;
  architectureNotes?: string;
  metrics?: Record<string, number>;
  tasks: KanbanCard[];
  timeline?: TimelineEvent[];
  relatedParaItems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

// Note
export interface Note {
  id: string;
  content: string;
  paraCategory?: ParaCategory;
  sentAt: string;
  paceResponse?: string;
  respondedAt?: string;
}

// Research Entry
export interface ResearchEntry {
  id: string;
  topic: string;
  content: string;
  sources: ResearchSource[];
  keyFindings: string[];
  paraTags: ParaCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource {
  url: string;
  title: string;
  type: 'article' | 'video' | 'paper' | 'documentation' | 'other';
  fetchedAt: string;
}

// Agent Status
export type AgentState = 'idle' | 'thinking' | 'running_subagent' | 'error';

export interface AgentStatus {
  state: AgentState;
  lastHeartbeat: string;
  currentTask?: string;
  uptime: number; // in seconds
  tasksCompletedToday: number;
  nextTrigger?: string;
  modelUsage: {
    sonnetCalls: number;
    opusCalls: number;
  };
}

// Analytics Data
export interface AnalyticsData {
  taskThroughput: DailyMetric[];
  paraDistribution: ParaDistribution;
  projectVelocity: ProjectVelocityData[];
  skillsRadar: SkillLevel[];
  fitnessTrends: FitnessMetric[];
  learningProgress: LearningItem[];
  researchOutput: ResearchMetric[];
}

export interface DailyMetric {
  date: string;
  count: number;
}

export interface ParaDistribution {
  projects: number;
  areas: number;
  resources: number;
}

export interface ProjectVelocityData {
  projectSlug: string;
  projectName: string;
  data: DailyMetric[];
}

export interface SkillLevel {
  skill: string;
  level: number; // 0-100
}

export interface FitnessMetric {
  date: string;
  workouts: number;
  runningDistance: number; // km
}

export interface LearningItem {
  topic: string;
  progress: number; // 0-100
}

export interface ResearchMetric {
  topic: string;
  data: DailyMetric[];
}

// Focus Planner
export interface FocusPlan {
  todayTasks: FocusTask[];
  weeklyPriorities: FocusTask[];
  generatedAt: string;
}

export interface FocusTask {
  id: string;
  title: string;
  reasoning: string;
  paraCategory: ParaCategory;
  priority: number; // 1 = highest
  estimatedDuration?: string;
  relatedProject?: string;
}

// WebSocket Events
export type WSEventType =
  | 'activity'
  | 'kanban_update'
  | 'status_update'
  | 'heartbeat'
  | 'note_response';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// Chat Types
export type ChatRole = 'user' | 'pace';

export type BuildPhase = 'researching' | 'planning' | 'coding' | 'testing' | 'deploying' | 'complete';

export type BuildPhaseStatus = 'pending' | 'active' | 'complete' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    projectName?: string;
    phase?: BuildPhase;
    progress?: number;
    repoUrl?: string;
    buildId?: string;
  };
}

export interface ProjectBuild {
  id: string;
  projectName: string;
  description: string;
  phases: {
    phase: BuildPhase;
    status: BuildPhaseStatus;
    startedAt?: string;
    completedAt?: string;
    output?: string;
  }[];
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}
