import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { WeightUnitService } from '../../../core/services/weight-unit.service';
import { WeightUnit } from '../../models/weight-unit.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, Button, Select],
  template: `
    <div class="layout-wrapper">
      <header class="layout-header">
        <div class="header-content">
          <h1 class="app-title" routerLink="/dashboard">
            <img src="icon-192.png" alt="Workout Tracker" class="app-icon" />
            Workout Tracker
            <span class="app-version">v{{ appVersion }}</span>
          </h1>
          <nav class="nav-links nav-desktop">
            <a
              routerLink="/dashboard"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
            >
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
          <div class="header-actions">
            <p-select
              [options]="weightUnitService.options"
              [ngModel]="weightUnit()"
              (ngModelChange)="setWeightUnit($event)"
              optionLabel="label"
              optionValue="value"
              styleClass="unit-select"
            />
            <p-button
              icon="pi pi-sign-out"
              [text]="true"
              severity="secondary"
              (onClick)="logout()"
              pTooltip="Logout"
            />
          </div>
        </div>
      </header>
      <main class="layout-main">
        <router-outlet />
      </main>
      <nav class="bottom-nav" aria-label="Primary">
        <a
          routerLink="/dashboard"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          <i class="pi pi-home"></i><span>Home</span>
        </a>
        <a routerLink="/workouts" routerLinkActive="active-link">
          <i class="pi pi-bookmark"></i><span>Templates</span>
        </a>
        <a routerLink="/programs" routerLinkActive="active-link">
          <i class="pi pi-th-large"></i><span>Programs</span>
        </a>
        <a routerLink="/exercises" routerLinkActive="active-link">
          <i class="pi pi-list"></i><span>Exercises</span>
        </a>
        <a routerLink="/history" routerLinkActive="active-link">
          <i class="pi pi-history"></i><span>History</span>
        </a>
        <a routerLink="/progress" routerLinkActive="active-link">
          <i class="pi pi-chart-line"></i><span>Progress</span>
        </a>
      </nav>
    </div>
  `,
  styles: [
    `
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
        padding-top: env(safe-area-inset-top);
      }
      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
      }
      :host ::ng-deep .unit-select {
        min-width: 5.5rem;
      }
      .app-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--p-primary-color);
        cursor: pointer;
        margin: 0;
        white-space: nowrap;
      }
      .app-version {
        font-size: 0.6rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--p-primary-contrast-color);
        background: var(--p-primary-color);
        border-radius: 999px;
        padding: 0.1em 0.55em;
        opacity: 0.85;
        align-self: center;
        flex-shrink: 0;
      }
      .app-icon {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 0.375rem;
        object-fit: contain;
        flex-shrink: 0;
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
          &:hover {
            background: var(--p-surface-hover);
          }
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
      .bottom-nav {
        display: none;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--p-surface-0);
        border-top: 1px solid var(--p-surface-border);
        padding: 0.25rem 0.25rem calc(0.25rem + env(safe-area-inset-bottom));
        z-index: 999;
        justify-content: space-around;
        align-items: stretch;
        a {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.125rem;
          padding: 0.5rem 0.25rem;
          min-height: 56px;
          border-radius: var(--p-border-radius);
          color: var(--p-text-muted-color);
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 500;
          text-align: center;
          line-height: 1;
          i {
            font-size: 1.15rem;
          }
          &.active-link {
            color: var(--p-primary-color);
          }
        }
      }
      @media (max-width: 768px) {
        .nav-desktop {
          display: none;
        }
        .bottom-nav {
          display: flex;
        }
        .layout-main {
          padding: 1rem 0.75rem;
          padding-bottom: calc(5rem + env(safe-area-inset-bottom));
        }
        .app-title {
          font-size: 1.1rem;
        }
        .app-icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        .header-content {
          padding: 0.5rem 0.75rem;
          gap: 0.5rem;
        }
        :host ::ng-deep .unit-select {
          min-width: 4.75rem;
        }
      }
    `,
  ],
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected weightUnitService = inject(WeightUnitService);
  protected appVersion = environment.appVersion;

  protected weightUnit(): WeightUnit {
    return this.weightUnitService.weightUnit();
  }

  async setWeightUnit(unit: WeightUnit): Promise<void> {
    await this.weightUnitService.updateWeightUnit(unit);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
