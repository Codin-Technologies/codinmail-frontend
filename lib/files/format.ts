import { FileKind } from './types';

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeDay(iso: string, today = '2026-08-24') {
  const date = iso.slice(0, 10);
  const d = new Date(date);
  const t = new Date(today);
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function kindFromName(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'xls' || ext === 'xlsx') return 'xlsx';
  if (ext === 'ppt' || ext === 'pptx') return 'pptx';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png' || ext === 'gif' || ext === 'webp') return 'png';
  if (ext === 'mp4' || ext === 'mov' || ext === 'webm') return 'mp4';
  if (ext === 'zip' || ext === 'rar') return 'zip';
  if (ext === 'txt' || ext === 'md') return 'txt';
  if (ext === 'csv') return 'csv';
  if (ext === 'mp3' || ext === 'wav') return 'audio';
  return 'other';
}

export function mimeFromKind(kind: FileKind) {
  const map: Record<FileKind, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    png: 'image/png',
    mp4: 'video/mp4',
    zip: 'application/zip',
    txt: 'text/plain',
    csv: 'text/csv',
    audio: 'audio/mpeg',
    other: 'application/octet-stream',
  };
  return map[kind];
}

export function kindLabel(kind: FileKind) {
  const map: Record<FileKind, string> = {
    pdf: 'PDF document',
    docx: 'Word document',
    xlsx: 'Spreadsheet',
    pptx: 'Presentation',
    jpg: 'Image',
    png: 'Image',
    mp4: 'Video',
    zip: 'Archive',
    txt: 'Text',
    csv: 'CSV',
    audio: 'Audio',
    other: 'File',
  };
  return map[kind];
}

export function uniqueFileName(name: string, existing: string[]) {
  if (!existing.includes(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot === -1 ? name : name.slice(0, dot);
  const ext = dot === -1 ? '' : name.slice(dot);
  let i = 1;
  while (existing.includes(`${base} (${i})${ext}`)) i += 1;
  return `${base} (${i})${ext}`;
}
