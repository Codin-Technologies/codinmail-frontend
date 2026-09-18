'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from './drizzle';
import { emails, folders, threadFolders, threads, users } from './schema';

const sendEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  recipientEmail: z.string().email('Invalid email address'),
});

const createContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  company: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createContactAction(_: any, formData: FormData) {
  const rawFormData = {
    firstName: formData.get('firstName')?.toString() ?? '',
    lastName: formData.get('lastName')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    company: formData.get('company')?.toString() ?? '',
    jobTitle: formData.get('jobTitle')?.toString() ?? '',
    phone: formData.get('phone')?.toString() ?? '',
    notes: formData.get('notes')?.toString() ?? '',
  };

  if (process.env.VERCEL_ENV === 'production') {
    return { error: 'Contact creation is only available locally for now.', previous: rawFormData };
  }

  try {
    const contact = createContactSchema.parse(rawFormData);
    await db.insert(users).values({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company || null,
      jobTitle: contact.jobTitle || null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, previous: rawFormData };
    }
    return { error: 'Could not create contact. The email may already exist.', previous: rawFormData };
  }

  revalidatePath('/contacts');
  redirect('/contacts');
}

export async function sendEmailAction(_: any, formData: FormData) {
  let newThread;
  let returnTo = formData.get('returnTo');
  let rawFormData = {
    subject: formData.get('subject'),
    body: formData.get('body'),
    recipientEmail: formData.get('recipientEmail'),
  };

  if (process.env.VERCEL_ENV === 'production') {
    return {
      error: 'Only works on localhost for now',
      previous: rawFormData,
    };
  }

  try {
    let validatedFields = sendEmailSchema.parse({
      subject: formData.get('subject'),
      body: formData.get('body'),
      recipientEmail: formData.get('recipientEmail'),
    });

    let { subject, body, recipientEmail } = validatedFields;

    let [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.email, recipientEmail));

    if (!recipient) {
      [recipient] = await db
        .insert(users)
        .values({ email: recipientEmail })
        .returning();
    }

    let result = await db
      .insert(threads)
      .values({
        subject,
        lastActivityDate: new Date(),
      })
      .returning();
    newThread = result[0];

    await db.insert(emails).values({
      threadId: newThread.id,
      senderId: 1, // Assuming the current user's ID is 1. Replace this with the actual user ID.
      recipientId: recipient.id,
      subject,
      body,
      sentDate: new Date(),
    });

    let [sentFolder] = await db
      .select()
      .from(folders)
      .where(eq(folders.name, 'Sent'));

    await db.insert(threadFolders).values({
      threadId: newThread.id,
      folderId: sentFolder.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, previous: rawFormData };
    }
    return {
      error: 'Failed to send email. Please try again.',
      previous: rawFormData,
    };
  }

  revalidatePath('/', 'layout');
  let destination = typeof returnTo === 'string' && ['inbox', 'starred', 'drafts', 'sent', 'archive', 'trash'].includes(returnTo)
    ? returnTo
    : 'inbox';
  redirect(`/f/${destination}`);
}

export async function moveThreadToDone(_: any, formData: FormData) {
  if (process.env.VERCEL_ENV === 'production') {
    return {
      error: 'Only works on localhost for now',
    };
  }

  let threadId = formData.get('threadId');

  if (!threadId || typeof threadId !== 'string') {
    return { error: 'Invalid thread ID', success: false };
  }

  try {
    let doneFolder = await db.query.folders.findFirst({
      where: eq(folders.name, 'Archive'),
    });

    if (!doneFolder) {
      return { error: 'Done folder not found', success: false };
    }

    let parsedThreadId = parseInt(threadId, 10);

    await db
      .delete(threadFolders)
      .where(eq(threadFolders.threadId, parsedThreadId));

    await db.insert(threadFolders).values({
      threadId: parsedThreadId,
      folderId: doneFolder.id,
    });

    revalidatePath('/f/[name]');
    revalidatePath('/f/[name]/[id]');
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to move thread to Done:', error);
    return { success: false, error: 'Failed to move thread to Done' };
  }
}

export async function moveThreadToTrash(_: any, formData: FormData) {
  if (process.env.VERCEL_ENV === 'production') {
    return {
      error: 'Only works on localhost for now',
    };
  }

  let threadId = formData.get('threadId');

  if (!threadId || typeof threadId !== 'string') {
    return { error: 'Invalid thread ID', success: false };
  }

  try {
    let trashFolder = await db.query.folders.findFirst({
      where: eq(folders.name, 'Trash'),
    });

    if (!trashFolder) {
      return { error: 'Trash folder not found', success: false };
    }

    let parsedThreadId = parseInt(threadId, 10);

    await db
      .delete(threadFolders)
      .where(eq(threadFolders.threadId, parsedThreadId));

    await db.insert(threadFolders).values({
      threadId: parsedThreadId,
      folderId: trashFolder.id,
    });

    revalidatePath('/f/[name]');
    revalidatePath('/f/[name]/[id]');
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to move thread to Trash:', error);
    return { success: false, error: 'Failed to move thread to Trash' };
  }
}
