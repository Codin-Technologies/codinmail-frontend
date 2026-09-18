import { ApplicationShell } from '@/app/components/application-shell';
import { getThreadsForFolder } from '@/lib/db/queries';

export const metadata = {
  title: 'Tasks Workspace | Codin Unified Platform',
  description: 'Track action items, manage team workload, and connect tasks to conversations.',
};

export default async function TasksPage() {
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
        initialWorkspace="tasks"
        dataUnavailable={dataUnavailable}
      />
    </div>
  );
}
