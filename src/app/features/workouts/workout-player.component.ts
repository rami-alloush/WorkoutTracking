import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { SessionService } from '../../core/services/session.service';
import { Workout } from '../../shared/models/workout.model';
import { ExerciseSet, SessionExercise } from '../../shared/models/session.model';

interface PlayerExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

@Component({
  selector: 'app-workout-player',
  standalone: true,
  imports: [FormsModule, Button, Card, InputNumber, Message, Tag, ConfirmDialog],
  providers: [ConfirmationService],
  template: `
    <div class="workout-player">
      @if (error()) {
        <p-message severity="error" [text]="error()" styleClass="mb-3 w-full" />
      }

      @if (!workout()) {
        <p-card>
          <div class="empty-state">
            <i class="pi pi-exclamation-triangle"></i>
            <p>Workout template not found</p>
            <p-button label="Back to Templates" routerLink="/workouts" />
          </div>
        </p-card>
      } @else {
        <div class="player-header">
          <div>
            <h2>{{ workout()!.name }}</h2>
            <div class="timer">
              <i class="pi pi-clock"></i>
              <span>{{ elapsedTime() }}</span>
            </div>
          </div>
          <div class="player-header-actions">
            <p-button label="Cancel" severity="secondary" [outlined]="true"
                      (onClick)="confirmCancel()" />
            <p-button label="Finish Workout" icon="pi pi-check" severity="success"
                      (onClick)="confirmFinish()" [loading]="saving()" />
          </div>
        </div>

        <div class="exercise-cards">
          @for (exercise of playerExercises(); track exercise.exerciseId; let exIdx = $index) {
            <p-card styleClass="exercise-card">
              <div class="exercise-card-header">
                <div>
                  <h3>{{ exercise.exerciseName }}</h3>
                  <p-tag [value]="getMuscleName(exercise.exerciseId)" [rounded]="true" />
                </div>
                <p-button icon="pi pi-plus" label="Add Set" [outlined]="true" size="small"
                          (onClick)="addSet(exIdx)" />
              </div>

              <div class="sets-table">
                <div class="sets-header">
                  <span class="set-col-num">Set</span>
                  <span class="set-col">Weight (lbs)</span>
                  <span class="set-col">Reps</span>
                  <span class="set-col-action"></span>
                </div>
                @for (set of exercise.sets; track $index; let setIdx = $index) {
                  <div class="set-row">
                    <span class="set-col-num set-number">{{ setIdx + 1 }}</span>
                    <div class="set-col">
                      <p-inputNumber [(ngModel)]="set.weight" [min]="0" [max]="9999"
                                     [maxFractionDigits]="1" placeholder="0"
                                     inputStyleClass="set-input"
                                     (onFocus)="onInputFocus($event)" />
                    </div>
                    <div class="set-col">
                      <p-inputNumber [(ngModel)]="set.reps" [min]="0" [max]="999"
                                     placeholder="0"
                                     inputStyleClass="set-input"
                                     (onFocus)="onInputFocus($event)" />
                    </div>
                    <div class="set-col-action">
                      <p-button icon="pi pi-times" severity="danger" [text]="true"
                                [rounded]="true" size="small"
                                (onClick)="removeSet(exIdx, setIdx)"
                                [disabled]="exercise.sets.length <= 1" />
                    </div>
                  </div>
                }
              </div>
            </p-card>
          }
        </div>

        <div class="player-footer">
          <p-button label="Finish Workout" icon="pi pi-check" severity="success"
                    styleClass="w-full" size="large"
                    (onClick)="confirmFinish()" [loading]="saving()" />
        </div>
      }

      <p-confirmDialog />
    </div>
  `,
  styles: [`
    .workout-player { padding-bottom: 5rem; }
    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
      h2 { margin: 0 0 0.25rem; }
    }
    .timer {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 1rem;
      color: var(--p-primary-color);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .player-header-actions {
      display: flex;
      gap: 0.5rem;
    }
    .exercise-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .exercise-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      h3 { margin: 0 0 0.25rem; }
    }
    .sets-table { width: 100%; }
    .sets-header {
      display: flex;
      gap: 0.5rem;
      padding: 0.375rem 0;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--p-text-muted-color);
      border-bottom: 1px solid var(--p-surface-border);
    }
    .set-row {
      display: flex;
      gap: 0.5rem;
      padding: 0.375rem 0;
      align-items: center;
      border-bottom: 1px solid var(--p-surface-50);
    }
    .set-col-num { width: 40px; text-align: center; }
    .set-col { flex: 1; min-width: 0; }
    .set-col-action { width: 40px; text-align: center; }
    .set-number {
      font-weight: 700;
      color: var(--p-primary-color);
    }
    :host ::ng-deep .p-inputnumber { width: 100%; }
    .set-number {
      font-weight: 700;
      color: var(--p-primary-color);
    }
    :host ::ng-deep .set-input {
      width: 100% !important;
      text-align: center;
      font-size: 1.1rem !important;
      font-weight: 600;
      padding: 0.75rem 0.5rem !important;
    }
    .player-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: var(--p-surface-card);
      border-top: 1px solid var(--p-surface-border);
      z-index: 50;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      i { font-size: 2.5rem; margin-bottom: 0.5rem; }
      p { margin: 0.5rem 0 1rem; }
    }
    @media (max-width: 480px) {
      .player-header { flex-direction: column; }
      .player-header-actions { width: 100%; }
      .player-header-actions :host ::ng-deep .p-button { flex: 1; }
    }
  `]
})
export class WorkoutPlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private sessionService = inject(SessionService);
  private confirmationService = inject(ConfirmationService);

  workout = signal<Workout | null>(null);
  playerExercises = signal<PlayerExercise[]>([]);
  error = signal('');
  saving = signal(false);
  startTime = new Date();
  elapsedTime = signal('00:00');
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.workoutService.loadWorkouts(),
      this.sessionService.loadSessions()
    ]);

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const workout = this.workoutService.getWorkoutById(id);
    if (!workout) return;

    this.workout.set(workout);
    this.startTime = new Date();
    this.startTimer();

    const lastSession = this.sessionService.getLastSessionForWorkout(workout.id);

    const exercises: PlayerExercise[] = workout.exercises
      .sort((a, b) => a.order - b.order)
      .map(we => {
        const lastExData = lastSession?.exercises.find(e => e.exerciseId === we.exerciseId);
        const sets: ExerciseSet[] = [];

        if (lastExData && lastExData.sets.length > 0) {
          for (const s of lastExData.sets) {
            sets.push({ weight: s.weight, reps: s.reps });
          }
          while (sets.length < we.targetSets) {
            const last = lastExData.sets[lastExData.sets.length - 1];
            sets.push({ weight: last.weight, reps: last.reps });
          }
        } else {
          for (let i = 0; i < we.targetSets; i++) {
            sets.push({ weight: 0, reps: 0 });
          }
        }

        return {
          exerciseId: we.exerciseId,
          exerciseName: this.exerciseService.getExerciseById(we.exerciseId)?.name ?? 'Unknown',
          sets
        };
      });

    this.playerExercises.set(exercises);
  }

  getMuscleName(exerciseId: string): string {
    return this.exerciseService.getExerciseById(exerciseId)?.muscleGroup ?? '';
  }

  addSet(exerciseIdx: number): void {
    const exercises = [...this.playerExercises()];
    const ex = { ...exercises[exerciseIdx], sets: [...exercises[exerciseIdx].sets] };
    const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { weight: 0, reps: 0 };
    ex.sets.push({ weight: lastSet.weight, reps: lastSet.reps });
    exercises[exerciseIdx] = ex;
    this.playerExercises.set(exercises);
  }

  removeSet(exerciseIdx: number, setIdx: number): void {
    const exercises = [...this.playerExercises()];
    const ex = { ...exercises[exerciseIdx], sets: [...exercises[exerciseIdx].sets] };
    if (ex.sets.length <= 1) return;
    ex.sets.splice(setIdx, 1);
    exercises[exerciseIdx] = ex;
    this.playerExercises.set(exercises);
  }

  onInputFocus(event: any): void {
    const input = event?.target ?? event?.originalEvent?.target;
    if (input) {
      setTimeout(() => input.select?.(), 0);
    }
  }

  confirmFinish(): void {
    this.confirmationService.confirm({
      message: 'Finish and save this workout?',
      header: 'Finish Workout',
      icon: 'pi pi-check-circle',
      accept: () => this.finishWorkout()
    });
  }

  confirmCancel(): void {
    this.confirmationService.confirm({
      message: 'Cancel this workout? All progress will be lost.',
      header: 'Cancel Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.stopTimer();
        this.router.navigate(['/workouts']);
      }
    });
  }

  private async finishWorkout(): Promise<void> {
    const w = this.workout();
    if (!w) return;

    this.saving.set(true);
    try {
      const exercises: SessionExercise[] = this.playerExercises().map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter(s => s.weight > 0 || s.reps > 0)
      }));

      await this.sessionService.saveSession(w.id, this.startTime, exercises);
      this.stopTimer();
      this.router.navigate(['/history']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Failed to save session');
    } finally {
      this.saving.set(false);
    }
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
      const mins = Math.floor(diff / 60).toString().padStart(2, '0');
      const secs = (diff % 60).toString().padStart(2, '0');
      this.elapsedTime.set(`${mins}:${secs}`);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
