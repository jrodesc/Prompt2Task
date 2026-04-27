import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TasksService } from '../../../core/services/tasks.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, TaskFilters, TaskStatus, TaskPriority, TaskCategory } from '../../../core/models/task.model';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss',
})
export class TasksListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(true);

  filters: TaskFilters = {};
  search = '';

  readonly statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  readonly categories: TaskCategory[] = ['frontend', 'backend', 'database', 'devops', 'documentation', 'other'];

  constructor(
    public auth: AuthService,
    private tasksService: TasksService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.tasksService.getAll({ ...this.filters, search: this.search || undefined }).subscribe({
      next: (data) => { this.tasks.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  applySearch() { this.load(); }

  clearFilters() {
    this.filters = {};
    this.search = '';
    this.load();
  }

  delete(task: Task) {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return;
    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((t) => t.id !== task.id));
        this.snack.open('Tarea eliminada', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Error al eliminar', 'OK', { duration: 3000 }),
    });
  }

  logout() { this.auth.logout(); }

  statusColor(status: TaskStatus): string {
    return { todo: 'default', in_progress: 'primary', done: 'accent', blocked: 'warn' }[status] as string;
  }

  priorityColor(priority: TaskPriority): string {
    return { low: '#8bc34a', medium: '#ff9800', high: '#f44336', urgent: '#9c27b0' }[priority];
  }
}
