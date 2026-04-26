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
import { Exercise, EQUIPMENT_TYPES, MUSCLE_GROUPS } from '../../shared/models/exercise.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ExerciseDetailDialogComponent } from '../../shared/components/exercise-detail-dialog/exercise-detail-dialog.component';

interface BuilderExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
}

@Component({
  selector: 'app-workout-builder',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Card,
    InputText,
    InputNumber,
    Select,
    FloatLabel,
    Message,
    LoadingComponent,
    ExerciseDetailDialogComponent,
  ],
  template: `
    <div class="workout-builder">
      <div class="page-header">
        <h2>{{ isEdit() ? 'Edit Template' : 'New Template' }}</h2>
      </div>

      @if (loading()) {
        <app-loading label="Loading..." />
      } @else {
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

            <div class="exercise-filters">
              <input
                pInputText
                [(ngModel)]="exerciseSearchTerm"
                placeholder="Search exercises"
                class="exercise-search"
              />
              <p-select
                [options]="muscleGroupFilterOptions"
                [(ngModel)]="selectedMuscleGroup"
                optionLabel="label"
                optionValue="value"
                placeholder="All muscle groups"
                [showClear]="true"
                styleClass="filter-select"
              />
              <p-select
                [options]="equipmentFilterOptions"
                [(ngModel)]="selectedEquipment"
                optionLabel="label"
                optionValue="value"
                placeholder="All equipment"
                [showClear]="true"
                styleClass="filter-select"
              />
            </div>

            <div class="add-exercise-row">
              <p-select
                [options]="filteredExerciseOptions()"
                [(ngModel)]="selectedExerciseId"
                optionLabel="name"
                optionValue="id"
                placeholder="Select exercise"
                styleClass="flex-1"
                [filter]="true"
                filterBy="name"
              />
              <p-button
                icon="pi pi-plus"
                label="Add"
                (onClick)="addExercise()"
                [disabled]="!selectedExerciseId"
              />
            </div>
            <small class="exercise-filter-summary">
              {{ filteredExerciseOptions().length }} exercise{{
                filteredExerciseOptions().length === 1 ? '' : 's'
              }}
              available
            </small>

            @if (builderExercises().length === 0) {
              <div class="empty-exercises">
                <p>No exercises added yet. Select an exercise above to add it.</p>
              </div>
            } @else {
              <div class="exercise-list">
                @for (ex of builderExercises(); track ex.exerciseId; let i = $index) {
                  <div class="exercise-row">
                    @if (getExerciseImage(ex.exerciseId); as imgUrl) {
                      <button
                        type="button"
                        class="builder-thumb-btn"
                        (click)="openDetail(ex.exerciseId)"
                        [attr.aria-label]="'View ' + ex.exerciseName + ' details'"
                      >
                        <img
                          class="builder-thumb"
                          [src]="imgUrl"
                          [alt]="ex.exerciseName"
                          loading="lazy"
                          (error)="onImageError($event)"
                        />
                      </button>
                    }
                    <div class="exercise-order">
                      <p-button
                        icon="pi pi-chevron-up"
                        [text]="true"
                        [rounded]="true"
                        size="small"
                        (onClick)="moveUp(i)"
                        [disabled]="i === 0"
                      />
                      <span class="order-num">{{ i + 1 }}</span>
                      <p-button
                        icon="pi pi-chevron-down"
                        [text]="true"
                        [rounded]="true"
                        size="small"
                        (onClick)="moveDown(i)"
                        [disabled]="i === builderExercises().length - 1"
                      />
                    </div>
                    <div class="exercise-details">
                      <strong>{{ ex.exerciseName }}</strong>
                      <div class="sets-row">
                        <label>Sets:</label>
                        <p-inputNumber
                          [(ngModel)]="ex.targetSets"
                          [min]="1"
                          [max]="20"
                          [showButtons]="true"
                        />
                      </div>
                    </div>
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      [text]="true"
                      (onClick)="removeExercise(i)"
                    />
                  </div>
                }
              </div>
            }
          </div>

          <div class="form-actions">
            <p-button label="Cancel" [text]="true" (onClick)="cancel()" />
            <p-button
              [label]="isEdit() ? 'Update' : 'Create'"
              icon="pi pi-check"
              (onClick)="save()"
              [loading]="saving()"
            />
          </div>
        </p-card>
      }

      <app-exercise-detail-dialog [exercise]="detailExercise()" [(visible)]="showDetailDialog" />
    </div>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 1rem;
        h2 {
          margin: 0;
        }
      }
      .form-section {
        margin-bottom: 1.5rem;
        h3 {
          margin: 0 0 1rem;
        }
      }
      .add-exercise-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        align-items: center;
      }
      .exercise-filters {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(180px, 1fr));
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .exercise-search {
        width: 100%;
      }
      .exercise-filter-summary {
        display: block;
        margin-bottom: 1rem;
        color: var(--p-text-muted-color);
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
      .builder-thumb-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        flex-shrink: 0;
        border-radius: var(--p-border-radius);
      }
      .builder-thumb-btn:focus-visible {
        outline: 2px solid var(--p-primary-color);
        outline-offset: 2px;
      }
      .builder-thumb-btn:hover .builder-thumb {
        transform: scale(1.05);
      }
      .builder-thumb {
        width: 56px;
        height: 42px;
        object-fit: contain;
        background: var(--p-surface-0, #fff);
        border-radius: var(--p-border-radius);
        display: block;
        transition: transform 0.15s ease;
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
        label {
          font-size: 0.875rem;
          color: var(--p-text-muted-color);
        }
      }
      :host ::ng-deep .sets-row .p-inputnumber {
        max-width: 100%;
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
      @media (max-width: 768px) {
        .exercise-filters,
        .add-exercise-row {
          display: grid;
          grid-template-columns: 1fr;
        }
        .exercise-row {
          display: grid;
          grid-template-columns: 56px 2.5rem minmax(0, 1fr) auto;
          align-items: start;
        }
        .exercise-details strong {
          white-space: normal;
        }
        .sets-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
        }
        :host ::ng-deep .sets-row .p-inputnumber,
        :host ::ng-deep .sets-row .p-inputnumber-input {
          width: 100%;
        }
      }
      @media (max-width: 520px) {
        .exercise-row {
          grid-template-columns: 56px 1fr auto;
          grid-template-areas:
            'thumb details delete'
            'order details delete';
          row-gap: 0.5rem;
        }
        .builder-thumb-btn {
          grid-area: thumb;
        }
        .exercise-order {
          grid-area: order;
          flex-direction: row;
          justify-content: flex-start;
          gap: 0.25rem;
        }
        .exercise-details {
          grid-area: details;
        }
        .exercise-row > p-button {
          grid-area: delete;
          align-self: start;
        }
      }
    `,
  ],
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
  exerciseSearchTerm = '';
  selectedMuscleGroup = '';
  selectedEquipment = '';
  error = signal('');
  saving = signal(false);
  loading = signal(true);
  showDetailDialog = signal(false);
  detailExercise = signal<Exercise | null>(null);
  muscleGroupFilterOptions = MUSCLE_GROUPS.map((group) => ({ label: group, value: group }));
  equipmentFilterOptions = EQUIPMENT_TYPES.map((equipment) => ({
    label: equipment,
    value: equipment,
  }));

  filteredExerciseOptions(): Exercise[] {
    const selectedIds = new Set(this.builderExercises().map((exercise) => exercise.exerciseId));
    const term = this.exerciseSearchTerm.trim().toLowerCase();

    return this.exerciseOptions().filter((exercise) => {
      if (selectedIds.has(exercise.id)) return false;
      if (
        term &&
        !exercise.name.toLowerCase().includes(term) &&
        !exercise.muscleGroup.toLowerCase().includes(term) &&
        !(exercise.equipment?.toLowerCase().includes(term) ?? false)
      ) {
        return false;
      }
      if (this.selectedMuscleGroup && exercise.muscleGroup !== this.selectedMuscleGroup) {
        return false;
      }
      if (this.selectedEquipment && exercise.equipment !== this.selectedEquipment) {
        return false;
      }
      return true;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadData();
    } finally {
      this.loading.set(false);
    }
  }

  private async loadData(): Promise<void> {
    await Promise.all([this.exerciseService.loadExercises(), this.workoutService.loadWorkouts()]);
    this.exerciseOptions.set(this.exerciseService.exercises());

    const id = this.route.snapshot.paramMap.get('id');
    const preselectedExerciseId = this.route.snapshot.queryParamMap.get('exerciseId');
    if (id) {
      const workout = this.workoutService.getWorkoutById(id);
      if (workout) {
        this.isEdit.set(true);
        this.editId = id;
        this.workoutName = workout.name;
        this.builderExercises.set(
          workout.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            exerciseName: this.exerciseService.getExerciseById(e.exerciseId)?.name ?? 'Unknown',
            targetSets: e.targetSets,
          })),
        );
      }
    }

    if (preselectedExerciseId) {
      this.selectedExerciseId = preselectedExerciseId;
      this.addExercise();
    }
  }

  addExercise(): void {
    if (!this.selectedExerciseId) return;
    const exercise = this.exerciseService.getExerciseById(this.selectedExerciseId);
    if (!exercise) return;

    const current = this.builderExercises();
    if (current.some((e) => e.exerciseId === exercise.id)) return;

    this.builderExercises.set([
      ...current,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetSets: 3,
      },
    ]);
    this.selectedExerciseId = '';
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
        targetSets: e.targetSets,
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
