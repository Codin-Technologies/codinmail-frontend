'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Globe2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/lib/stores/workspace-context';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { createWorkspace, status } = useWorkspace();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [country, setCountry] = useState('Kenya');
  const [timezone, setTimezone] = useState('Africa/Nairobi');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [name, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createWorkspace({ name: name.trim(), slug: slug || name.trim().toLowerCase(), industry, country, timezone, hasMailbox: false });
      router.push('/onboarding');
    } catch {
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">A workspace is where your team works together</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Workspace Name</label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Codin Technology"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Workspace URL / Slug</label>
            <div className="relative">
              <Globe2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="codin-technology"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Used in your workspace URL and shared links</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option>Technology</option>
                <option>Logistics</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option>Kenya</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option>Africa/Nairobi</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Europe/Berlin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasMailbox"
              checked={undefined}
              onChange={() => {}}
              className="rounded border-input"
            />
            <label htmlFor="hasMailbox" className="text-xs text-muted-foreground">
              Connect an email mailbox (optional — you can do this later)
            </label>
          </div>

          <Button type="submit" className="h-10 w-full text-sm font-semibold" disabled={isSubmitting || status === 'loading'}>
            {isSubmitting || status === 'loading' ? 'Creating workspace…' : 'Create Workspace'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push('/onboarding/join-workspace')}
            className="text-xs text-primary hover:underline"
          >
            Already have an invitation? Join a workspace
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
