import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { SessionService } from '../../core/services/session.service';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WeightUnitService } from '../../core/services/weight-unit.service';
import { WorkoutSession } from '../../shared/models/session.model';
import { DatePipe } from '@angular/common';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [Button, Card, Tag, DatePipe, LoadingComponent],
  template: `
    <div class="session-detail">
      @if (loading()) {
        <app-loading label="Loading session..." />
      } @else if (!session()) {
        <p-card>
          <div class="empty-state">
            <i class="pi pi-exclamation-triangle"></i>
            <p>Session not found</p>
            <p-button label="Back to History" icon="pi pi-arrow-left" routerLink="/history" />
          </div>
        </p-card>
      } @else {
        <div class="page-header">
          <p-button icon="pi pi-arrow-left" [text]="true" (onClick)="goBack()" />
          <div>
            <h2>{{ workoutName() }}</h2>
            <div class="session-meta">
              <span
                ><i class="pi pi-calendar"></i> {{ session()!.startTime | date: 'medium' }}</span
              >
              <span><i class="pi pi-clock"></i> {{ duration() }}</span>
            </div>
          </div>
        </div>

        <div class="summary-bar">
          <p-card styleClass="summary-card">
            <div class="summary-item">
              <div class="summary-value">{{ session()!.exercises.length }}</div>
              <div class="summary-label">Exercises</div>
            </div>
          </p-card>
          <p-card styleClass="summary-card">
            <div class="summary-item">
              <div class="summary-value">{{ totalSets() }}</div>
              <div class="summary-label">Sets</div>
            </div>
          </p-card>
          <p-card styleClass="summary-card">
            <div class="summary-item">
              <div class="summary-value">{{ totalVolume() }}</div>
              <div class="summary-label">Volume ({{ weightUnitLabel() }})</div>
            </div>
          </p-card>
        </div>

        <div class="exercise-details">
          @for (exercise of session()!.exercises; track exercise.exerciseId) {
            <p-card styleClass="exercise-detail-card">
              <div class="exercise-header-row">
                <h3>{{ getExerciseName(exercise.exerciseId) }}</h3>
                <p-tag [value]="getMuscleName(exercise.exerciseId)" [rounded]="true" />
              </div>
              <div class="sets-detail-table">
                <div class="sets-detail-header">
                  <span class="col-set">Set</span>
                  <span class="col-data">Weight</span>
                  <span class="col-data">Reps</span>
                  <span class="col-data">Volume</span>
                </div>
                @for (set of exercise.sets; track $index; let i = $index) {
                  <div class="sets-detail-row">
                    <span class="col-set">{{ i + 1 }}</span>
                    <span class="col-data">{{ formatWeight(set.weight) }}</span>
                    <span class="col-data">{{ set.reps }}</span>
                    <span class="col-data">{{ formatVolume(set.weight * set.reps) }}</span>
                  </div>
                }
              </div>
            </p-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        h2 {
          margin: 0;
        }
      }
      .session-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: var(--p-text-muted-color);
        i {
          margin-right: 0.25rem;
        }
      }
      .summary-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .summary-item {
        text-align: center;
      }
      .summary-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--p-primary-color);
      }
      .summary-label {
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
        text-transform: uppercase;
      }
      .exercise-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .exercise-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        h3 {
          margin: 0;
        }
      }
      .sets-detail-table {
        width: 100%;
        overflow-x: auto;
      }
      .sets-detail-header {
        display: flex;
        padding: 0.375rem 0;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--p-text-muted-color);
        border-bottom: 1px solid var(--p-surface-border);
        min-width: 320px;
      }
      .sets-detail-row {
        display: flex;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--p-surface-50);
        font-size: 0.9rem;
        min-width: 320px;
      }
      .col-set {
        width: 50px;
        font-weight: 700;
        color: var(--p-primary-color);
      }
      .col-data {
        flex: 1;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--p-text-muted-color);
        i {
          font-size: 2.5rem;
        }
        p {
          margin: 0.5rem 0 1rem;
        }
      }
    `,
  ],
})
export class SessionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private weightUnitService = inject(WeightUnitService);

  session = signal<WorkoutSession | null>(null);
  workoutName = signal('Workout');
  duration = signal('—');
  totalSets = signal(0);
  totalVolumeKg = signal(0);
  loading = signal(true);

  totalVolume(): string {
    return this.weightUnitService.formatVolume(this.totalVolumeKg());
  }

  weightUnitLabel(): string {
    return this.weightUnitService.unitLabel();
  }

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.weightUnitService.ensureLoaded(),
        this.exerciseService.loadExercises(),
        this.workoutService.loadWorkouts(),
      ]);

      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;

      const session = await this.sessionService.getSessionById(id);
      if (!session) return;

      this.session.set(session);
      this.workoutName.set(
        this.workoutService.getWorkoutById(session.workoutId)?.name ?? 'Workout',
      );

      if (session.endTime) {
        const diff = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        this.duration.set(`${Math.floor(diff / 60)} min`);
      }

      const sets = session.exercises.reduce((s, e) => s + e.sets.length, 0);
      this.totalSets.set(sets);

      const vol = session.exercises.reduce(
        (s, e) => s + e.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
        0,
      );
      this.totalVolumeKg.set(vol);
    } finally {
      this.loading.set(false);
    }
  }

  formatWeight(value: number): string {
    return this.weightUnitService.formatWeight(value);
  }

  formatVolume(value: number): string {
    return this.weightUnitService.formatVolume(value);
  }

  getExerciseName(exerciseId: string): string {
    return this.exerciseService.getExerciseById(exerciseId)?.name ?? 'Unknown';
  }

  getMuscleName(exerciseId: string): string {
    return this.exerciseService.getExerciseById(exerciseId)?.muscleGroup ?? '';
  }

  goBack(): void {
    this.router.navigate(['/history']);
  }
}
