import { ApplicationShell } from '@/app/components/application-shell';
import { getThreadsForFolder } from '@/lib/db/queries';

export const metadata = {
  title: 'Codin Meet | Enterprise Video Conferencing & Collaboration',
  description: 'Native video meetings connected with Mail, Chat, Calendar, Tasks, Files, and AI.',
};

export default async function MeetPage() {
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
        initialWorkspace="meet"
        dataUnavailable={dataUnavailable}
      />
    </div>
  );
}
