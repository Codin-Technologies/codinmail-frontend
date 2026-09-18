import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/stores/auth-context';
import { WorkspaceProvider } from '@/lib/stores/workspace-context';
import { ThemeProvider } from '@/lib/stores/theme-context';
import { QueryProvider } from '@/lib/api/query-provider';
import { RouteGuard } from '@/app/components/route-guard';
import { Suspense } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Codin | Unified communication workspace',
  description: 'A focused workspace for email, chat, calendar, tasks, and files.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <body>
         <AuthProvider>
            <WorkspaceProvider>
              <ThemeProvider>
                <QueryProvider>
                  <Suspense fallback={null}>
                    <RouteGuard>
                      <main className="min-h-screen">{children}</main>
                    </RouteGuard>
                  </Suspense>
                </QueryProvider>
                <Toaster closeButton />
              </ThemeProvider>
            </WorkspaceProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
