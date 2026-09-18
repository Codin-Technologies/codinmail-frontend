'use client';

import { Meeting } from '@/lib/meet/types';
import { Link as LinkIcon, Video, X } from 'lucide-react';
import React, { useState } from 'react';

type JoinMeetingModalProps = {
  onJoinByCode: (codeOrUrl: string) => void;
  onClose: () => void;
};

export function JoinMeetingModal({
  onJoinByCode,
  onClose,
}: JoinMeetingModalProps) {
  const [inputCode, setInputCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onJoinByCode(inputCode.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-primary" />
            <h3 className="font-bold text-base text-foreground">Join a Meeting</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Enter Meeting Code or URL
            </label>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                required
                autoFocus
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. ops-weekly or meet.google.com/abc-xyz"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              You can paste a Codin link, Google Meet code, or direct invite ID.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!inputCode.trim()}
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:opacity-90 disabled:opacity-50"
            >
              Join Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
