import * as github from './github';
import * as telegram from './telegram';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BuildConfig {
  projectName: string;
  description: string;
  techStack?: string[];
  features?: string[];
}

export type PhaseName =
  | 'researching'
  | 'planning'
  | 'coding'
  | 'testing'
  | 'deploying'
  | 'complete';

export interface PhaseState {
  phase: PhaseName;
  status: 'pending' | 'active' | 'complete' | 'error';
  startedAt?: string;
  completedAt?: string;
  output?: string;
  error?: string;
}

export interface BuildState {
  id: string;
  config: BuildConfig;
  phases: PhaseState[];
  status: 'running' | 'complete' | 'error';
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// In-memory store (swap for Redis/DB later)
// ---------------------------------------------------------------------------

const builds = new Map<string, BuildState>();

function generateId(): string {
  return `build_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultPhases(): PhaseState[] {
  const names: PhaseName[] = [
    'researching',
    'planning',
    'coding',
    'testing',
    'deploying',
    'complete',
  ];
  return names.map((phase) => ({ phase, status: 'pending' }));
}

function advancePhase(build: BuildState, phase: PhaseName): void {
  const p = build.phases.find((s) => s.phase === phase);
  if (p) {
    p.status = 'active';
    p.startedAt = new Date().toISOString();
  }
  build.updatedAt = new Date().toISOString();
}

function completePhase(build: BuildState, phase: PhaseName, output?: string): void {
  const p = build.phases.find((s) => s.phase === phase);
  if (p) {
    p.status = 'complete';
    p.completedAt = new Date().toISOString();
    if (output) p.output = output;
  }
  build.updatedAt = new Date().toISOString();
}

function failPhase(build: BuildState, phase: PhaseName, error: string): void {
  const p = build.phases.find((s) => s.phase === phase);
  if (p) {
    p.status = 'error';
    p.error = error;
  }
  build.status = 'error';
  build.updatedAt = new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Serper (web research)
// ---------------------------------------------------------------------------

async function searchSerper(query: string): Promise<string> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return 'Serper API key not configured — skipping research.';

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!res.ok) {
    throw new Error(`Serper search failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const organic: { title: string; snippet: string; link: string }[] =
    data.organic ?? [];

  return organic
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.link}`)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// DeepSeek (OpenAI-compatible API)
// ---------------------------------------------------------------------------

async function askDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  model: 'deepseek-chat' | 'deepseek-reasoner' = 'deepseek-chat'
): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return '[DeepSeek API key not configured — returning placeholder response]';

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ---------------------------------------------------------------------------
// Pipeline phases
// ---------------------------------------------------------------------------

export async function runResearchPhase(build: BuildState): Promise<void> {
  advancePhase(build, 'researching');

  try {
    const { projectName, description, techStack } = build.config;
    const query = `${projectName} ${description} ${(techStack ?? []).join(' ')} best practices architecture`;
    const results = await searchSerper(query);
    completePhase(build, 'researching', results);
  } catch (err) {
    failPhase(build, 'researching', String(err));
  }
}

export async function runPlanningPhase(build: BuildState): Promise<void> {
  advancePhase(build, 'planning');

  try {
    const { projectName, description, techStack, features } = build.config;
    const researchOutput =
      build.phases.find((p) => p.phase === 'researching')?.output ?? 'No research available.';

    const system =
      'You are Pace, an AI project architect. Create a detailed project plan with file structure, dependencies, and implementation steps.';

    const prompt = [
      `Project: ${projectName}`,
      `Description: ${description}`,
      techStack?.length ? `Tech Stack: ${techStack.join(', ')}` : '',
      features?.length ? `Features: ${features.join(', ')}` : '',
      `\nResearch context:\n${researchOutput}`,
      '\nProvide: 1) File structure  2) Dependencies  3) Step-by-step implementation plan  4) Key architecture decisions',
    ]
      .filter(Boolean)
      .join('\n');

    const plan = await askDeepSeek(system, prompt, 'deepseek-reasoner');
    completePhase(build, 'planning', plan);
  } catch (err) {
    failPhase(build, 'planning', String(err));
  }
}

export async function runCodingPhase(build: BuildState): Promise<void> {
  advancePhase(build, 'coding');

  try {
    const { projectName, description, techStack, features } = build.config;
    const plan =
      build.phases.find((p) => p.phase === 'planning')?.output ?? 'No plan available.';

    const system =
      'You are Pace, an expert full-stack developer. Generate production-ready code based on the project plan. Return code as a JSON object where keys are file paths and values are file contents.';

    const prompt = [
      `Project: ${projectName}`,
      `Description: ${description}`,
      techStack?.length ? `Tech Stack: ${techStack.join(', ')}` : '',
      features?.length ? `Features: ${features.join(', ')}` : '',
      `\nProject Plan:\n${plan}`,
      '\nGenerate the complete codebase. Return ONLY a JSON object: { "path/to/file": "file contents", ... }',
    ]
      .filter(Boolean)
      .join('\n');

    const codeJson = await askDeepSeek(system, prompt, 'deepseek-chat');
    completePhase(build, 'coding', codeJson);
  } catch (err) {
    failPhase(build, 'coding', String(err));
  }
}

export async function runTestingPhase(build: BuildState): Promise<void> {
  advancePhase(build, 'testing');

  try {
    // Placeholder — in the future, spin up a sandbox and run tests
    completePhase(build, 'testing', 'Testing phase placeholder — no tests run yet.');
  } catch (err) {
    failPhase(build, 'testing', String(err));
  }
}

export async function runDeployPhase(build: BuildState): Promise<void> {
  advancePhase(build, 'deploying');

  try {
    const { projectName, description } = build.config;
    const codeOutput = build.phases.find((p) => p.phase === 'coding')?.output;

    // Parse generated code JSON
    let files: Map<string, string>;
    try {
      const parsed: Record<string, string> = codeOutput ? JSON.parse(codeOutput) : {};
      files = new Map(Object.entries(parsed));
    } catch {
      files = new Map([['README.md', `# ${projectName}\n\n${description}\n`]]);
    }

    const repoSlug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { repoUrl } = await github.createRepo(repoSlug, description, true);
    build.repoUrl = repoUrl;

    // Small delay to let GitHub finish initialising the repo
    await new Promise((r) => setTimeout(r, 2000));

    if (files.size > 0) {
      await github.pushFiles(repoSlug, files, `feat: initial project scaffold by Pace AI`);
    }

    completePhase(build, 'deploying', `Repository created: ${repoUrl}`);
  } catch (err) {
    failPhase(build, 'deploying', String(err));
  }
}

