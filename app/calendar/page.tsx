import { ApplicationShell } from '@/app/components/application-shell';
import { getThreadsForFolder } from '@/lib/db/queries';

export const metadata = {
  title: 'Calendar Workspace | Codin Unified Platform',
  description: 'Manage meetings, availability, team schedules, and AI-assisted scheduling.',
};

export default async function CalendarPage() {
  let threads: any[] = [];
  let dataUnavailable = false;
  try {
    threads = await getThreadsForFolder('inbox');
  } catch {
    dataUnavailable = true;
  }

  return (
    <div className="flex h-screen w-full">
      <ApplicationShell
        folderName="inbox"
        threads={threads}
        initialWorkspace="calendar"
        dataUnavailable={dataUnavailable}
      />
    </div>
  );
}
