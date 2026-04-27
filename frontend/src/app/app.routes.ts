import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

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
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/tasks-list/tasks-list.component').then((m) => m.TasksListComponent),
      },
      {
        path: 'tasks/new',
        loadComponent: () =>
          import('./features/tasks/tasks-form/tasks-form.component').then((m) => m.TasksFormComponent),
      },
      {
        path: 'tasks/:id/edit',
        loadComponent: () =>
          import('./features/tasks/tasks-form/tasks-form.component').then((m) => m.TasksFormComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
