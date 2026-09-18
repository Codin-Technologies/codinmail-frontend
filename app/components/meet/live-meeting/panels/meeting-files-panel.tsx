'use client';

import { MeetingFile } from '@/lib/meet/types';
import {
  Download,
  FileText,
  FolderOpen,
  Plus,
  UploadCloud,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type MeetingFilesPanelProps = {
  files: MeetingFile[];
  onUploadFile: (name: string, size: string, type: string) => void;
  onClose: () => void;
};

export function MeetingFilesPanel({
  files,
  onUploadFile,
  onClose,
}: MeetingFilesPanelProps) {
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onUploadFile(newFileName.trim(), '2.4 MB', 'PDF');
    setNewFileName('');
    setShowAttachModal(false);
    toast.success(`Attached "${newFileName}" from Codin Files`);
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <h3 className="font-bold text-sm">Meeting Files ({files.length})</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Files referenced in this meeting remain securely hosted in the Codin Files workspace.
        </p>

        {files.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-2">
            <FolderOpen size={24} className="mx-auto text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">No files attached yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.size} · by {file.uploadedBy.split(' ')[0]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toast.success(`Downloading ${file.name}...`)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                  title="Download"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Attach Action */}
      <div className="p-3 border-t border-border bg-card">
        <button
          onClick={() => setShowAttachModal(true)}
          className="w-full h-9 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          <span>Attach from Codin Files</span>
        </button>
      </div>

      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4 text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm">Attach File to Meeting</h3>
              <button
                onClick={() => setShowAttachModal(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAttachSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[10px] uppercase text-muted-foreground mb-1">
                  Document Name / Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. Q3_Financial_Review.pdf"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90"
                >
                  Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
