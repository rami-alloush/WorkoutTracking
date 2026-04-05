import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { WorkoutService } from '../../core/services/workout.service';
import { SessionService } from '../../core/services/session.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { Workout } from '../../shared/models/workout.model';
import { WorkoutSession } from '../../shared/models/session.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Button, Card, DatePipe],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div class="stats-grid">
        <p-card styleClass="stat-card">
          <div class="stat">
            <i class="pi pi-bookmark stat-icon"></i>
            <div>
              <div class="stat-value">{{ workouts().length }}</div>
              <div class="stat-label">Templates</div>
            </div>
          </div>
        </p-card>
        <p-card styleClass="stat-card">
          <div class="stat">
            <i class="pi pi-history stat-icon"></i>
            <div>
              <div class="stat-value">{{ sessions().length }}</div>
              <div class="stat-label">Workouts Done</div>
            </div>
          </div>
        </p-card>
        <p-card styleClass="stat-card">
          <div class="stat">
            <i class="pi pi-calendar stat-icon"></i>
            <div>
              <div class="stat-value">{{ lastWorkoutDate() }}</div>
              <div class="stat-label">Last Workout</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="section">
        <div class="section-header">
          <h3>Quick Start</h3>
          <p-button label="New Template" icon="pi pi-plus" [outlined]="true"
                    size="small" routerLink="/workouts/new" />
        </div>

        @if (workouts().length === 0) {
          <p-card styleClass="empty-card">
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No workout templates yet. Create one to get started!</p>
              <p-button label="Create Template" icon="pi pi-plus" routerLink="/workouts/new" />
            </div>
          </p-card>
        } @else {
          <div class="workout-grid">
            @for (workout of workouts(); track workout.id) {
              <p-card styleClass="workout-card">
                <div class="workout-card-content">
                  <h4>{{ workout.name }}</h4>
                  <span class="exercise-count">{{ workout.exercises.length }} exercises</span>
                  <div class="workout-card-actions">
                    <p-button label="Start" icon="pi pi-play" size="small"
                              (onClick)="startWorkout(workout)" />
                    <p-button icon="pi pi-pencil" [text]="true" size="small"
                              (onClick)="editWorkout(workout)" />
                  </div>
                </div>
              </p-card>
            }
          </div>
        }
      </div>

      @if (recentSessions().length > 0) {
        <div class="section">
          <div class="section-header">
            <h3>Recent Workouts</h3>
            <p-button label="View All" icon="pi pi-arrow-right" [text]="true"
                      size="small" routerLink="/history" />
          </div>
          @for (session of recentSessions(); track session.id) {
            <p-card styleClass="session-card mb-2">
              <div class="session-row" (click)="viewSession(session)">
                <div>
                  <strong>{{ getWorkoutName(session.workoutId) }}</strong>
                  <div class="session-date">{{ session.startTime | date:'medium' }}</div>
                </div>
                <i class="pi pi-chevron-right"></i>
              </div>
            </p-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 1.5rem;
      h2 { margin: 0; }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-icon {
      font-size: 1.75rem;
      color: var(--p-primary-color);
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
    }
    .section { margin-bottom: 2rem; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      h3 { margin: 0; }
    }
    .workout-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .workout-card-content {
      h4 { margin: 0 0 0.25rem; }
      .exercise-count {
        font-size: 0.8rem;
        color: var(--p-text-muted-color);
      }
    }
    .workout-card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      i { font-size: 2.5rem; margin-bottom: 0.5rem; }
      p { margin: 0.5rem 0 1rem; }
    }
    .session-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .session-date {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private sessionService = inject(SessionService);
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);

  workouts = this.workoutService.workouts;
  sessions = this.sessionService.sessions;
  recentSessions = signal<WorkoutSession[]>([]);
  lastWorkoutDate = signal<string>('Never');

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.workoutService.loadWorkouts(),
      this.sessionService.loadSessions()
    ]);

    const allSessions = this.sessions();
    this.recentSessions.set(allSessions.slice(0, 5));
    if (allSessions.length > 0) {
      this.lastWorkoutDate.set(
        allSessions[0].startTime.toLocaleDateString()
      );
    }
  }

  getWorkoutName(workoutId: string): string {
    return this.workoutService.getWorkoutById(workoutId)?.name ?? 'Workout';
  }

  startWorkout(workout: Workout): void {
    this.router.navigate(['/workouts', workout.id, 'play']);
  }

  editWorkout(workout: Workout): void {
    this.router.navigate(['/workouts', workout.id, 'edit']);
  }

  viewSession(session: WorkoutSession): void {
    this.router.navigate(['/history', session.id]);
  }
}
