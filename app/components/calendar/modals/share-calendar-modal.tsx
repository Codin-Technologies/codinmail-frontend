'use client';

import { CalendarItem } from '@/lib/calendar/types';
import {
  Check,
  Copy,
  Globe,
  Lock,
  Plus,
  Share2,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

type ShareCalendarModalProps = {
  calendar: CalendarItem;
  onClose: () => void;
};

export function ShareCalendarModal({
  calendar,
  onClose,
}: ShareCalendarModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'busy' | 'edit'>('view');
  const [sharedUsers, setSharedUsers] = useState([
    { email: 'maya.chen@codin.io', role: 'edit' },
    { email: 'lee@codin.io', role: 'view' },
  ]);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSharedUsers((prev) => [...prev, { email: inviteEmail.trim(), role: permission }]);
    setInviteEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://calendar.codin.io/share/${calendar.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-primary" />
            <h3 className="font-bold text-base text-foreground">
              Share "{calendar.name}"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Invite Input */}
          <form onSubmit={handleAddMember} className="space-y-2">
            <label className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Add People or Teams
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@codin.io"
                className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'view' | 'busy' | 'edit')}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none"
              >
                <option value="view">Can view all</option>
                <option value="busy">Free/Busy only</option>
                <option value="edit">Can edit</option>
              </select>
              <button
                type="submit"
                disabled={!inviteEmail.trim()}
                className="h-9 px-3 rounded-lg bg-primary text-white font-bold text-xs disabled:opacity-50"
              >
                Invite
              </button>
            </div>
          </form>

          {/* Current Members List */}
          <div className="space-y-2">
            <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Who has access
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{calendar.ownerName} (Owner)</p>
                  <p className="text-[10px] text-muted-foreground">{calendar.ownerEmail}</p>
                </div>
                <span className="text-[10px] font-bold text-primary">Owner</span>
              </div>

              {sharedUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between"
                >
                  <p className="font-medium text-foreground">{user.email}</p>
                  <span className="text-[10px] text-muted-foreground font-semibold capitalize">
                    {user.role === 'view' ? 'Can view' : user.role === 'edit' ? 'Can edit' : 'Free/Busy'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Public Link Share */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-foreground">Shareable Calendar Link</p>
              <p className="text-[10px] text-muted-foreground">
                Anyone with this link can subscribe in iCal / Google.
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted shrink-0 flex items-center gap-1.5"
            >
              <Copy size={13} />
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
