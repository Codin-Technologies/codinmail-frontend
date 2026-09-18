export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type TaskReminder = 'none' | 'at_due' | '10_min' | '30_min' | '1_hour' | '1_day' | 'custom';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type TaskComment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type TaskAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type TaskActivity = {
  id: string;
  action: string;
  details?: string;
  userId: string;
  userName: string;
  createdAt: string;
};

export type RelatedItem = {
  type: 'email' | 'thread' | 'contact' | 'calendar_event' | 'meeting';
  id: string;
  title: string;
  href: string;
};

export type Task = {
  id: string;
  organizationId: string;
  creatorId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  dueTime: string | null;
  reminder: TaskReminder;
  recurrence: TaskRecurrence;
  labels: TaskLabel[];
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  activity: TaskActivity[];
  relatedItems: RelatedItem[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TaskFilters = {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignee: string | 'all';
  label: string | 'all';
  dateRange: 'all' | 'today' | 'overdue' | 'week' | 'month';
  search: string;
};

export type TaskViewMode = 'list' | 'board' | 'calendar';

export type TaskStats = {
  total: number;
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
};

export const TASK_USERS = [
  { id: 'user-kelvin', name: 'Kelvin Kijazi', email: 'kelvin@codin.io' },
  { id: 'user-john', name: 'John Smith', email: 'john@codin.io' },
  { id: 'user-mary', name: 'Mary Chen', email: 'mary@codin.io' },
  { id: 'user-george', name: 'George Wilson', email: 'george@codin.io' },
] as const;

export const DEFAULT_LABELS: TaskLabel[] = [
  { id: 'label-sales', name: 'Sales', color: '#c92b2b' },
  { id: 'label-follow-up', name: 'Follow-up', color: '#176b87' },
  { id: 'label-finance', name: 'Finance', color: '#96711f' },
  { id: 'label-operations', name: 'Operations', color: '#34745b' },
  { id: 'label-urgent', name: 'Urgent', color: '#b42318' },
  { id: 'label-personal', name: 'Personal', color: '#637180' },
  { id: 'label-fleet', name: 'Fleet', color: '#4e8372' },
  { id: 'label-proposal', name: 'Proposal', color: '#92400e' },
  { id: 'label-legal', name: 'Legal', color: '#475569' },
];
