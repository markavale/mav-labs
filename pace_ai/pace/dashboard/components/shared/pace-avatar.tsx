'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type AvatarState = 'idle' | 'thinking' | 'working' | 'error';

// ---------------------------------------------------------------------------
// State configuration
// ---------------------------------------------------------------------------

const stateConfig: Record<
  AvatarState,
  { label: string; glowColor: string; borderColor: string; dotColor: string }
> = {
  idle: {
    label: 'Idle',
    glowColor: 'rgba(110, 118, 129, 0.35)',
    borderColor: 'rgba(110, 118, 129, 0.5)',
    dotColor: 'bg-text-muted',
  },
  thinking: {
    label: 'Thinking...',
    glowColor: 'rgba(34, 211, 238, 0.45)',
    borderColor: 'rgba(34, 211, 238, 0.7)',
    dotColor: 'bg-brand-cyan',
  },
  working: {
    label: 'Working...',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    borderColor: 'rgba(168, 85, 247, 0.8)',
    dotColor: 'bg-brand-purple',
  },
  error: {
    label: 'Error',
    glowColor: 'rgba(248, 81, 73, 0.45)',
    borderColor: 'rgba(248, 81, 73, 0.7)',
    dotColor: 'bg-status-error',
  },
};

// ---------------------------------------------------------------------------
// PaceAvatarStatic — lightweight circle PNG for navbar / sidebar / messages
// ---------------------------------------------------------------------------

interface PaceAvatarStaticProps {
  size?: number;
  state?: AvatarState;
  showDot?: boolean;
  className?: string;
}

export function PaceAvatarStatic({
  size = 32,
  state = 'idle',
  showDot = true,
  className,
}: PaceAvatarStaticProps) {
  const config = stateConfig[state];
  const dotSize = size <= 32 ? 8 : 10;

  return (
    <div className={cn('relative flex-shrink-0', className)} style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ border: `1.5px solid ${config.borderColor}` }}
      >
        <img
          src="/pace-avatar.png"
          alt="Pace"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'top center' }}
          draggable={false}
        />
      </div>

      {showDot && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-dark-bg',
            config.dotColor,
            state !== 'idle' && 'animate-pulse'
          )}
          style={{
            width: dotSize,
            height: dotSize,
            bottom: 0,
            right: 0,
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PaceAvatar — holographic card for the chat page hero
// ---------------------------------------------------------------------------

interface PaceAvatarProps {
  state?: AvatarState;
  showStatusText?: boolean;
  className?: string;
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 210;

export function PaceAvatar({
  state = 'idle',
  showStatusText = false,
  className,
}: PaceAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const config = stateConfig[state];
  const isWorking = state === 'working';
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isWorking) {
      video.playbackRate = 1.5;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isWorking]);

  const glowAnim =
    state === 'idle'
      ? 'animate-pace-breathe'
      : state === 'error'
        ? 'animate-pace-shake'
        : 'animate-pace-glow';

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className="relative"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        {/* Outer glow */}
        <div
          className={cn('absolute inset-[-4px] rounded-2xl', glowAnim)}
          style={{
            boxShadow: `0 0 28px 6px ${config.glowColor}`,
          }}
        />

        {/* Gradient border */}
        <div
          className={cn('absolute inset-0 rounded-2xl', glowAnim)}
          style={{ border: `2px solid ${config.borderColor}` }}
        />

        {/* Spinning particles — working only */}
        {isWorking && (
          <div className="absolute inset-[-10px] animate-pace-spin">
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const cx = (CARD_WIDTH + 20) / 2;
              const cy = (CARD_HEIGHT + 20) / 2;
              const rx = cx;
              const ry = cy;
              const rad = (deg * Math.PI) / 180;
              const x = cx + rx * Math.cos(rad);
              const y = cy + ry * Math.sin(rad);
              return (
                <div
                  key={deg}
                  className="absolute w-1.5 h-1.5 rounded-full bg-brand-purple"
                  style={{
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 8px 3px rgba(168, 85, 247, 0.6)',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Media container */}
        <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-dark-bg">
          {/* Static PNG — visible when NOT working */}
          <img
            src="/pace-avatar.png"
            alt="Pace"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              isWorking && videoReady ? 'opacity-0' : 'opacity-100'
            )}
            style={{ objectPosition: 'top center' }}
            draggable={false}
          />

          {/* Video — only visible when working */}
          <video
            ref={videoRef}
            src="/pace-avatar.mp4"
            muted
            loop
            playsInline
            onCanPlay={() => setVideoReady(true)}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              isWorking && videoReady ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-dark-bg/80 to-transparent" />
        </div>
      </div>

      {/* Status text */}
      {showStatusText && (
        <span
          className={cn(
            'font-mono text-xs tracking-widest uppercase',
            state === 'idle' && 'text-text-muted',
            state === 'thinking' && 'text-brand-cyan',
            state === 'working' && 'text-brand-purple',
            state === 'error' && 'text-status-error'
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
