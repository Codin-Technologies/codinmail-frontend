'use client';

import { MeetingParticipant } from '@/lib/meet/types';
import { Mic, MicOff, PinIcon, Shield, Video, VideoOff } from 'lucide-react';
import React, { useMemo } from 'react';

type VideoGridProps = {
  participants: MeetingParticipant[];
  currentUserId: string;
  pinnedParticipantId: string | null;
  onPinParticipant: (id: string | null) => void;
  onToggleMuteParticipant: (id: string) => void;
};

const AVATAR_COLORS = [
  'from-indigo-600 to-violet-700',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-600 to-pink-700',
  'from-blue-600 to-cyan-600',
  'from-violet-600 to-purple-700',
];

function getGridTemplate(n: number): string {
  if (n === 1) return 'grid-cols-1';
  if (n === 2) return 'grid-cols-2';
  if (n <= 4) return 'grid-cols-2';
  if (n <= 6) return 'grid-cols-3';
  if (n <= 9) return 'grid-cols-3';
  return 'grid-cols-4';
}

export function VideoGrid({
  participants,
  currentUserId,
  pinnedParticipantId,
  onPinParticipant,
  onToggleMuteParticipant,
}: VideoGridProps) {
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.id === currentUserId) return 1;
      if (b.id === currentUserId) return -1;
      if (a.isSpeaking && !b.isSpeaking) return -1;
      if (!a.isSpeaking && b.isSpeaking) return 1;
      return 0;
    });
  }, [participants, currentUserId]);

  return (
    <div className={`flex-1 grid ${getGridTemplate(sorted.length)} gap-1 p-1 bg-gray-950 min-h-0 overflow-hidden auto-rows-fr`}>
      {sorted.map((p, idx) => {
        const isSelf = p.id === currentUserId;
        const isPinned = p.id === pinnedParticipantId;
        const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];

        return (
          <div
            key={p.id}
            onClick={() => onPinParticipant(isPinned ? null : p.id)}
            className={`relative rounded-xl overflow-hidden bg-gray-900 cursor-pointer group transition-all min-h-0 ${
              p.isSpeaking ? 'ring-2 ring-emerald-400/80' : 'ring-1 ring-white/5'
            } ${isPinned ? 'ring-2 ring-primary' : ''}`}
          >
            {/* Video or avatar */}
            {p.isVideoOn && p.avatar ? (
              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-2xl font-extrabold text-white shadow-lg`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            {/* Speaking indicator */}
            {p.isSpeaking && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/60 pointer-events-none animate-pulse" />
            )}

            {/* Bottom bar */}
            <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-white text-xs font-semibold truncate drop-shadow">
                  {isSelf ? `${p.name.replace(' (You)', '')} (You)` : p.name}
                </span>
                {p.role === 'host' && (
                  <Shield size={10} className="text-amber-400 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1">
                {!p.isVideoOn && <VideoOff size={13} className="text-red-400" />}
                {p.isMuted ? <MicOff size={13} className="text-red-400" /> : <Mic size={13} className="text-emerald-400" />}
              </div>
            </div>

            {/* Hover overlay actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onPinParticipant(isPinned ? null : p.id); }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur text-xs font-bold transition-all ${isPinned ? 'bg-primary text-white' : 'bg-black/60 text-white hover:bg-primary'}`}
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                <PinIcon size={12} />
              </button>
              {!isSelf && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleMuteParticipant(p.id); }}
                  className="w-7 h-7 rounded-lg bg-black/60 hover:bg-red-600 backdrop-blur flex items-center justify-center text-white transition-all"
                  title={p.isMuted ? 'Request unmute' : 'Mute'}
                >
                  {p.isMuted ? <Mic size={12} /> : <MicOff size={12} />}
                </button>
              )}
            </div>

            {/* Quality indicator */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`flex items-end gap-px h-3`}>
                {[4, 7, 10].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full ${
                      p.connectionQuality === 'good' ? 'bg-emerald-400' :
                      p.connectionQuality === 'fair' && i < 2 ? 'bg-amber-400' :
                      p.connectionQuality === 'fair' ? 'bg-gray-700' :
                      i === 0 ? 'bg-red-400' : 'bg-gray-700'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
