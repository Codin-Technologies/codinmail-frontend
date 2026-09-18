'use client';

import { CodinFile } from '@/lib/files/types';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const PROMPTS = [
  { id: 'summary', label: 'Summarize' },
  { id: 'dates', label: 'Extract key dates' },
  { id: 'actions', label: 'Extract action items' },
  { id: 'ask', label: 'Ask about this file' },
  { id: 'tags', label: 'Suggest tags' },
  { id: 'filename', label: 'Suggest filename' },
];

export function AIFileAssistant({ file, compact }: { file: CodinFile; compact?: boolean }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  const run = (id: string, extra?: string) => {
    const q = extra || question;
    if (id === 'summary') {
      setAnswer(
        `${file.name} is a ${file.kind.toUpperCase()} owned by ${file.ownerName}. ${file.description || file.previewText?.slice(0, 180) || 'No extracted summary is stored yet.'}`
      );
    } else if (id === 'dates') {
      setAnswer('Cited dates: September 2, 2026 (kickoff), September 23, 2026 (invoice due), Net 30 payment terms. [p.1]');
    } else if (id === 'actions') {
      setAnswer('1. Confirm payment terms with Finance.\n2. Attach this file to the Client Review meeting.\n3. Create a task to revise the proposal.');
    } else if (id === 'tags') {
      setAnswer('Suggested tags: Proposal, Client, ABC Logistics, Contract.');
    } else if (id === 'filename') {
      setAnswer('Suggested filename: ABC-Logistics-Project-Proposal-v4.pdf');
    } else {
      setAnswer(
        q
          ? `Based on ${file.name}: The document specifies payment terms of Net 30 from invoice date. [Payment terms, p.1]`
          : 'Ask a question about this document to keep the conversation attached to the file.'
      );
    }
  };

  return (
    <div className={compact ? 'space-y-3' : 'rounded-lg border border-border bg-card p-4 space-y-3'}>
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={14} />
          Ask about this document
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => run(p.id)}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-semibold hover:bg-muted"
          >
            {p.label}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run('ask', question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What are the payment terms?"
          aria-label="Ask about this document"
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
          Ask
        </button>
      </form>
      {answer && (
        <div className="rounded-md border border-border bg-background p-3 text-xs leading-relaxed whitespace-pre-wrap">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI</p>
          {answer}
          <button
            className="mt-3 block text-[11px] font-semibold text-primary hover:underline"
            onClick={() => toast.message('Review these items before creating tasks. Nothing was changed.')}
          >
            Create tasks from action items
          </button>
        </div>
      )}
    </div>
  );
}
