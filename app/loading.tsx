'use client';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="relative mb-8 flex items-center justify-center">
        <div
          className="absolute h-20 w-20 rounded-full border-2 border-dashed border-primary/25"
          style={{ animation: 'loader-spin 8s linear infinite' }}
        />
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-lg"
          style={{ animation: 'loader-pulse 2s ease-in-out infinite' }}
        >
          <span className="text-xl font-extrabold tracking-tighter">C</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
          Loading your workspace
        </h2>
        <p className="text-sm text-muted-foreground">
          Syncing your messages
          <span className="loading-dots ml-0.5 inline-flex">
            <span
              className="inline-block"
              style={{ animation: 'dot-bounce 1.4s ease-in-out infinite', animationDelay: '0ms' }}
            >
              .
            </span>
            <span
              className="inline-block"
              style={{ animation: 'dot-bounce 1.4s ease-in-out infinite', animationDelay: '150ms' }}
            >
              .
            </span>
            <span
              className="inline-block"
              style={{ animation: 'dot-bounce 1.4s ease-in-out infinite', animationDelay: '300ms' }}
            >
              .
            </span>
          </span>
        </p>
      </div>

      <style>{`
        @keyframes loader-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loader-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
