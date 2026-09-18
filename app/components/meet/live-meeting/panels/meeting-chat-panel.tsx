'use client';

import { MeetingMessage, MeetingParticipant } from '@/lib/meet/types';
import {
  MessageCircle,
  Paperclip,
  Send,
  Smile,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type MeetingChatPanelProps = {
  messages: MeetingMessage[];
  currentUser: MeetingParticipant;
  onSendMessage: (content: string) => void;
  onClose: () => void;
};

export function MeetingChatPanel({
  messages,
  currentUser,
  onSendMessage,
  onClose,
}: MeetingChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-primary" />
          <h3 className="font-bold text-sm">Meeting Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Close chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/80 text-[11px] text-muted-foreground text-center">
          Messages sent here are visible to all meeting participants and archived in the meeting record.
        </div>

        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser.id;

          return (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-foreground truncate text-[11px]">
                  {msg.senderName} {isOwn && '(You)'}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {msg.timestamp}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl leading-relaxed text-xs ${
                  isOwn
                    ? 'bg-primary text-white font-medium rounded-tr-xs'
                    : 'bg-background border border-border text-foreground rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to everyone..."
            className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-xl bg-primary text-white grid place-items-center shadow hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </aside>
  );
}
