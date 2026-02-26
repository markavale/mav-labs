'use client';

import { ChatPanel } from '@/components/chat/chat-panel';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] -mt-4 -mx-4 lg:-mx-8">
      <ChatPanel className="h-full" />
    </div>
  );
}
