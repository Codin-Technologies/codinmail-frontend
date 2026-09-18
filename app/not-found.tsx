import Link from 'next/link';
import { MailQuestion, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground/40"
          style={{ animation: 'not-found-float 3s ease-in-out infinite' }}
        >
          <MailQuestion className="h-10 w-10" strokeWidth={1.5} />
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
          Thread not found
        </h1>
        <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
          The message you&apos;re looking for doesn&apos;t exist or has been moved
          to another folder.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to inbox
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <Search className="h-4 w-4" />
              Search messages
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes not-found-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
