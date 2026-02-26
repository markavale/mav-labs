import type Redis from 'ioredis';
import { getSubscriber, CHANNELS } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();
  let sub: Redis | null = null;

  const stream = new ReadableStream({
    start(controller) {
      sub = getSubscriber();
      const channels = Object.values(CHANNELS);
      sub.subscribe(...channels);

      sub.on('message', (channel: string, message: string) => {
        try {
          const event = {
            channel: channel.replace('pace:', ''),
            data: JSON.parse(message),
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ channel, data: message, timestamp: new Date().toISOString() })}\n\n`));
        }
      });

      // Send initial keepalive
      controller.enqueue(encoder.encode(`: keepalive\n\n`));
    },
    cancel() {
      if (sub) {
        sub.unsubscribe(...Object.values(CHANNELS));
        sub.disconnect();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
