'use client';

import { ExternalCalendarSync } from '@/lib/calendar/types';
import {
  Check,
  Cloud,
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

type CalendarSyncModalProps = {
  syncs: ExternalCalendarSync[];
  onToggleSync: (syncId: string) => void;
  onTriggerSyncNow: (syncId: string) => void;
  onClose: () => void;
};

export function CalendarSyncModal({
  syncs,
  onToggleSync,
  onTriggerSyncNow,
  onClose,
}: CalendarSyncModalProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncClick = (id: string) => {
    setSyncingId(id);
    onTriggerSyncNow(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-primary" />
            <h3 className="font-bold text-base text-foreground">
              External Calendar Sync
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
        <div className="p-6 space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Connect your corporate or personal accounts to automatically synchronize two-way events, invitations, and availability.
          </p>

          <div className="space-y-3">
            {syncs.map((sync) => {
              const isConnected = sync.status === 'connected';
              const isSyncing = syncingId === sync.id;

              return (
                <div
                  key={sync.id}
                  className="p-4 rounded-xl border border-border bg-background flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border grid place-items-center shrink-0">
                      {sync.provider === 'google' ? (
                        <span className="font-bold text-sm text-blue-500">G</span>
                      ) : sync.provider === 'outlook' ? (
                        <span className="font-bold text-sm text-sky-600">M</span>
                      ) : (
                        <span className="font-bold text-sm text-gray-700"></span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-sm text-foreground">
                          {sync.name}
                        </strong>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            isConnected
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isConnected ? 'Active' : 'Disconnected'}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {sync.email}
                      </p>
                      {isConnected && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Last sync: {sync.lastSynced} · Every {sync.autoSyncIntervalMinutes}m
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleSyncClick(sync.id)}
                          disabled={isSyncing}
                          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          title="Sync now"
                        >
                          <RefreshCw
                            size={14}
                            className={isSyncing ? 'animate-spin text-primary' : ''}
                          />
                        </button>
                        <button
                          onClick={() => onToggleSync(sync.id)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-red-600"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onToggleSync(sync.id)}
                        className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
