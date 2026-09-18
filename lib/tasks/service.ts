import { mockLabels, mockTasks } from './mock-data';
import {
  Subtask,
  Task,
  TaskAttachment,
  TaskComment,
  TaskFilters,
  TaskLabel,
  TaskStats,
  TASK_USERS,
} from './types';

let tasks: Task[] = [...mockTasks];
let labels: TaskLabel[] = [...mockLabels];

function stamp(): string {
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getTasks(filters?: TaskFilters): Task[] {
  let result = [...tasks];

  if (filters) {
    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.assignee !== 'all') {
      result = result.filter((t) => t.assigneeId === filters.assignee);
    }
    if (filters.label !== 'all') {
      result = result.filter((t) => t.labels.some((l) => l.id === filters.label));
    }
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.labels.some((l) => l.name.toLowerCase().includes(term))
      );
    }
    if (filters.dateRange !== 'all') {
      const today = new Date('2026-08-25');
      today.setHours(0, 0, 0, 0);
      result = result.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today':
            return diffDays === 0;
          case 'overdue':
            return diffDays < 0 && t.status !== 'completed' && t.status !== 'cancelled';
          case 'week':
            return diffDays >= 0 && diffDays <= 7;
          case 'month':
            return diffDays >= 0 && diffDays <= 30;
          default:
            return true;
        }
      });
    }
  }

  return result;
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function createTask(data: Partial<Task>): Task {
  const now = stamp();
  const newTask: Task = {
    id: generateId('task'),
    organizationId: data.organizationId ?? 'org-codin',
    creatorId: data.creatorId ?? 'user-kelvin',
    assigneeId: data.assigneeId ?? null,
    title: data.title ?? 'Untitled Task',
    description: data.description ?? '',
    status: data.status ?? 'todo',
    priority: data.priority ?? 'medium',
    dueDate: data.dueDate ?? null,
    dueTime: data.dueTime ?? null,
    reminder: data.reminder ?? 'none',
    recurrence: data.recurrence ?? 'none',
    labels: data.labels ?? [],
    subtasks: data.subtasks ?? [],
    attachments: data.attachments ?? [],
    comments: data.comments ?? [],
    activity: [
      {
        id: generateId('act'),
        action: 'created task',
        userId: data.creatorId ?? 'user-kelvin',
        userName: TASK_USERS.find((u) => u.id === data.creatorId)?.name ?? 'Kelvin Kijazi',
        createdAt: now,
      },
    ],
    relatedItems: data.relatedItems ?? [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
  tasks = [newTask, ...tasks];
  return newTask;
}

export function updateTask(id: string, data: Partial<Task>): Task | undefined {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const updated: Task = {
    ...tasks[index],
    ...data,
    id: tasks[index].id,
    createdAt: tasks[index].createdAt,
    updatedAt: stamp(),
  };
  tasks[index] = updated;
  return updated;
}

export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

export function completeTask(id: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const now = stamp();
  tasks[index] = {
    ...tasks[index],
    status: 'completed',
    completedAt: now,
    updatedAt: now,
  };
  return tasks[index];
}

export function reopenTask(id: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const now = stamp();
  tasks[index] = {
    ...tasks[index],
    status: 'todo',
    completedAt: null,
    updatedAt: now,
  };
  return tasks[index];
}

export function assignTask(id: string, userId: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const user = TASK_USERS.find((u) => u.id === userId);
  const now = stamp();
  tasks[index] = {
    ...tasks[index],
    assigneeId: userId,
    updatedAt: now,
  };
  if (user) {
    tasks[index].activity.unshift({
      id: generateId('act'),
      action: `assigned to ${user.name}`,
      userId: 'user-kelvin',
      userName: 'Kelvin Kijazi',
      createdAt: now,
    });
  }
  return tasks[index];
}

export function createSubtask(taskId: string, data: Partial<Subtask>): Subtask | undefined {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return undefined;
  const newSubtask: Subtask = {
    id: generateId('sub'),
    title: data.title ?? 'New subtask',
    completed: false,
    createdAt: stamp(),
  };
  tasks[taskIndex].subtasks.push(newSubtask);
  tasks[taskIndex].updatedAt = stamp();
  return newSubtask;
}

export function updateSubtask(taskId: string, subtaskId: string, data: Partial<Subtask>): Subtask | undefined {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return undefined;
  const subtaskIndex = tasks[taskIndex].subtasks.findIndex((s) => s.id === subtaskId);
  if (subtaskIndex === -1) return undefined;
  tasks[taskIndex].subtasks[subtaskIndex] = {
    ...tasks[taskIndex].subtasks[subtaskIndex],
    ...data,
    id: tasks[taskIndex].subtasks[subtaskIndex].id,
  };
  tasks[taskIndex].updatedAt = stamp();
  return tasks[taskIndex].subtasks[subtaskIndex];
}

export function toggleSubtask(taskId: string, subtaskId: string): Subtask | undefined {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return undefined;
  const subtaskIndex = tasks[taskIndex].subtasks.findIndex((s) => s.id === subtaskId);
  if (subtaskIndex === -1) return undefined;
  tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
  tasks[taskIndex].updatedAt = stamp();
  return tasks[taskIndex].subtasks[subtaskIndex];
}

export function addLabel(taskId: string, label: TaskLabel): Task | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  if (tasks[index].labels.some((l) => l.id === label.id)) return tasks[index];
  tasks[index] = {
    ...tasks[index],
    labels: [...tasks[index].labels, label],
    updatedAt: stamp(),
  };
  return tasks[index];
}

export function removeLabel(taskId: string, labelId: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  tasks[index] = {
    ...tasks[index],
    labels: tasks[index].labels.filter((l) => l.id !== labelId),
    updatedAt: stamp(),
  };
  return tasks[index];
}

export function addComment(taskId: string, data: Partial<TaskComment>): TaskComment | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  const comment: TaskComment = {
    id: generateId('com'),
    authorId: data.authorId ?? 'user-kelvin',
    authorName: data.authorName ?? 'Kelvin Kijazi',
    text: data.text ?? '',
    createdAt: stamp(),
  };
  tasks[index].comments.push(comment);
  tasks[index].updatedAt = stamp();
  return comment;
}

