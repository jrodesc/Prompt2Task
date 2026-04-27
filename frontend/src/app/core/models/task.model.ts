export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'documentation' | 'other';

export interface Task {
  id: number;
  userId: number;
  projectId?: number | null;
  projectName?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string | null;
  projectId?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  projectId?: number;
  search?: string;
}

export interface TaskMetrics {
  totals: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
    blocked: number;
    urgent: number;
    overdue: number;
  };
  byCategory: { category: TaskCategory; count: number }[];
}
