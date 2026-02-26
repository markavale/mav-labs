import { NextRequest, NextResponse } from 'next/server';
import { startBuild, getBuild } from '@/lib/services/project-builder';
import type { ApiResponse, ChatMessage } from '@/lib/types';

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------

type Intent = 'build' | 'research' | 'general';

interface DetectedIntent {
  intent: Intent;
  projectName?: string;
  description?: string;
  techStack?: string[];
  topic?: string;
}

const BUILD_PATTERNS = [
  /\bbuild\s+(me\s+)?(?:a\s+|an\s+)?(.+)/i,
  /\bcreate\s+(me\s+)?(?:a\s+|an\s+)?(?:project|app|website|api|service)\b/i,
  /\bscaffold\s+/i,
  /\bgenerate\s+(?:a\s+)?project\b/i,
  /\bstart\s+(?:a\s+)?new\s+project\b/i,
];

const RESEARCH_PATTERNS = [
  /\bresearch\b/i,
  /\blook\s*up\b/i,
  /\bfind\s+(?:info|information|articles|resources)\b/i,
  /\bwhat\s+(?:is|are)\b/i,
  /\bhow\s+(?:does|do|to)\b/i,
];

function detectIntent(message: string): DetectedIntent {
  for (const pattern of BUILD_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const rawName = match[2]?.trim() || 'untitled-project';
      return {
        intent: 'build',
        projectName: rawName.split(/\s+/).slice(0, 5).join('-').toLowerCase(),
        description: message,
      };
    }
  }

  for (const pattern of RESEARCH_PATTERNS) {
    if (pattern.test(message)) {
      return { intent: 'research', topic: message };
    }
  }

  return { intent: 'general' };
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function chatResponse(
  content: string,
  metadata?: ChatMessage['metadata']
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role: 'pace',
    content,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

// ---------------------------------------------------------------------------
// Streaming encoder (typing effect)
// ---------------------------------------------------------------------------

function streamText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index >= text.length) {
        controller.close();
        return;
      }

      // Emit in small chunks (word-level) for a natural typing feel
      const nextSpace = text.indexOf(' ', index + 1);
      const end = nextSpace === -1 ? text.length : nextSpace + 1;
      const chunk = text.slice(index, end);
      index = end;

      controller.enqueue(encoder.encode(chunk));

      // Small delay between chunks (~30-60ms perceived typing speed)
      await new Promise((r) => setTimeout(r, 30));
    },
  });
}

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, buildId, stream } = body as {
      message?: string;
      buildId?: string;
      stream?: boolean;
    };

    // If caller is polling an existing build, return its current state
    if (buildId) {
      const build = getBuild(buildId);
      if (!build) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Build not found' },
          { status: 404 }
        );
      }

      const activePhase = build.phases.find((p) => p.status === 'active');
      const content =
        build.status === 'complete'
          ? `Project **${build.config.projectName}** is complete! 🚀\nRepo: ${build.repoUrl}`
          : build.status === 'error'
            ? `Build encountered an error during the ${activePhase?.phase ?? 'unknown'} phase.`
            : `Currently ${activePhase?.phase ?? 'processing'}... hang tight.`;

      const msg = chatResponse(content, {
        buildId: build.id,
        projectName: build.config.projectName,
        phase: activePhase?.phase ?? 'complete',
        progress: Math.round(
          (build.phases.filter((p) => p.status === 'complete').length /
            build.phases.length) *
            100
        ),
        repoUrl: build.repoUrl,
      });

      return NextResponse.json<ApiResponse<ChatMessage>>({
        success: true,
        data: msg,
      });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    const detected = detectIntent(message.trim());

    let reply: ChatMessage;

    switch (detected.intent) {
      case 'build': {
        const build = await startBuild({
          projectName: detected.projectName ?? 'untitled-project',
          description: detected.description ?? message,
        });

        reply = chatResponse(
          `Got it — I'm spinning up **${build.config.projectName}**. I'll research, plan, code, test, and deploy it for you. Track progress with the build ID below.`,
          {
            buildId: build.id,
            projectName: build.config.projectName,
            phase: 'researching',
            progress: 0,
          }
        );
        break;
      }

      case 'research': {
        reply = chatResponse(
          `Starting research on: *${detected.topic}*. I'll compile findings and update you shortly.`,
          { projectName: 'Research' }
        );
        break;
      }

      default: {
        reply = chatResponse(
          `Hey MAV 👋 — I'm Pace, your AI co-pilot. You said:\n\n> ${message}\n\nI can **build projects**, **research topics**, or answer questions. What would you like me to do?`
        );
      }
    }

    // If the client requested streaming, return a ReadableStream
    if (stream) {
      return new Response(streamText(reply.content), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Chat-Id': reply.id,
          'X-Chat-Timestamp': reply.timestamp,
          'Cache-Control': 'no-cache',
        },
      });
    }

    return NextResponse.json<ApiResponse<ChatMessage>>({
      success: true,
      data: reply,
    });
  } catch (err) {
    console.error('[Chat API]', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
