import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProgramService } from '../../core/services/program.service';
import { ExerciseService } from '../../core/services/exercise.service';
import {
  Program,
  DEFAULT_PROGRAM_TEMPLATES,
  ProgramTemplate,
} from '../../shared/models/program.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [RouterLink, Button, Card, Dialog, ConfirmDialog, LoadingComponent],
  providers: [ConfirmationService],
  template: `
    <div class="program-list">
      <div class="page-header">
        <h2>Programs</h2>
        <div class="header-actions">
          <p-button
            label="Import Template"
            icon="pi pi-download"
            [outlined]="true"
            (onClick)="showTemplates.set(true)"
          />
          <p-button label="New Program" icon="pi pi-plus" routerLink="/programs/new" />
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Loading programs..." />
      } @else if (programs().length === 0) {
        <p-card styleClass="empty-card">
          <div class="empty-state">
            <i class="pi pi-th-large"></i>
            <p>No programs yet</p>
            <p class="hint">
              Create a custom program or import a pre-built template to get started.
            </p>
            <div class="empty-actions">
              <p-button
                label="Import Template"
                icon="pi pi-download"
                [outlined]="true"
                (onClick)="showTemplates.set(true)"
              />
              <p-button label="Create Program" icon="pi pi-plus" routerLink="/programs/new" />
            </div>
          </div>
        </p-card>
      } @else {
        <div class="program-grid">
          @for (program of programs(); track program.id) {
            <p-card styleClass="program-card">
              <div class="program-content">
                <div class="program-info" (click)="viewProgram(program)" style="cursor:pointer">
                  <h3>{{ program.name }}</h3>
                  @if (program.description) {
                    <p class="program-desc">{{ program.description }}</p>
                  }
                  <div class="program-meta">
                    <span><i class="pi pi-calendar"></i> {{ program.daysPerWeek }} days/week</span>
                    <span><i class="pi pi-th-large"></i> {{ program.days.length }} days</span>
                    @if (program.goal) {
                      <span><i class="pi pi-flag"></i> {{ program.goal }}</span>
                    }
                  </div>
                  <div class="day-chips">
                    @for (day of program.days; track day.name) {
                      <span class="day-chip">{{ day.name }}</span>
                    }
                  </div>
                </div>
                <div class="program-actions">
                  <p-button icon="pi pi-eye" label="View" (onClick)="viewProgram(program)" />
                  <p-button
                    icon="pi pi-pencil"
                    [outlined]="true"
                    (onClick)="editProgram(program)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    (onClick)="confirmDelete(program)"
                  />
                </div>
              </div>
            </p-card>
          }
        </div>
      }

      <p-dialog
        header="Import Program Template"
        [(visible)]="showTemplates"
        [modal]="true"
        [style]="{ width: '600px', maxWidth: '95vw' }"
      >
        <div class="template-list">
          @for (template of templates; track template.name) {
            <div class="template-item">
              <div class="template-info">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
                <div class="template-meta">
                  <span><i class="pi pi-calendar"></i> {{ template.daysPerWeek }} days/week</span>
                  <span><i class="pi pi-clock"></i> {{ template.sessionLength }}</span>
                  <span><i class="pi pi-flag"></i> {{ template.goal }}</span>
                </div>
              </div>
              <p-button
                label="Import"
                icon="pi pi-download"
                (onClick)="importTemplate(template)"
                [loading]="importing()"
              />
            </div>
          }
        </div>
      </p-dialog>

      <p-confirmDialog />
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 0.5rem;
        h2 {
          margin: 0;
        }
      }
      .header-actions {
        display: flex;
        gap: 0.5rem;
      }
      .program-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .program-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .program-info {
        flex: 1;
        min-width: 0;
        h3 {
          margin: 0 0 0.25rem;
        }
      }
      .program-desc {
        font-size: 0.875rem;
        color: var(--p-text-muted-color);
        margin: 0 0 0.5rem;
      }
      .program-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: var(--p-text-muted-color);
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
        i {
          margin-right: 0.25rem;
        }
      }
      .day-chips {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }
      .day-chip {
        font-size: 0.75rem;
        background: var(--p-surface-100);
        padding: 0.125rem 0.5rem;
        border-radius: 1rem;
      }
      .program-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--p-text-muted-color);
        i {
          font-size: 2.5rem;
        }
        p {
          margin: 0.5rem 0;
        }
        .hint {
          font-size: 0.875rem;
        }
      }
      .empty-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
      }
      .template-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .template-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: var(--p-surface-50);
        border-radius: var(--p-border-radius);
        border: 1px solid var(--p-surface-200);
        h4 {
          margin: 0 0 0.25rem;
        }
        p {
          font-size: 0.875rem;
          color: var(--p-text-muted-color);
          margin: 0 0 0.5rem;
        }
      }
      .template-meta {
        display: flex;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
        flex-wrap: wrap;
        i {
          margin-right: 0.2rem;
        }
      }
      @media (max-width: 600px) {
        .program-actions {
          flex-wrap: wrap;
        }
        .template-item {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ProgramListComponent implements OnInit {
  private programService = inject(ProgramService);
  private exerciseService = inject(ExerciseService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  programs = this.programService.programs;
  templates = DEFAULT_PROGRAM_TEMPLATES;
  showTemplates = signal(false);
  importing = signal(false);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([this.exerciseService.loadExercises(), this.programService.loadPrograms()]);
    } finally {
      this.loading.set(false);
    }
  }

  viewProgram(program: Program): void {
    this.router.navigate(['/programs', program.id]);
  }

  editProgram(program: Program): void {
    this.router.navigate(['/programs', program.id, 'edit']);
  }

  async importTemplate(template: ProgramTemplate): Promise<void> {
    this.importing.set(true);
    try {
      const { days, unmapped } = this.programService.importTemplate(template);
      if (unmapped.length > 0) {
        console.warn('Unmapped exercises:', unmapped);
      }
      await this.programService.createProgram(template.name, days, {
        description: template.description,
        daysPerWeek: template.daysPerWeek,
        goal: template.goal,
        sessionLength: template.sessionLength,
        progression: template.progression,
      });
      this.showTemplates.set(false);
    } catch (err) {
      console.error('Failed to import template:', err);
    } finally {
      this.importing.set(false);
    }
  }

  confirmDelete(program: Program): void {
    this.confirmationService.confirm({
      message: `Delete "${program.name}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.programService.deleteProgram(program.id);
      },
    });
  }
}
