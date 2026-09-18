import { ApplicationShell } from '@/app/components/application-shell';
import { getThreadsForFolder } from '@/lib/db/queries';

export const metadata = {
  title: 'Codin Files | Documents and work objects',
  description: 'Store, share, and connect files with Mail, Meet, Calendar, Tasks, and Contacts.',
};

export default async function FilesPage() {
  let threads: any[] = [];
  let dataUnavailable = false;
  try {
    threads = await getThreadsForFolder('inbox');
  } catch {
    dataUnavailable = true;
  }

  return (
    <div className="flex h-screen w-full">
      <ApplicationShell folderName="inbox" threads={threads} initialWorkspace="files" dataUnavailable={dataUnavailable} />
    </div>
  );
}
