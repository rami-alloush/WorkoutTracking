import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { Workout } from '../../shared/models/workout.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [RouterLink, Button, Card, ConfirmDialog, DatePipe],
  providers: [ConfirmationService],
  template: `
    <div class="workout-list">
      <div class="page-header">
        <h2>Workout Templates</h2>
        <p-button label="New Template" icon="pi pi-plus" routerLink="/workouts/new" />
      </div>

      @if (workouts().length === 0) {
        <p-card styleClass="empty-card">
          <div class="empty-state">
            <i class="pi pi-inbox"></i>
            <p>No workout templates yet</p>
            <p-button label="Create Your First Template" icon="pi pi-plus"
                      routerLink="/workouts/new" />
          </div>
        </p-card>
      } @else {
        <div class="template-list">
          @for (workout of workouts(); track workout.id) {
            <p-card styleClass="template-card">
              <div class="template-content">
                <div class="template-info">
                  <h3>{{ workout.name }}</h3>
                  <div class="template-meta">
                    <span><i class="pi pi-list"></i> {{ workout.exercises.length }} exercises</span>
                    <span><i class="pi pi-calendar"></i> {{ workout.createdAt | date:'shortDate' }}</span>
                  </div>
                  <div class="exercise-preview">
                    @for (ex of workout.exercises.slice(0, 3); track ex.exerciseId) {
                      <span class="exercise-name">{{ getExerciseName(ex.exerciseId) }}</span>
                    }
                    @if (workout.exercises.length > 3) {
                      <span class="more">+{{ workout.exercises.length - 3 }} more</span>
                    }
                  </div>
                </div>
                <div class="template-actions">
                  <p-button label="Start" icon="pi pi-play" (onClick)="startWorkout(workout)" />
                  <p-button icon="pi pi-pencil" [outlined]="true"
                            (onClick)="editWorkout(workout)" />
                  <p-button icon="pi pi-trash" severity="danger" [text]="true"
                            (onClick)="confirmDelete(workout)" />
                </div>
              </div>
            </p-card>
          }
        </div>
      }

      <p-confirmDialog />
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      h2 { margin: 0; }
    }
    .template-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .template-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
      h3 { margin: 0 0 0.25rem; }
    }
    .template-info {
      flex: 1;
      min-width: 0;
    }
    .template-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      margin-bottom: 0.5rem;
      i { margin-right: 0.25rem; }
    }
    .exercise-preview {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .exercise-name {
      font-size: 0.8rem;
      background: var(--p-surface-100);
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
    }
    .more {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
    }
    .template-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      i { font-size: 2.5rem; }
      p { margin: 0.5rem 0 1rem; }
    }
  `]
})
export class WorkoutListComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  workouts = this.workoutService.workouts;

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.workoutService.loadWorkouts()
    ]);
  }

  getExerciseName(exerciseId: string): string {
    return this.exerciseService.getExerciseById(exerciseId)?.name ?? 'Unknown';
  }

  startWorkout(workout: Workout): void {
    this.router.navigate(['/workouts', workout.id, 'play']);
  }

  editWorkout(workout: Workout): void {
    this.router.navigate(['/workouts', workout.id, 'edit']);
  }

  confirmDelete(workout: Workout): void {
    this.confirmationService.confirm({
      message: `Delete "${workout.name}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.workoutService.deleteWorkout(workout.id);
      }
    });
  }
}