export async function notifyTelegram(build: BuildState): Promise<void> {
  try {
    if (build.status === 'complete' && build.repoUrl) {
      await telegram.sendBuildComplete(build.config.projectName, build.repoUrl);
    } else {
      await telegram.sendProjectUpdate({
        projectName: build.config.projectName,
        status: build.status,
        repoUrl: build.repoUrl,
        error: build.phases.find((p) => p.status === 'error')?.error,
      });
    }
  } catch (err) {
    console.error('[ProjectBuilder] Telegram notification failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function startBuild(config: BuildConfig): Promise<BuildState> {
  const id = generateId();
  const now = new Date().toISOString();

  const build: BuildState = {
    id,
    config,
    phases: defaultPhases(),
    status: 'running',
    createdAt: now,
    updatedAt: now,
  };

  builds.set(id, build);

  // Notify that we're starting
  telegram.sendProjectUpdate({
    projectName: config.projectName,
    status: 'started',
  }).catch(() => {});

  // Run the pipeline asynchronously — don't block the response
  runPipeline(build).catch((err) => {
    console.error('[ProjectBuilder] Pipeline failed:', err);
    build.status = 'error';
    build.updatedAt = new Date().toISOString();
  });

  return build;
}

function hasFailed(build: BuildState): boolean {
  return build.status === 'error';
}

async function runPipeline(build: BuildState): Promise<void> {
  await runResearchPhase(build);
  if (hasFailed(build)) return notifyTelegram(build);

  await runPlanningPhase(build);
  if (hasFailed(build)) return notifyTelegram(build);

  await runCodingPhase(build);
  if (hasFailed(build)) return notifyTelegram(build);

  await runTestingPhase(build);
  if (hasFailed(build)) return notifyTelegram(build);

  await runDeployPhase(build);
  if (hasFailed(build)) return notifyTelegram(build);

  completePhase(build, 'complete');
  build.status = 'complete';
  build.updatedAt = new Date().toISOString();

  await notifyTelegram(build);
}

export function getBuild(id: string): BuildState | null {
  return builds.get(id) ?? null;
}

export function getAllBuilds(): BuildState[] {
  return Array.from(builds.values());
}