export function linkEmail(taskId: string, emailId: string, title: string, href: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  if (tasks[index].relatedItems.some((r) => r.id === emailId)) return tasks[index];
  tasks[index] = {
    ...tasks[index],
    relatedItems: [...tasks[index].relatedItems, { type: 'email', id: emailId, title, href }],
    updatedAt: stamp(),
  };
  return tasks[index];
}

export function linkCalendarEvent(taskId: string, eventId: string, title: string, href: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  if (tasks[index].relatedItems.some((r) => r.id === eventId)) return tasks[index];
  tasks[index] = {
    ...tasks[index],
    relatedItems: [...tasks[index].relatedItems, { type: 'calendar_event', id: eventId, title, href }],
    updatedAt: stamp(),
  };
  return tasks[index];
}

export function linkMeeting(taskId: string, meetingId: string, title: string, href: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  if (tasks[index].relatedItems.some((r) => r.id === meetingId)) return tasks[index];
  tasks[index] = {
    ...tasks[index],
    relatedItems: [...tasks[index].relatedItems, { type: 'meeting', id: meetingId, title, href }],
    updatedAt: stamp(),
  };
  return tasks[index];
}

export function linkContact(taskId: string, contactId: string, title: string, href: string): Task | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  if (tasks[index].relatedItems.some((r) => r.id === contactId)) return tasks[index];
  tasks[index] = {
    ...tasks[index],
    relatedItems: [...tasks[index].relatedItems, { type: 'contact', id: contactId, title, href }],
    updatedAt: stamp(),
  };
  return tasks[index];
}

export function addAttachment(taskId: string, data: Partial<TaskAttachment>): TaskAttachment | undefined {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return undefined;
  const attachment: TaskAttachment = {
    id: generateId('att'),
    name: data.name ?? 'attachment',
    size: data.size ?? 0,
    type: data.type ?? 'application/octet-stream',
    url: data.url ?? '#',
  };
  tasks[index].attachments.push(attachment);
  tasks[index].updatedAt = stamp();
  return attachment;
}

export function getTaskStats(): TaskStats {
  const today = new Date('2026-08-25');
  today.setHours(0, 0, 0, 0);
  let overdue = 0;
  let todayCount = 0;
  let upcoming = 0;
  let completed = 0;

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      completed++;
      return;
    }
    if (t.status === 'cancelled') return;
    if (!t.dueDate) return;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) overdue++;
    else if (diffDays === 0) todayCount++;
    else if (diffDays <= 7) upcoming++;
  });

  return {
    total: tasks.filter((t) => t.status !== 'cancelled').length,
    overdue,
    today: todayCount,
    upcoming,
    completed,
  };
}

export function getTeamWorkload(): { userId: string; userName: string; activeCount: number }[] {
  return TASK_USERS.map((user) => ({
    userId: user.id,
    userName: user.name,
    activeCount: tasks.filter(
      (t) => t.assigneeId === user.id && t.status !== 'completed' && t.status !== 'cancelled'
    ).length,
  }));
}

export function getLabels(): TaskLabel[] {
  return [...labels];
}
