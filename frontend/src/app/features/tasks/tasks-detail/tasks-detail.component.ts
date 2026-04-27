import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TasksService } from '../../../core/services/tasks.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-tasks-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './tasks-detail.component.html',
  styleUrl: './tasks-detail.component.scss',
})
export class TasksDetailComponent implements OnInit {
  task = signal<Task | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tasksService: TasksService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tasksService.getOne(id).subscribe({
      next: (data) => { this.task.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/tasks']); },
    });
  }

  delete() {
    const t = this.task();
    if (!t || !confirm(`¿Eliminar "${t.title}"?`)) return;
    this.tasksService.delete(t.id).subscribe({
      next: () => {
        this.snack.open('Tarea eliminada', 'OK', { duration: 2000 });
        this.router.navigate(['/tasks']);
      },
      error: () => this.snack.open('Error al eliminar', 'OK', { duration: 3000 }),
    });
  }
}
