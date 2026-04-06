import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutExercise } from '../../shared/models/workout.model';
import { Exercise } from '../../shared/models/exercise.model';

interface BuilderExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
}

@Component({
  selector: 'app-workout-builder',
  standalone: true,
  imports: [FormsModule, Button, Card, InputText, InputNumber, Select, FloatLabel, Message],
  template: `
    <div class="workout-builder">
      <div class="page-header">
        <h2>{{ isEdit() ? 'Edit Template' : 'New Template' }}</h2>
      </div>

      @if (error()) {
        <p-message severity="error" [text]="error()" styleClass="mb-3 w-full" />
      }

      <p-card>
        <div class="form-section">
          <p-floatlabel variant="on">
            <input pInputText id="workoutName" [(ngModel)]="workoutName" class="w-full" />
            <label for="workoutName">Template Name</label>
          </p-floatlabel>
        </div>

        <div class="form-section">
          <h3>Exercises</h3>

          <div class="add-exercise-row">
            <p-select [options]="exerciseOptions()" [(ngModel)]="selectedExerciseId"
                      optionLabel="name" optionValue="id"
                      placeholder="Select exercise" styleClass="flex-1"
                      [filter]="true" filterBy="name" />
            <p-button icon="pi pi-plus" label="Add" (onClick)="addExercise()"
                      [disabled]="!selectedExerciseId" />
          </div>

          @if (builderExercises().length === 0) {
            <div class="empty-exercises">
              <p>No exercises added yet. Select an exercise above to add it.</p>
            </div>
          } @else {
            <div class="exercise-list">
              @for (ex of builderExercises(); track ex.exerciseId; let i = $index) {
                <div class="exercise-row">
                  <div class="exercise-order">
                    <p-button icon="pi pi-chevron-up" [text]="true" [rounded]="true"
                              size="small" (onClick)="moveUp(i)" [disabled]="i === 0" />
                    <span class="order-num">{{ i + 1 }}</span>
                    <p-button icon="pi pi-chevron-down" [text]="true" [rounded]="true"
                              size="small" (onClick)="moveDown(i)"
                              [disabled]="i === builderExercises().length - 1" />
                  </div>
                  <div class="exercise-details">
                    <strong>{{ ex.exerciseName }}</strong>
                    <div class="sets-row">
                      <label>Sets:</label>
                      <p-inputNumber [(ngModel)]="ex.targetSets" [min]="1" [max]="20"
                                     [showButtons]="true" />
                    </div>
                  </div>
                  <p-button icon="pi pi-trash" severity="danger" [text]="true"
                            (onClick)="removeExercise(i)" />
                </div>
              }
            </div>
          }
        </div>

        <div class="form-actions">
          <p-button label="Cancel" [text]="true" (onClick)="cancel()" />
          <p-button [label]="isEdit() ? 'Update' : 'Create'" icon="pi pi-check"
                    (onClick)="save()" [loading]="saving()" />
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1rem;
      h2 { margin: 0; }
    }
    .form-section {
      margin-bottom: 1.5rem;
      h3 { margin: 0 0 1rem; }
    }
    .add-exercise-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      align-items: center;
    }
    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .exercise-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--p-surface-50);
      border-radius: var(--p-border-radius);
      border: 1px solid var(--p-surface-200);
    }
    .exercise-order {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    .order-num {
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
    }
    .exercise-details {
      flex: 1;
      min-width: 0;
      strong { 
        display: block; 
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .sets-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      label { font-size: 0.875rem; color: var(--p-text-muted-color); }
    }
    .empty-exercises {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      background: var(--p-surface-50);
      border-radius: var(--p-border-radius);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--p-surface-border);
    }
  `]
})
export class WorkoutBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);

  isEdit = signal(false);
  editId = '';
  workoutName = '';
  selectedExerciseId = '';
  builderExercises = signal<BuilderExercise[]>([]);
  exerciseOptions = signal<Exercise[]>([]);
  error = signal('');
  saving = signal(false);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.workoutService.loadWorkouts()
    ]);
    this.exerciseOptions.set(this.exerciseService.exercises());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const workout = this.workoutService.getWorkoutById(id);
      if (workout) {
        this.isEdit.set(true);
        this.editId = id;
        this.workoutName = workout.name;
        this.builderExercises.set(
          workout.exercises.map(e => ({
            exerciseId: e.exerciseId,
            exerciseName: this.exerciseService.getExerciseById(e.exerciseId)?.name ?? 'Unknown',
            targetSets: e.targetSets
          }))
        );
      }
    }
  }

  addExercise(): void {
    if (!this.selectedExerciseId) return;
    const exercise = this.exerciseService.getExerciseById(this.selectedExerciseId);
    if (!exercise) return;

    const current = this.builderExercises();
    if (current.some(e => e.exerciseId === exercise.id)) return;

    this.builderExercises.set([...current, {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetSets: 3
    }]);
    this.selectedExerciseId = '';
  }

  removeExercise(index: number): void {
    const current = [...this.builderExercises()];
    current.splice(index, 1);
    this.builderExercises.set(current);
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const current = [...this.builderExercises()];
    [current[index - 1], current[index]] = [current[index], current[index - 1]];
    this.builderExercises.set(current);
  }

  moveDown(index: number): void {
    const current = [...this.builderExercises()];
    if (index >= current.length - 1) return;
    [current[index], current[index + 1]] = [current[index + 1], current[index]];
    this.builderExercises.set(current);
  }

  async save(): Promise<void> {
    if (!this.workoutName.trim()) {
      this.error.set('Please enter a template name');
      return;
    }
    if (this.builderExercises().length === 0) {
      this.error.set('Please add at least one exercise');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    try {
      const exercises: WorkoutExercise[] = this.builderExercises().map((e, i) => ({
        exerciseId: e.exerciseId,
        order: i + 1,
        targetSets: e.targetSets
      }));

      if (this.isEdit()) {
        await this.workoutService.updateWorkout(this.editId, this.workoutName.trim(), exercises);
      } else {
        await this.workoutService.createWorkout(this.workoutName.trim(), exercises);
      }
      this.router.navigate(['/workouts']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/workouts']);
  }
}
