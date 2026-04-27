export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'documentation' | 'other';

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

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
  isAIGenerated?: boolean;
  archived?: boolean;
  subtasks?: Subtask[];
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
  isAIGenerated?: boolean;
  subtasks?: { title: string }[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  projectId?: number;
  search?: string;
  isAIGenerated?: boolean;
  archived?: boolean;
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

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por Hacer',
  in_progress: 'En Progreso',
  done: 'Completada',
  blocked: 'Bloqueada',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Base de datos',
  devops: 'DevOps',
  documentation: 'Documentación',
  other: 'Otro',
};
