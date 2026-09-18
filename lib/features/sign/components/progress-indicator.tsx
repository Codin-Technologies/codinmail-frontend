'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  label?: string;
  currentStep?: React.ReactNode;
  size?: 'sm' | 'md';
}

export function ProgressIndicator({ completed, total, label, currentStep, size = 'md' }: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 overflow-hidden rounded-full bg-muted', barHeight)}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {currentStep && <div>{currentStep}</div>}
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
