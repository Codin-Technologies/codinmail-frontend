import {
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
  Presentation,
} from 'lucide-react';
import { FileKind } from '@/lib/files/types';

const MAP: Record<FileKind, { icon: typeof FileText; label: string; className: string }> = {
  pdf: { icon: FileText, label: 'PDF', className: 'text-primary bg-primary/10' },
  docx: { icon: FileType, label: 'DOC', className: 'text-foreground bg-muted' },
  xlsx: { icon: FileSpreadsheet, label: 'XLS', className: 'text-foreground bg-muted' },
  pptx: { icon: Presentation, label: 'PPT', className: 'text-foreground bg-muted' },
  jpg: { icon: FileImage, label: 'JPG', className: 'text-foreground bg-muted' },
  png: { icon: FileImage, label: 'PNG', className: 'text-foreground bg-muted' },
  mp4: { icon: FileVideo, label: 'MP4', className: 'text-foreground bg-muted' },
  zip: { icon: FileArchive, label: 'ZIP', className: 'text-foreground bg-muted' },
  txt: { icon: FileText, label: 'TXT', className: 'text-foreground bg-muted' },
  csv: { icon: FileSpreadsheet, label: 'CSV', className: 'text-foreground bg-muted' },
  audio: { icon: FileAudio, label: 'AUD', className: 'text-foreground bg-muted' },
  other: { icon: FileText, label: 'FILE', className: 'text-muted-foreground bg-muted' },
};

export function FileTypeIcon({ kind, size = 'md' }: { kind: FileKind; size?: 'sm' | 'md' | 'lg' }) {
  const item = MAP[kind] ?? MAP.other;
  const Icon = item.icon;
  const box = size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg ${box} ${item.className}`} aria-hidden>
      <Icon size={iconSize} />
    </span>
  );
}

export function fileKindShort(kind: FileKind) {
  return MAP[kind]?.label ?? 'FILE';
}
