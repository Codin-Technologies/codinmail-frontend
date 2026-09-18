'use client';

import { FileSignature, Shield, Clock, Mail, Globe } from 'lucide-react';

const SIGN_SETTINGS = [
  { id: 'signature', label: 'Digital signature', icon: FileSignature, desc: 'Configure default signing options' },
  { id: 'security', label: 'Security & compliance', icon: Shield, desc: 'Authentication and tamper protection' },
  { id: 'reminders', label: 'Reminders', icon: Clock, desc: 'Automatic reminder settings' },
  { id: 'emails', label: 'Email templates', icon: Mail, desc: 'Customize email notifications' },
  { id: 'branding', label: 'Branding', icon: Globe, desc: 'Add your logo and brand colors' },
];

export function SignSettings() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Sign Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure signing workflow and notification preferences.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-3">
          {SIGN_SETTINGS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
                <item.icon size={14} className="text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
