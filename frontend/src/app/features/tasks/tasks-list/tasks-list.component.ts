import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TasksService } from '../../../core/services/tasks.service';
import { Task, TaskFilters, TaskStatus, TaskPriority, TaskCategory, Subtask, PRIORITY_LABELS, STATUS_LABELS } from '../../../core/models/task.model';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss',
})
export class TasksListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);
  loading = signal(true);
  loadingDetail = signal(false);

  filters: TaskFilters = {};
  search = '';
  pageTitle = 'Todas las tareas';

  readonly PRIORITY_LABELS = PRIORITY_LABELS;
  readonly STATUS_LABELS = STATUS_LABELS;
  readonly statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  readonly categories: TaskCategory[] = ['frontend', 'backend', 'database', 'devops', 'documentation', 'other'];

  constructor(
    private tasksService: TasksService,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.filters = {};
      this.search = '';
      if (params['status']) { this.filters.status = params['status'] as TaskStatus; }
      if (params['priority']) { this.filters.priority = params['priority'] as TaskPriority; }
      if (params['ai'] === 'true') { this.filters.isAIGenerated = true; }
      if (params['archived'] === 'true') { this.filters.archived = true; }
      this.updateTitle();
      this.load();
    });
  }

  updateTitle() {
    if (this.filters.isAIGenerated) this.pageTitle = 'Generadas por IA';
    else if (this.filters.priority === 'urgent') this.pageTitle = 'Importantes';
    else if (this.filters.status === 'done') this.pageTitle = 'Completadas';
    else if (this.filters.archived) this.pageTitle = 'Archivadas';
    else this.pageTitle = 'Todas las tareas';
  }

  load() {
    this.loading.set(true);
    console.log('Loading tasks with filters:', this.filters);
    this.tasksService.getAll({ ...this.filters, search: this.search || undefined }).subscribe({
      next: (data) => {
        console.log('Tasks loaded:', data);
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
      },
    });
  }

  selectTask(task: Task) {
    if (this.selectedTask()?.id === task.id) { this.selectedTask.set(null); return; }
    this.loadingDetail.set(true);
    this.tasksService.getOne(task.id).subscribe({
      next: (full) => { this.selectedTask.set(full); this.loadingDetail.set(false); },
      error: () => this.loadingDetail.set(false),
    });
  }

  closePanel() { this.selectedTask.set(null); }

  toggleSubtask(subtask: Subtask) {
    this.tasksService.toggleSubtask(subtask.id).subscribe({
      next: (updated) => {
        this.selectedTask.update((t) => t ? { ...t, subtasks: t.subtasks?.map((s) => s.id === updated.id ? updated : s) } : t);
      },
    });
  }

  delete(task: Task) {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return;
    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((l) => l.filter((t) => t.id !== task.id));
        if (this.selectedTask()?.id === task.id) this.selectedTask.set(null);
        this.snack.open('Tarea eliminada', 'OK', { duration: 3000 });
      },
    });
  }

  unarchive(task: Task) {
    this.tasksService.unarchive(task.id).subscribe({
      next: () => {
        this.tasks.update((l) => l.filter((t) => t.id !== task.id));
        if (this.selectedTask()?.id === task.id) this.selectedTask.set(null);
        this.snack.open('Tarea desarchivada', 'OK', { duration: 3000 });
      },
    });
  }

  isOverdue(task: Task): boolean {
    return !!task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();
  }

  completedSubtasks(task: Task): number { return task.subtasks?.filter((s) => s.completed).length ?? 0; }
  totalSubtasks(task: Task): number { return task.subtasks?.length ?? 0; }
}
