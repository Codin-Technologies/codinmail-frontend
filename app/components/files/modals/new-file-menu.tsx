'use client';

import { FilePlus, FolderPlus, LayoutTemplate, Upload, FolderUp } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function NewFileMenu({
  onClose,
  onUploadFiles,
  onUploadFolder,
  onNewFolder,
  onTemplate,
}: {
  onClose: () => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
  onNewFolder: () => void;
  onTemplate: (kind: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-11 z-30 w-56 rounded-lg border border-border bg-card py-1 shadow-lg" role="menu">
      <MenuItem icon={Upload} label="Upload files" onClick={onUploadFiles} />
      <MenuItem icon={FolderUp} label="Upload folder" onClick={onUploadFolder} />
      <div className="my-1 border-t border-border" />
      <MenuItem icon={FolderPlus} label="New folder" onClick={onNewFolder} />
      <div className="my-1 border-t border-border" />
      <MenuItem icon={FilePlus} label="New document" onClick={() => onTemplate('document')} />
      <MenuItem icon={FilePlus} label="New spreadsheet" onClick={() => onTemplate('spreadsheet')} />
      <MenuItem icon={FilePlus} label="New presentation" onClick={() => onTemplate('presentation')} />
      <MenuItem icon={LayoutTemplate} label="Create from template" onClick={() => onTemplate('template')} />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: typeof Upload; label: string; onClick: () => void }) {
  return (
    <button role="menuitem" onClick={onClick} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium hover:bg-muted">
      <Icon size={14} />
      {label}
    </button>
  );
}
