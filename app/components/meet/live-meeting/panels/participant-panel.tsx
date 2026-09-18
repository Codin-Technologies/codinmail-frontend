'use client';

import { MeetingParticipant } from '@/lib/meet/types';
import {
  Check,
  Copy,
  Hand,
  Mic,
  MicOff,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type ParticipantPanelProps = {
  participants: MeetingParticipant[];
  currentUserId: string;
  meetingCode: string;
  onClose: () => void;
  onToggleMute: (id: string) => void;
  onTogglePin: (id: string) => void;
  pinnedId: string | null;
  onInviteUser: (name: string, email: string) => void;
};

export function ParticipantPanel({
  participants,
  currentUserId,
  meetingCode,
  onClose,
  onToggleMute,
  onTogglePin,
  pinnedId,
  onInviteUser,
}: ParticipantPanelProps) {
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const filtered = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    onInviteUser(inviteName.trim(), inviteEmail.trim());
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Panel Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h3 className="font-bold text-sm">
            People ({participants.length})
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Invite people"
          >
            <UserPlus size={15} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border/70">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar text-xs">
        {filtered.map((p) => {
          const isSelf = p.id === currentUserId;
          const isPinned = pinnedId === p.id;

          return (
            <div
              key={p.id}
              className="p-2 rounded-xl hover:bg-muted/40 transition-colors flex items-center justify-between gap-2 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-muted text-foreground font-bold text-xs grid place-items-center shrink-0 overflow-hidden border border-border">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0)
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold truncate text-foreground">
                      {p.name} {isSelf && '(You)'}
                    </p>
                    {p.role === 'host' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                        Host
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{p.email}</p>
                </div>
              </div>

              {/* Status Icons & Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {p.isHandRaised && (
                  <span className="p-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" title="Hand raised">
                    <Hand size={13} />
                  </span>
                )}

                <button
                  onClick={() => onTogglePin(p.id)}
                  className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
                    isPinned ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                  }`}
                  title={isPinned ? 'Unpin' : 'Pin to stage'}
                >
                  <Pin size={13} />
                </button>

                <button
                  onClick={() => onToggleMute(p.id)}
                  className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
                    p.isMuted ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                  title={p.isMuted ? 'Muted' : 'Mute participant'}
                >
                  {p.isMuted ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel Bottom Invite Button */}
      <div className="p-3 border-t border-border bg-card">
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full h-9 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus size={14} className="text-primary" />
          <span>Add Attendees</span>
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm">Invite to Meeting</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[10px] uppercase text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Rivera"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] uppercase text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jordan@acme.com"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
