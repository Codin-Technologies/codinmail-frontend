'use client';

import { MeetingParticipant } from '@/lib/meet/types';
import { Monitor, Square, Users, X } from 'lucide-react';
import React from 'react';

type ScreenShareViewProps = {
  presenter: MeetingParticipant;
  isSelfSharing: boolean;
  participants: MeetingParticipant[];
  onStopSharing: () => void;
};

export function ScreenShareView({
  presenter,
  isSelfSharing,
  participants,
  onStopSharing,
}: ScreenShareViewProps) {
  return (
    <div className="flex-1 w-full h-full flex flex-col p-3 md:p-6 overflow-hidden gap-3 select-none">
      {/* Top Sharing Notification Banner */}
      <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-foreground">
          <Monitor size={16} className="text-primary" />
          <span className="font-bold">
            {isSelfSharing ? 'You are sharing your screen (Window / Tab)' : `${presenter.name} is sharing their screen`}
          </span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            · 1080p 60fps Presentation Stream
          </span>
        </div>

        {isSelfSharing && (
          <button
            onClick={onStopSharing}
            className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Square size={12} className="fill-current" />
            <span>Stop Sharing</span>
          </button>
        )}
      </div>

      {/* Main Presentation Surface */}
      <div className="flex-1 w-full rounded-3xl border border-border bg-gray-950 shadow-2xl relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full h-full rounded-2xl border border-border/40 bg-card overflow-hidden flex flex-col">
          {/* Mock Presentation Window Chrome */}
          <div className="h-9 border-b border-border bg-muted/30 px-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px] ml-2 text-foreground font-semibold">
                Codin — Product Architecture & Unified Meeting Engine.pdf
              </span>
            </div>
            <span className="text-[10px] font-mono">Page 3 of 12</span>
          </div>

          {/* Presentation Slide Content Canvas */}
          <div className="flex-1 p-8 bg-background flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="space-y-4 max-w-2xl">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                Unified Communication Architecture
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Codin Meet: Provider-Agnostic Engine
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Seamlessly connecting Google Meet conferencing infrastructure with native Codin collaboration panels: Real-time Notes, Action Items to Tasks, Linked Files, and Post-Meeting AI Summaries.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border mt-6">
              <div className="p-3.5 rounded-xl border border-border bg-card">
                <strong className="text-xs font-bold text-foreground block">Zero Context Switching</strong>
                <span className="text-[11px] text-muted-foreground">Chat, Notes, & Tasks in one live viewport.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-card">
                <strong className="text-xs font-bold text-foreground block">Google Meet Adapter</strong>
                <span className="text-[11px] text-muted-foreground">Enterprise scalability with custom branding.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-card">
                <strong className="text-xs font-bold text-foreground block">AI Summary & Action Items</strong>
                <span className="text-[11px] text-muted-foreground">1-click task creation & follow-up draft.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Thumbnail Strip */}
      <div className="h-24 shrink-0 flex items-center gap-2.5 overflow-x-auto custom-scrollbar">
        {participants.map((p) => (
          <div
            key={p.id}
            className="h-full aspect-video rounded-2xl border border-border/60 bg-gray-900 shadow-md relative overflow-hidden flex items-center justify-center shrink-0"
          >
            {p.isVideoOn ? (
              <img
                src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted/20 text-white font-bold grid place-items-center text-xs">
                {p.name.charAt(0)}
              </div>
            )}
            <div className="absolute bottom-1 left-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-white text-[9px] font-bold truncate max-w-[85%]">
              {p.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
