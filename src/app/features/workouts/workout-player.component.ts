import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
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
import { Exercise } from '../../shared/models/exercise.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ExerciseDetailDialogComponent } from '../../shared/components/exercise-detail-dialog/exercise-detail-dialog.component';

interface PlayerExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

@Component({
  selector: 'app-workout-player',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Card,
    InputNumber,
    Message,
    Tag,
    ConfirmDialog,
    LoadingComponent,
    ExerciseDetailDialogComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="workout-player">
      @if (loading()) {
        <app-loading label="Loading workout..." />
      } @else {
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
              <p-button
                label="Cancel"
                severity="secondary"
                [outlined]="true"
                (onClick)="confirmCancel()"
              />
              <p-button
                label="Finish Workout"
                icon="pi pi-check"
                severity="success"
                (onClick)="confirmFinish()"
                [loading]="saving()"
              />
            </div>
          </div>

          <div class="exercise-cards">
            @for (exercise of playerExercises(); track exercise.exerciseId; let exIdx = $index) {
              <p-card styleClass="exercise-card">
                <div class="exercise-card-header">
                  @if (getExerciseImage(exercise.exerciseId); as imgUrl) {
                    <button
                      type="button"
                      class="exercise-thumb-btn"
                      (click)="openDetail(exercise.exerciseId)"
                      [attr.aria-label]="'View ' + exercise.exerciseName + ' details'"
                    >
                      <img
                        class="exercise-thumb"
                        [src]="imgUrl"
                        [alt]="exercise.exerciseName"
                        loading="lazy"
                        (error)="onImageError($event)"
                      />
                    </button>
                  }
                  <div class="exercise-title">
                    <h3>{{ exercise.exerciseName }}</h3>
                    <p-tag [value]="getMuscleName(exercise.exerciseId)" [rounded]="true" />
                  </div>
                  <p-button
                    icon="pi pi-plus"
                    label="Add Set"
                    [outlined]="true"
                    size="small"
                    (onClick)="addSet(exIdx)"
                  />
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
                        <p-inputNumber
                          [(ngModel)]="set.weight"
                          [min]="0"
                          [max]="9999"
                          [maxFractionDigits]="1"
                          placeholder="0"
                          inputStyleClass="set-input"
                          (onFocus)="onInputFocus($event)"
                        />
                      </div>
                      <div class="set-col">
                        <p-inputNumber
                          [(ngModel)]="set.reps"
                          [min]="0"
                          [max]="999"
                          placeholder="0"
                          inputStyleClass="set-input"
                          (onFocus)="onInputFocus($event)"
                        />
                      </div>
                      <div class="set-col-action">
                        <p-button
                          icon="pi pi-times"
                          severity="danger"
                          [text]="true"
                          [rounded]="true"
                          size="small"
                          (onClick)="removeSet(exIdx, setIdx)"
                          [disabled]="exercise.sets.length <= 1"
                        />
                      </div>
                    </div>
                  }
                </div>
              </p-card>
            }
          </div>

          <div class="player-footer">
            <p-button
              label="Finish Workout"
              icon="pi pi-check"
              severity="success"
              styleClass="w-full"
              size="large"
              (onClick)="confirmFinish()"
              [loading]="saving()"
            />
          </div>
        }
      }
      <p-confirmDialog />
      <app-exercise-detail-dialog [exercise]="detailExercise()" [(visible)]="showDetailDialog" />
    </div>
  `,
  styles: [
    `
      .workout-player {
        padding-bottom: 5rem;
      }
      .player-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
        gap: 0.75rem;
        h2 {
          margin: 0 0 0.25rem;
        }
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
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        h3 {
          margin: 0 0 0.25rem;
        }
      }
      .exercise-thumb-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        border-radius: var(--p-border-radius);
      }
      .exercise-thumb-btn:focus-visible {
        outline: 2px solid var(--p-primary-color);
        outline-offset: 2px;
      }
      .exercise-thumb-btn:hover .exercise-thumb {
        transform: scale(1.05);
      }
      .exercise-thumb {
        width: 80px;
        height: 60px;
        object-fit: contain;
        transition: transform 0.15s ease;
        background: var(--p-surface-ground, #f4f4f5);
        border-radius: var(--p-border-radius);
        flex-shrink: 0;
      }
      .exercise-title {
        flex: 1;
        min-width: 0;
      }
      .sets-table {
        width: 100%;
        overflow-x: auto;
      }
      .sets-header {
        display: flex;
        gap: 0.5rem;
        padding: 0.375rem 0;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--p-text-muted-color);
        border-bottom: 1px solid var(--p-surface-border);
        min-width: 300px;
      }
      .set-row {
        display: flex;
        gap: 0.5rem;
        padding: 0.375rem 0;
        align-items: center;
        border-bottom: 1px solid var(--p-surface-50);
        min-width: 300px;
      }
      .set-col-num {
        width: 40px;
        text-align: center;
      }
      .set-col {
        flex: 1;
        min-width: 0;
      }
      .set-col-action {
        width: 40px;
        text-align: center;
      }
      .set-number {
        font-weight: 700;
        color: var(--p-primary-color);
      }
      :host ::ng-deep .p-inputnumber {
        width: 100%;
      }
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
        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
        background: var(--p-surface-card);
        border-top: 1px solid var(--p-surface-border);
        z-index: 50;
      }
      @media (max-width: 768px) {
        .player-footer {
          bottom: calc(64px + env(safe-area-inset-bottom));
          padding-bottom: 0.75rem;
        }
        .workout-player {
          padding-bottom: 10rem;
        }
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--p-text-muted-color);
        i {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        p {
          margin: 0.5rem 0 1rem;
        }
      }
      @media (max-width: 480px) {
        .player-header {
          flex-direction: column;
        }
        .player-header-actions {
          width: 100%;
        }
        .player-header-actions :host ::ng-deep .p-button {
          flex: 1;
        }
      }
    `,
  ],
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
  loading = signal(true);
  showDetailDialog = signal(false);
  detailExercise = signal<Exercise | null>(null);
  startTime = new Date();
  elapsedTime = signal('00:00');
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private readonly STORAGE_KEY = 'workout-in-progress';
  private restoring = false;

  constructor() {
    effect(() => {
      const w = this.workout();
      const exercises = this.playerExercises();
      if (!w || exercises.length === 0 || this.restoring) return;
      try {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify({
            workoutId: w.id,
            startTime: this.startTime.toISOString(),
            exercises,
          }),
        );
      } catch {}
    });
  }

  private loadAutoSave(
    workoutId: string,
  ): { startTime: string; exercises: PlayerExercise[] } | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data?.workoutId !== workoutId) return null;
      return { startTime: data.startTime, exercises: data.exercises };
    } catch {
      return null;
    }
  }

  private clearAutoSave(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.initWorkout();
    } finally {
      this.loading.set(false);
    }
  }

  private async initWorkout(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.workoutService.loadWorkouts(),
      this.sessionService.loadSessions(),
    ]);

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const workout = this.workoutService.getWorkoutById(id);
    if (!workout) return;

    this.workout.set(workout);

    const saved = this.loadAutoSave(workout.id);
    if (saved) {
      const parsed = new Date(saved.startTime);
      this.startTime = isNaN(parsed.getTime()) ? new Date() : parsed;
      this.restoring = true;
      this.playerExercises.set(saved.exercises);
      this.restoring = false;
      this.startTimer();
      return;
    }

    this.startTime = new Date();
    this.startTimer();

    const lastSession = this.sessionService.getLastSessionForWorkout(workout.id);

    const exercises: PlayerExercise[] = workout.exercises
      .sort((a, b) => a.order - b.order)
      .map((we) => {
        const lastExData = lastSession?.exercises.find((e) => e.exerciseId === we.exerciseId);
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
          const defaultReps = we.targetReps ?? 0;
          for (let i = 0; i < we.targetSets; i++) {
            sets.push({ weight: 0, reps: defaultReps });
          }
        }

        return {
          exerciseId: we.exerciseId,
          exerciseName: this.exerciseService.getExerciseById(we.exerciseId)?.name ?? 'Unknown',
          sets,
        };
      });

    this.playerExercises.set(exercises);
  }

  getMuscleName(exerciseId: string): string {
    return this.exerciseService.getExerciseById(exerciseId)?.muscleGroup ?? '';
  }

  getExerciseImage(exerciseId: string): string | undefined {
    return this.exerciseService.getExerciseById(exerciseId)?.imageUrl;
  }

  openDetail(exerciseId: string): void {
    const ex = this.exerciseService.getExerciseById(exerciseId);
    if (!ex) return;
    this.detailExercise.set(ex);
    this.showDetailDialog.set(true);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
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
      accept: () => this.finishWorkout(),
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
        this.clearAutoSave();
        this.router.navigate(['/workouts']);
      },
    });
  }

  private async finishWorkout(): Promise<void> {
    const w = this.workout();
    if (!w) return;

    this.saving.set(true);
    try {
      const exercises: SessionExercise[] = this.playerExercises().map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter((s) => s.weight > 0 || s.reps > 0),
      }));

      await this.sessionService.saveSession(w.id, this.startTime, exercises);
      this.stopTimer();
      this.clearAutoSave();
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
      const mins = Math.floor(diff / 60)
        .toString()
        .padStart(2, '0');
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
