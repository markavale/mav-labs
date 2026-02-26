'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSEvent, WSEventType } from './types';

interface SSEEvent {
  channel: string;
  data: unknown;
  timestamp: string;
}

interface UseRealtimeOptions {
  url?: string;
  onEvent?: (event: WSEvent) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseRealtimeReturn {
  isConnected: boolean;
  lastEvent: WSEvent | null;
  reconnect: () => void;
}

const CHANNEL_TO_EVENT_TYPE: Record<string, WSEventType> = {
  activity: 'activity',
  kanban: 'kanban_update',
  status: 'status_update',
  heartbeat: 'heartbeat',
  notes: 'note_response',
};

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const {
    url = '/api/events',
    onEvent,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const esRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const es = new EventSource(url);

      es.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      es.onmessage = (event) => {
        try {
          const parsed: SSEEvent = JSON.parse(event.data);
          const wsEvent: WSEvent = {
            type: CHANNEL_TO_EVENT_TYPE[parsed.channel] || ('activity' as WSEventType),
            payload: parsed.data,
            timestamp: parsed.timestamp,
          };
          setLastEvent(wsEvent);
          onEvent?.(wsEvent);
        } catch {
          // ignore malformed messages
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, reconnectInterval);
        }
      };

      esRef.current = es;
    } catch {
      // connection failed
    }
  }, [url, onEvent, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    esRef.current?.close();
    esRef.current = null;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, lastEvent, reconnect };
}

// Backward-compatible aliases
export const useWebSocket = useRealtime;

export function isActivityEvent(event: WSEvent): boolean {
  return event.type === 'activity';
}

export function isKanbanEvent(event: WSEvent): boolean {
  return event.type === 'kanban_update';
}

export function isStatusEvent(event: WSEvent): boolean {
  return event.type === 'status_update';
}

export function useWSEventSubscription<T>(eventType: WSEventType, callback: (payload: T) => void) {
  const { lastEvent } = useRealtime();

  useEffect(() => {
    if (lastEvent && lastEvent.type === eventType) {
      callback(lastEvent.payload as T);
    }
  }, [lastEvent, eventType, callback]);
}
