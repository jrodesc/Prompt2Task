import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TasksService } from '../../core/services/tasks.service';
import { Task, TaskStatus, Subtask, PRIORITY_LABELS, STATUS_LABELS } from '../../core/models/task.model';

interface KanbanColumn {
  status: TaskStatus;
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);
  loading = signal(true);
  loadingAI = signal(false);
  loadingDetail = signal(false);
  aiPrompt = '';

  readonly PRIORITY_LABELS = PRIORITY_LABELS;
  readonly STATUS_LABELS = STATUS_LABELS;

  readonly columns: KanbanColumn[] = [
    { status: 'todo',        label: 'Por Hacer',  icon: 'radio_button_unchecked', colorClass: 'col-todo' },
    { status: 'in_progress', label: 'En Progreso', icon: 'pending',                colorClass: 'col-progress' },
    { status: 'done',        label: 'Completadas', icon: 'check_circle',           colorClass: 'col-done' },
    { status: 'blocked',     label: 'Bloqueadas',  icon: 'block',                  colorClass: 'col-blocked' },
  ];

  columnTasks = computed(() => {
    const all = this.tasks();
    return this.columns.map((col) => ({
      ...col,
      items: all.filter((t) => t.status === col.status),
    }));
  });

  constructor(private tasksService: TasksService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.tasksService.getAll().subscribe({
      next: (data) => { this.tasks.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  selectTask(task: Task) {
    if (this.selectedTask()?.id === task.id) {
      this.selectedTask.set(null);
      return;
    }
    this.loadingDetail.set(true);
    this.tasksService.getOne(task.id).subscribe({
      next: (full) => { this.selectedTask.set(full); this.loadingDetail.set(false); },
      error: () => this.loadingDetail.set(false),
    });
  }

  closePanel() {
    this.selectedTask.set(null);
  }

  generateWithAI() {
    if (!this.aiPrompt.trim() || this.loadingAI()) return;
    this.loadingAI.set(true);
    this.tasksService.generateWithAI(this.aiPrompt.trim()).subscribe({
      next: (newTasks) => {
        this.tasks.update((list) => [...newTasks, ...list]);
        this.aiPrompt = '';
        this.loadingAI.set(false);
        this.snack.open(`✨ ${newTasks.length} tareas generadas con IA`, 'OK', { duration: 3500 });
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Error al generar tareas', 'OK', { duration: 4000 });
        this.loadingAI.set(false);
      },
    });
  }

  clearAI() {
    this.aiPrompt = '';
  }

  toggleSubtask(subtask: Subtask) {
    this.tasksService.toggleSubtask(subtask.id).subscribe({
      next: (updated) => {
        this.selectedTask.update((t) => {
          if (!t) return t;
          return {
            ...t,
            subtasks: t.subtasks?.map((s) => (s.id === updated.id ? updated : s)),
          };
        });
      },
    });
  }

  deleteTask(task: Task) {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return;
    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((t) => t.id !== task.id));
        if (this.selectedTask()?.id === task.id) this.selectedTask.set(null);
        this.snack.open('Tarea eliminada', 'OK', { duration: 3000 });
      },
    });
  }

  archiveTask(task: Task) {
    this.tasksService.archive(task.id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((t) => t.id !== task.id));
        if (this.selectedTask()?.id === task.id) this.selectedTask.set(null);
        this.snack.open('Tarea archivada', 'OK', { duration: 3000 });
      },
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }

  dueDateLabel(dueDate: string | null | undefined): string {
    if (!dueDate) return '';
    const d = new Date(dueDate);
    const today = new Date();
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff === -1) return 'Ayer';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  completedSubtasks(task: Task): number {
    return task.subtasks?.filter((s) => s.completed).length ?? 0;
  }

  totalSubtasks(task: Task): number {
    return task.subtasks?.length ?? 0;
  }
}
