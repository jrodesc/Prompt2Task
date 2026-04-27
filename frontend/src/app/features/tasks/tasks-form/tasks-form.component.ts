import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TasksService } from '../../../core/services/tasks.service';
import { TaskStatus, TaskPriority, TaskCategory, PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from '../../../core/models/task.model';

@Component({
  selector: 'app-tasks-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './tasks-form.component.html',
  styleUrl: './tasks-form.component.scss',
})
export class TasksFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;
  taskId?: number;

  readonly statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  readonly categories: TaskCategory[] = ['frontend', 'backend', 'database', 'devops', 'documentation', 'other'];
  readonly PRIORITY_LABELS = PRIORITY_LABELS;
  readonly STATUS_LABELS = STATUS_LABELS;
  readonly CATEGORY_LABELS = CATEGORY_LABELS;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tasksService: TasksService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      status: ['todo'],
      priority: ['medium'],
      category: ['other'],
      dueDate: [null],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.taskId = +id;
      this.tasksService.getOne(this.taskId).subscribe({
        next: (task) => this.form.patchValue({ ...task, dueDate: task.dueDate ? new Date(task.dueDate) : null }),
        error: () => this.router.navigate(['/tasks']),
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = {
      ...this.form.value,
      dueDate: this.form.value.dueDate ? (this.form.value.dueDate as Date).toISOString().split('T')[0] : null,
    };

    const req = this.isEdit ? this.tasksService.update(this.taskId!, payload) : this.tasksService.create(payload);

    req.subscribe({
      next: (newTask) => {
        this.snack.open(this.isEdit ? 'Tarea actualizada' : 'Tarea creada', 'OK', { duration: 2000 });
        console.log('Task created/updated:', newTask);
        this.router.navigate(['/tasks']).then((success) => {
          console.log('Navigation success:', success);
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.snack.open(err.error?.message || 'Error al guardar', 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
