import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/tasks/tasks-list/tasks-list.component').then(
            (m) => m.TasksListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/tasks/tasks-form/tasks-form.component').then(
            (m) => m.TasksFormComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/tasks/tasks-form/tasks-form.component').then(
            (m) => m.TasksFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/tasks/tasks-detail/tasks-detail.component').then(
            (m) => m.TasksDetailComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
