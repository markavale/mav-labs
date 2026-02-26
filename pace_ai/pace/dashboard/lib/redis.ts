import Redis from 'ioredis';

// Redis client singleton
let redis: Redis | null = null;
let subscriber: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redis;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return subscriber;
}

// Pub/Sub channel names
export const CHANNELS = {
  ACTIVITY: 'pace:activity',
  KANBAN: 'pace:kanban',
  STATUS: 'pace:status',
  HEARTBEAT: 'pace:heartbeat',
  NOTES: 'pace:notes',
} as const;

export type ChannelName = (typeof CHANNELS)[keyof typeof CHANNELS];

// Publish message to channel
export async function publish(channel: ChannelName, message: unknown): Promise<void> {
  const client = getRedis();
  await client.publish(channel, JSON.stringify(message));
}

// Subscribe to channels
export function subscribe(
  channels: ChannelName[],
  callback: (channel: string, message: string) => void
): () => void {
  const sub = getSubscriber();

  sub.subscribe(...channels);
  sub.on('message', callback);

  return () => {
    sub.unsubscribe(...channels);
    sub.removeListener('message', callback);
  };
}

// Key-value helpers
export async function get<T>(key: string): Promise<T | null> {
  const client = getRedis();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

export async function set(key: string, value: unknown, ttl?: number): Promise<void> {
  const client = getRedis();
  if (ttl) {
    await client.setex(key, ttl, JSON.stringify(value));
  } else {
    await client.set(key, JSON.stringify(value));
  }
}

export async function del(key: string): Promise<void> {
  const client = getRedis();
  await client.del(key);
}

// Stream helpers for activity log
export async function addToStream(
  streamKey: string,
  data: Record<string, string>
): Promise<string | null> {
  const client = getRedis();
  return client.xadd(streamKey, '*', ...Object.entries(data).flat());
}

export async function readStream(
  streamKey: string,
  count: number = 50,
  startId: string = '-'
): Promise<Array<[string, string[]]>> {
  const client = getRedis();
  const result = await client.xrange(streamKey, startId, '+', 'COUNT', count);
  return result;
}
