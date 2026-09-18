'use client';

import { MeetingParticipant } from '@/lib/meet/types';
import { Mic, MicOff, PinOff, User } from 'lucide-react';
import React from 'react';

type ActiveSpeakerViewProps = {
  activeSpeaker: MeetingParticipant;
  otherParticipants: MeetingParticipant[];
  currentUserId: string;
  onSelectSpeaker: (p: MeetingParticipant) => void;
  onResetLayout: () => void;
};

export function ActiveSpeakerView({
  activeSpeaker,
  otherParticipants,
  currentUserId,
  onSelectSpeaker,
  onResetLayout,
}: ActiveSpeakerViewProps) {
  return (
    <div className="flex-1 w-full h-full flex flex-col p-3 md:p-6 overflow-hidden gap-3 select-none">
      {/* Main Spotlight Canvas */}
      <div className="flex-1 w-full rounded-3xl border border-border/40 bg-gray-900 shadow-2xl relative overflow-hidden flex items-center justify-center">
        {activeSpeaker.isVideoOn ? (
          <div className="w-full h-full relative">
            <img
              src={activeSpeaker.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&auto=format&fit=crop&q=80'}
              alt={activeSpeaker.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-muted/20 border-2 border-white/20 grid place-items-center text-white text-4xl font-extrabold shadow-inner">
              {activeSpeaker.name.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-white/70">Camera Off</span>
          </div>
        )}

        {/* Top Active Speaker Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Speaker: {activeSpeaker.name}</span>
        </div>

        {/* Unpin Action */}
        <button
          onClick={onResetLayout}
          className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-colors shadow-md"
        >
          <PinOff size={14} />
          <span>Grid View</span>
        </button>

        {/* Bottom Speaker Name Bar */}
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl text-white font-bold text-sm shadow-md">
            {activeSpeaker.name} {activeSpeaker.id === currentUserId && '(You)'}
          </div>

          <div
            className={`w-9 h-9 rounded-xl grid place-items-center shadow-md ${
              activeSpeaker.isMuted
                ? 'bg-red-600/90 text-white'
                : 'bg-black/60 backdrop-blur-md text-emerald-400'
            }`}
          >
            {activeSpeaker.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </div>
        </div>
      </div>

      {/* Horizontal Strip of other attendees */}
      {otherParticipants.length > 0 && (
        <div className="h-28 shrink-0 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
          {otherParticipants.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectSpeaker(p)}
              className="h-full aspect-video rounded-2xl border border-border/50 bg-gray-900 shadow-md relative overflow-hidden flex items-center justify-center hover:scale-102 transition-transform shrink-0"
            >
              {p.isVideoOn ? (
                <img
                  src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted/20 text-white font-bold grid place-items-center text-xs">
                  {p.name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-white text-[10px] font-bold truncate max-w-[90%]">
                {p.name.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
