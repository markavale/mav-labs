'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn, generateId } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, ProjectBuild } from '@/lib/types';
import { PaceAvatar, type AvatarState } from '@/components/shared/pace-avatar';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ProjectBuildCard } from './project-build-card';

interface ChatPanelProps {
  className?: string;
}

const INITIAL_MESSAGES: ChatMessageType[] = [
  {
    id: 'welcome',
    role: 'pace',
    content:
      "Hey MAV! I'm **Pace**, your AI cognitive engine. I can build projects, research topics, manage your PARA system, and more.\n\nWhat would you like to work on today?",
    timestamp: new Date().toISOString(),
    status: 'sent',
  },
];

function simulateTyping(text: string, onChunk: (partial: string) => void, onDone: () => void) {
  let index = 0;
  const words = text.split(' ');
  const interval = setInterval(() => {
    if (index < words.length) {
      const partial = words.slice(0, index + 1).join(' ');
      onChunk(partial);
      index++;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 60);
  return () => clearInterval(interval);
}

export function ChatPanel({ className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(INITIAL_MESSAGES);
  const [paceState, setPaceState] = useState<AvatarState>('idle');
  const [activeBuild, setActiveBuild] = useState<ProjectBuild | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const pollBuildStatus = useCallback(
    async (buildId: string) => {
      const maxPolls = 60;
      let polls = 0;

      const poll = async () => {
        if (polls >= maxPolls) return;
        polls++;

        try {
          const res = await fetch(`/api/project-builder/${buildId}`);
          const json = await res.json();
          if (!json.success || !json.data) return;

          const build = json.data;
          setActiveBuild({
            id: build.id,
            projectName: build.config.projectName,
            description: build.config.description,
            phases: build.phases,
            repoUrl: build.repoUrl,
            createdAt: build.createdAt,
            updatedAt: build.updatedAt,
          });

          if (build.status === 'running') {
            setTimeout(poll, 3000);
          } else {
            setPaceState('idle');
          }
        } catch {
          setTimeout(poll, 5000);
        }
      };

      setTimeout(poll, 2000);
    },
    []
  );

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: ChatMessageType = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, userMessage]);
      setPaceState('thinking');
      setIsTyping(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
        });

        const json = await res.json();

        if (json.success && json.data) {
          const reply = json.data as ChatMessageType;
          const isBuild = !!reply.metadata?.buildId;

          setPaceState(isBuild ? 'working' : 'thinking');

          const responseId = reply.id;
          const paceMessage: ChatMessageType = {
            ...reply,
            content: '',
            status: 'sending',
          };

          setMessages((prev) => [...prev, paceMessage]);

          cleanupRef.current = simulateTyping(
            reply.content,
            (partial) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === responseId ? { ...m, content: partial } : m))
              );
            },
            () => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === responseId ? { ...m, content: reply.content, status: 'sent' } : m
                )
              );
              setIsTyping(false);
              if (!isBuild) setPaceState('idle');
            }
          );

          if (isBuild && reply.metadata?.buildId) {
            pollBuildStatus(reply.metadata.buildId);
          }
        } else {
          throw new Error(json.error || 'Unknown error');
        }
      } catch (err) {
        const errorMessage: ChatMessageType = {
          id: generateId(),
          role: 'pace',
          content: `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
          timestamp: new Date().toISOString(),
          status: 'error',
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
        setPaceState('error');
        setTimeout(() => setPaceState('idle'), 3000);
      }
    },
    [pollBuildStatus]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Avatar header */}
      <div className="flex-shrink-0 flex flex-col items-center py-6 border-b border-dark-border">
        <PaceAvatar state={paceState} showStatusText />
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {activeBuild && (
          <div className="max-w-[85%] mr-auto">
            <ProjectBuildCard build={activeBuild} />
          </div>
        )}

        {isTyping && paceState !== 'idle' && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-2 text-text-muted text-xs ml-11">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                style={{ animationDelay: '0.15s' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
            </span>
            Pace is {paceState}...
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-dark-border p-4">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
