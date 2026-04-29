import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()  { this.sidebarOpen = false; }

  readonly navItems: NavItem[] = [
    { label: 'Tablero', icon: 'dashboard', route: '/dashboard', exact: true },
    { label: 'Todas las tareas', icon: 'format_list_bulleted', route: '/tasks', exact: true },
{ label: 'Importantes', icon: 'star', route: '/tasks', queryParams: { priority: 'urgent' } },
    { label: 'Completadas', icon: 'task_alt', route: '/tasks', queryParams: { status: 'done' } },
    { label: 'Archivadas', icon: 'inventory_2', route: '/tasks', queryParams: { archived: 'true' } },
  ];

  readonly bottomItems: NavItem[] = [
    { label: 'Ajustes', icon: 'settings', route: '/settings' },
  ];

  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
