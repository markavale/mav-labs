import type {
  KanbanBoard,
  ActivityEntry,
  Project,
  Note,
  ResearchEntry,
  AgentStatus,
  AnalyticsData,
  FocusPlan,
} from './types';

// Mock Kanban Board
export const mockKanbanBoard: KanbanBoard = {
  columns: {
    todo: [
      {
        id: '1',
        title: 'Implement RAG pipeline for EchoSight',
        description: 'Build vector search with pgvector and embedding generation',
        status: 'todo',
        paraCategory: 'projects',
        priority: 'high',
        projectSlug: 'echosight',
        daysInColumn: 2,
        createdAt: '2024-02-20T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
      {
        id: '2',
        title: 'Review quarterly investment portfolio',
        description: 'Analyze performance and rebalance if needed',
        status: 'todo',
        paraCategory: 'areas',
        priority: 'medium',
        areaSlug: 'investments',
        daysInColumn: 5,
        createdAt: '2024-02-17T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
      {
        id: '3',
        title: 'Research multi-agent orchestration patterns',
        description: 'Compare LangGraph, CrewAI, and custom solutions',
        status: 'todo',
        paraCategory: 'resources',
        priority: 'medium',
        daysInColumn: 1,
        createdAt: '2024-02-21T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
    ],
    in_progress: [
      {
        id: '4',
        title: 'Build Pace Dashboard',
        description: 'Next.js dashboard for PARA visualization',
        status: 'in_progress',
        paraCategory: 'projects',
        priority: 'urgent',
        projectSlug: 'pace',
        daysInColumn: 3,
        createdAt: '2024-02-19T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
      {
        id: '5',
        title: 'Complete 5K run training week 8',
        description: 'Three runs: tempo, easy, long',
        status: 'in_progress',
        paraCategory: 'areas',
        priority: 'medium',
        areaSlug: 'health-fitness',
        daysInColumn: 4,
        createdAt: '2024-02-18T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
    ],
    done: [
      {
        id: '6',
        title: 'Set up OpenClaw workspace',
        description: 'Configure VPS, install dependencies, create directory structure',
        status: 'done',
        paraCategory: 'projects',
        priority: 'high',
        projectSlug: 'pace',
        daysInColumn: 0,
        createdAt: '2024-02-15T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
      {
        id: '7',
        title: 'Write SOUL.md for Pace identity',
        description: 'Define personality, tone, and behavioral guidelines',
        status: 'done',
        paraCategory: 'projects',
        priority: 'high',
        projectSlug: 'pace',
        daysInColumn: 0,
        createdAt: '2024-02-16T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
    ],
    blocked: [
      {
        id: '8',
        title: 'Deploy EchoSight to production',
        description: 'Waiting for AWS credits approval',
        status: 'blocked',
        paraCategory: 'projects',
        priority: 'high',
        projectSlug: 'echosight',
        daysInColumn: 7,
        createdAt: '2024-02-15T10:00:00Z',
        updatedAt: '2024-02-22T10:00:00Z',
      },
    ],
  },
};

// Mock Activity Feed
export const mockActivityFeed: ActivityEntry[] = [
  {
    id: 'act-1',
    timestamp: '2024-02-24T14:30:00Z',
    action: 'task_completed',
    description: 'Completed "Set up OpenClaw workspace"',
    paraCategory: 'projects',
    duration: 3600000,
    details: {
      filesModified: ['infra/docker-compose.yml', 'infra/setup.sh'],
      outputSummary: 'VPS configured with Docker, Redis, and workspace directories',
    },
  },
  {
    id: 'act-2',
    timestamp: '2024-02-24T13:15:00Z',
    action: 'research_completed',
    description: 'Research on RAG architectures completed',
    paraCategory: 'resources',
    duration: 1800000,
    details: {
      outputSummary: 'Compiled findings on vector databases, chunking strategies, and retrieval methods',
    },
  },
  {
    id: 'act-3',
    timestamp: '2024-02-24T12:00:00Z',
    action: 'briefing_sent',
    description: 'Morning briefing delivered via Telegram',
    duration: 120000,
  },
  {
    id: 'act-4',
    timestamp: '2024-02-24T11:45:00Z',
    action: 'note_received',
    description: 'Received note: "Research multi-agent patterns"',
    paraCategory: 'resources',
  },
  {
    id: 'act-5',
    timestamp: '2024-02-24T10:30:00Z',
    action: 'task_moved',
    description: 'Moved "Build Pace Dashboard" to In Progress',
    paraCategory: 'projects',
  },
  {
    id: 'act-6',
    timestamp: '2024-02-24T09:00:00Z',
    action: 'heartbeat',
    description: 'System heartbeat - all systems operational',
  },
  {
    id: 'act-7',
    timestamp: '2024-02-24T08:00:00Z',
    action: 'skill_executed',
    description: 'Executed morning-pulse skill',
    duration: 300000,
    details: {
      outputSummary: 'Compiled daily agenda, weather, and priority tasks',
    },
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    slug: 'pace',
    name: 'Pace AI',
    description: 'Personal AI Cognitive Engine - autonomous assistant built on OpenClaw',
    status: 'active',
    progress: 45,
    lastActivity: '2024-02-24T14:30:00Z',
    architectureNotes: 'OpenClaw runtime, Claude Sonnet/Opus, Redis pub/sub, Next.js dashboard',
    metrics: {
      tasksCompleted: 12,
      daysActive: 10,
      skillsBuilt: 5,
    },
    tasks: mockKanbanBoard.columns.in_progress.filter((t) => t.projectSlug === 'pace'),
    timeline: [
      { date: '2024-02-15', title: 'Project Started', description: 'Initial setup and planning' },
      { date: '2024-02-18', title: 'Infrastructure Ready', description: 'VPS and Docker configured' },
      { date: '2024-02-20', title: 'Memory System', description: 'PARA files created' },
    ],
    relatedParaItems: ['areas/engineering-leadership', 'resources/ai-trends'],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-24T14:30:00Z',
  },
  {
    slug: 'echosight',
    name: 'EchoSight',
    description: 'AI-powered meeting summarization and action item extraction tool',
    status: 'blocked',
    progress: 70,
    lastActivity: '2024-02-20T10:00:00Z',
    topBlocker: 'Waiting for AWS credits approval',
    architectureNotes: 'Whisper transcription, GPT-4 summarization, Next.js frontend',
    metrics: {
      tasksCompleted: 28,
      daysActive: 45,
      linesOfCode: 8500,
    },
    tasks: mockKanbanBoard.columns.blocked.filter((t) => t.projectSlug === 'echosight'),
    timeline: [
      { date: '2024-01-10', title: 'MVP Complete', description: 'Basic transcription working' },
      { date: '2024-02-01', title: 'Action Items', description: 'AI extraction implemented' },
    ],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },
  {
    slug: 'rag-chatbot',
    name: 'RAG Chatbot',
    description: 'Retrieval-augmented generation chatbot for enterprise knowledge bases',
    status: 'active',
    progress: 30,
    lastActivity: '2024-02-23T16:00:00Z',
    architectureNotes: 'pgvector, LangChain, OpenAI embeddings, FastAPI',
    metrics: {
      tasksCompleted: 8,
      daysActive: 14,
    },
    tasks: [],
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-23T16:00:00Z',
  },
];

// Mock Notes
export const mockNotes: Note[] = [
  {
    id: 'note-1',
    content: 'Research multi-agent orchestration patterns - compare LangGraph vs CrewAI',
    paraCategory: 'resources',
    sentAt: '2024-02-24T11:45:00Z',
    paceResponse: 'Created research task. Will compile findings on orchestration patterns including LangGraph, CrewAI, and AutoGen.',
    respondedAt: '2024-02-24T11:46:00Z',
  },
  {
    id: 'note-2',
    content: 'Reminder: schedule dentist appointment next week',
    paraCategory: 'areas',
    sentAt: '2024-02-24T09:00:00Z',
    paceResponse: 'Added to your Health & Wellness area. Would you like me to find available slots?',
    respondedAt: '2024-02-24T09:01:00Z',
  },
  {
    id: 'note-3',
    content: 'Idea: build a CLI tool for managing PARA files',
    paraCategory: 'projects',
    sentAt: '2024-02-23T15:00:00Z',
  },
];

// Mock Research Entries
export const mockResearchEntries: ResearchEntry[] = [
  {
    id: 'research-1',
    topic: 'RAG Architectures',
    content: '# RAG Architectures Overview\n\n## Key Findings\n- Hybrid search (dense + sparse) outperforms single-method approaches\n- Chunk size of 512 tokens optimal for most use cases\n- Re-ranking significantly improves precision...',
    sources: [
      { url: 'https://arxiv.org/paper1', title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP', type: 'paper', fetchedAt: '2024-02-20T10:00:00Z' },
      { url: 'https://docs.langchain.com', title: 'LangChain RAG Documentation', type: 'documentation', fetchedAt: '2024-02-20T10:00:00Z' },
    ],
    keyFindings: [
      'Hybrid search improves recall by 23%',
      'Contextual compression reduces token usage',
      'Query transformation boosts relevance',
    ],
    paraTags: ['resources'],
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-24T10:00:00Z',
  },
  {
    id: 'research-2',
    topic: 'Multi-Agent Systems',
    content: '# Multi-Agent Orchestration\n\n## Patterns\n- Supervisor: Central coordinator dispatches tasks\n- Hierarchical: Nested agent structures...',
    sources: [
      { url: 'https://github.com/langchain-ai/langgraph', title: 'LangGraph Repository', type: 'documentation', fetchedAt: '2024-02-24T10:00:00Z' },
    ],
    keyFindings: [
      'LangGraph offers most flexibility',
      'CrewAI better for role-based teams',
      'Custom solutions needed for complex workflows',
    ],
    paraTags: ['resources'],
    createdAt: '2024-02-24T10:00:00Z',
    updatedAt: '2024-02-24T10:00:00Z',
  },
];

// Mock Agent Status
export const mockAgentStatus: AgentStatus = {
  state: 'idle',
  lastHeartbeat: new Date().toISOString(),
  uptime: 86400,
  tasksCompletedToday: 7,
  nextTrigger: '2024-02-24T18:00:00Z',
  modelUsage: {
    sonnetCalls: 145,
    opusCalls: 12,
  },
};

// Mock Analytics Data
export const mockAnalyticsData: AnalyticsData = {
  taskThroughput: [
    { date: '2024-02-18', count: 5 },
    { date: '2024-02-19', count: 8 },
    { date: '2024-02-20', count: 6 },
    { date: '2024-02-21', count: 10 },
    { date: '2024-02-22', count: 7 },
    { date: '2024-02-23', count: 9 },
    { date: '2024-02-24', count: 7 },
  ],
  paraDistribution: {
    projects: 45,
    areas: 30,
    resources: 25,
  },
  projectVelocity: [
    {
      projectSlug: 'pace',
      projectName: 'Pace AI',
      data: [
        { date: '2024-02-18', count: 2 },
        { date: '2024-02-19', count: 3 },
        { date: '2024-02-20', count: 2 },
        { date: '2024-02-21', count: 4 },
        { date: '2024-02-22', count: 3 },
        { date: '2024-02-23', count: 2 },
        { date: '2024-02-24', count: 3 },
      ],
    },
    {
      projectSlug: 'echosight',
      projectName: 'EchoSight',
      data: [
        { date: '2024-02-18', count: 1 },
        { date: '2024-02-19', count: 2 },
        { date: '2024-02-20', count: 1 },
        { date: '2024-02-21', count: 0 },
        { date: '2024-02-22', count: 0 },
        { date: '2024-02-23', count: 0 },
        { date: '2024-02-24', count: 0 },
      ],
    },
  ],
  skillsRadar: [
    { skill: 'TypeScript', level: 85 },
    { skill: 'Python', level: 90 },
    { skill: 'Rust', level: 40 },
    { skill: 'Go', level: 40 },
    { skill: 'React', level: 80 },
    { skill: 'AI/ML', level: 75 },
  ],
  fitnessTrends: [
    { date: '2024-02-18', workouts: 1, runningDistance: 5.2 },
    { date: '2024-02-19', workouts: 0, runningDistance: 0 },
    { date: '2024-02-20', workouts: 1, runningDistance: 3.1 },
    { date: '2024-02-21', workouts: 1, runningDistance: 6.4 },
    { date: '2024-02-22', workouts: 0, runningDistance: 0 },
    { date: '2024-02-23', workouts: 1, runningDistance: 4.5 },
    { date: '2024-02-24', workouts: 1, runningDistance: 5.0 },
  ],
  learningProgress: [
    { topic: 'Rust', progress: 40 },
    { topic: 'Go', progress: 40 },
    { topic: 'Three.js', progress: 60 },
    { topic: 'LangGraph', progress: 30 },
  ],
  researchOutput: [
    {
      topic: 'RAG Architectures',
      data: [
        { date: '2024-02-18', count: 1 },
        { date: '2024-02-20', count: 2 },
        { date: '2024-02-22', count: 1 },
      ],
    },
    {
      topic: 'Multi-Agent Systems',
      data: [
        { date: '2024-02-21', count: 1 },
        { date: '2024-02-24', count: 2 },
      ],
    },
  ],
};

// Mock Focus Plan
export const mockFocusPlan: FocusPlan = {
  todayTasks: [
    {
      id: 'focus-1',
      title: 'Complete Pace Dashboard Views',
      reasoning: 'Dashboard is critical for monitoring Pace operations. Current momentum is strong.',
      paraCategory: 'projects',
      priority: 1,
      estimatedDuration: '4 hours',
      relatedProject: 'pace',
    },
    {
      id: 'focus-2',
      title: 'Review and respond to pending notes',
      reasoning: 'Maintains trust and responsiveness with MAV.',
      paraCategory: 'areas',
      priority: 2,
      estimatedDuration: '30 minutes',
    },
    {
      id: 'focus-3',
      title: 'Complete tempo run for training week',
      reasoning: 'Fitness goals require consistency. Skipping disrupts the plan.',
      paraCategory: 'areas',
      priority: 3,
      estimatedDuration: '45 minutes',
      relatedProject: 'health-fitness',
    },
  ],
  weeklyPriorities: [
    {
      id: 'weekly-1',
      title: 'Finish Pace MVP',
      reasoning: 'Foundation for all autonomous operations. Highest strategic value.',
      paraCategory: 'projects',
      priority: 1,
      relatedProject: 'pace',
    },
    {
      id: 'weekly-2',
      title: 'Unblock EchoSight deployment',
      reasoning: 'Project has been blocked for a week. Need to resolve AWS credits.',
      paraCategory: 'projects',
      priority: 2,
      relatedProject: 'echosight',
    },
    {
      id: 'weekly-3',
      title: 'Complete multi-agent research',
      reasoning: 'Informs architecture decisions for Pace skills system.',
      paraCategory: 'resources',
      priority: 3,
    },
    {
      id: 'weekly-4',
      title: 'Maintain fitness routine',
      reasoning: 'Health supports all other goals. Non-negotiable.',
      paraCategory: 'areas',
      priority: 4,
    },
  ],
  generatedAt: '2024-02-24T08:00:00Z',
};
