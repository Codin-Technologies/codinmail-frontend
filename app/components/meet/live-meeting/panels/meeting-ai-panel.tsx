'use client';

import { Meeting, MeetingAISummary } from '@/lib/meet/types';
import {
  Bot,
  Check,
  CheckCircle2,
  CheckSquare,
  FileText,
  Mail,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type MeetingAIPanelProps = {
  meeting: Meeting;
  onAutoAddTasks: (tasks: { title: string; assignee?: string; dueDate?: string }[]) => void;
  onOpenEmailComposer?: (draft: { subject: string; recipients: string[]; body: string }) => void;
  onClose: () => void;
};

export function MeetingAIPanel({
  meeting,
  onAutoAddTasks,
  onOpenEmailComposer,
  onClose,
}: MeetingAIPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiData, setAiData] = useState<MeetingAISummary | undefined>(meeting.aiSummary);

  const handleGenerateAISummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated: MeetingAISummary = {
        summary:
          'Discussion focused on unifying Google Meet infrastructure with Codin business modules. The team confirmed complete provider abstraction and validated action items tracking in real time.',
        keyDecisions: [
          'Approved native Codin side panels during Google Meet conferences.',
          'Enabled direct follow-up email generation from call minutes.',
        ],
        extractedActionItems: [
          {
            title: 'Verify Google Meet embed SDK boundary in production build',
            assignee: 'Lee Robinson',
            dueDate: '2026-08-25',
          },
          {
            title: 'Send meeting recap email to executive board',
            assignee: 'Alex Morgan',
            dueDate: '2026-08-24',
          },
        ],
        followUpEmailDraft: {
          subject: `Meeting Recap & Next Steps: ${meeting.title}`,
          recipients: meeting.participants.map((p) => p.email),
          body: `Hi team,\n\nHere is a quick recap of our session today:\n\nKey Decisions:\n• Approved native Codin side panels for notes and tasks.\n• Confirmed Google Meet adapter isolation.\n\nAction Items:\n• Lee Robinson: Verify embed SDK boundary\n• Alex Morgan: Send executive recap\n\nBest,\nAlex Morgan`,
        },
        sentiment: 'productive',
        topicsDiscussed: ['Infrastructure', 'Provider Abstraction', 'Tasks Integration'],
      };
      setAiData(generated);
      setIsGenerating(false);
      toast.success('AI Meeting Summary generated');
    }, 1200);
  };

  const handleConvertActionItems = () => {
    if (aiData?.extractedActionItems) {
      onAutoAddTasks(aiData.extractedActionItems);
      toast.success('Action items converted into Codin Tasks');
    }
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          <h3 className="font-bold text-sm">AI Meeting Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <Bot size={14} />
              <span>Real-Time Intelligence</span>
            </span>
            <button
              onClick={handleGenerateAISummary}
              disabled={isGenerating}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-900 hover:opacity-80 flex items-center gap-1"
            >
              <RefreshCw size={10} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Analyzing...' : 'Generate Now'}</span>
            </button>
          </div>
          <p className="text-[11px] opacity-85 leading-relaxed">
            AI listens to transcript highlights to extract decisions, action items, and draft follow-up correspondence.
          </p>
        </div>

        {aiData ? (
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Executive Summary
              </span>
              <p className="p-3 rounded-xl border border-border bg-background leading-relaxed text-foreground/90 font-medium">
                {aiData.summary}
              </p>
            </div>

            {/* Key Decisions */}
            <div>
              <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Key Decisions
              </span>
              <div className="space-y-1.5">
                {aiData.keyDecisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-border bg-background flex items-start gap-2"
                  >
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{dec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Action Items */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                  Extracted Action Items ({aiData.extractedActionItems.length})
                </span>
                <button
                  onClick={handleConvertActionItems}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={10} />
                  <span>Sync to Tasks</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {aiData.extractedActionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-border bg-card flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Assignee: {item.assignee || 'Unassigned'} · Due {item.dueDate || 'Soon'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Email Draft */}
            {aiData.followUpEmailDraft && (
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    Draft Follow-up Email
                  </span>
                  <button
                    onClick={() => {
                      if (onOpenEmailComposer && aiData.followUpEmailDraft) {
                        onOpenEmailComposer(aiData.followUpEmailDraft);
                      } else {
                        toast.success('Email draft copied to clipboard');
                      }
                    }}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Mail size={11} />
                    <span>Open in Mail</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5">
                  <p className="font-bold text-foreground truncate">
                    Subject: {aiData.followUpEmailDraft.subject}
                  </p>
                  <p className="text-[11px] text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {aiData.followUpEmailDraft.body}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-2">
            <Sparkles size={24} className="mx-auto text-amber-500" />
            <p className="font-semibold text-muted-foreground">No AI summary generated yet</p>
            <button
              onClick={handleGenerateAISummary}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow"
            >
              Analyze Call Highlights
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
