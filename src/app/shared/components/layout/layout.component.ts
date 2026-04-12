import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button],
  template: `
    <div class="layout-wrapper">
      <header class="layout-header">
        <div class="header-content">
          <h1 class="app-title" routerLink="/dashboard">
            <i class="pi pi-bolt"></i> WorkoutTracker
          </h1>
          <nav class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active-link"
               [routerLinkActiveOptions]="{exact: true}">
              <i class="pi pi-home"></i><span>Dashboard</span>
            </a>
            <a routerLink="/exercises" routerLinkActive="active-link">
              <i class="pi pi-list"></i><span>Exercises</span>
            </a>
            <a routerLink="/programs" routerLinkActive="active-link">
              <i class="pi pi-th-large"></i><span>Programs</span>
            </a>
            <a routerLink="/workouts" routerLinkActive="active-link">
              <i class="pi pi-bookmark"></i><span>Templates</span>
            </a>
            <a routerLink="/history" routerLinkActive="active-link">
              <i class="pi pi-history"></i><span>History</span>
            </a>
            <a routerLink="/progress" routerLinkActive="active-link">
              <i class="pi pi-chart-line"></i><span>Progress</span>
            </a>
          </nav>
          <p-button icon="pi pi-sign-out" [text]="true" severity="secondary"
                    (onClick)="logout()" pTooltip="Logout" />
        </div>
      </header>
      <main class="layout-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--p-surface-ground);
    }
    .layout-header {
      background: var(--p-surface-0);
      border-bottom: 1px solid var(--p-surface-border);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .app-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--p-primary-color);
      cursor: pointer;
      margin: 0;
      white-space: nowrap;
      i { margin-right: 0.25rem; }
    }
    .nav-links {
      display: flex;
      gap: 0.25rem;
      flex: 1;
      overflow-x: auto;
      a {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.75rem;
        border-radius: var(--p-border-radius);
        color: var(--p-text-color);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        transition: background 0.2s;
        &:hover { background: var(--p-surface-hover); }
        &.active-link {
          background: var(--p-primary-color);
          color: var(--p-primary-contrast-color);
        }
      }
    }
    .layout-main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    @media (max-width: 768px) {
      .nav-links span { display: none; }
      .nav-links a { padding: 0.5rem; }
      .header-content { gap: 0.5rem; }
    }
  `]
})
export class LayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
