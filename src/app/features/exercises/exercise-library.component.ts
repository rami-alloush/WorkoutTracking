import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ExerciseService } from '../../core/services/exercise.service';
import { Exercise, MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../shared/models/exercise.model';

const MUSCLE_GROUP_ICONS: Record<string, string> = {
  'Chest': '🏋️',
  'Back': '🔙',
  'Shoulders': '💪',
  'Biceps': '💪',
  'Triceps': '💪',
  'Quadriceps': '🦵',
  'Hamstrings': '🦵',
  'Glutes': '🍑',
  'Calves': '🦵',
  'Core': '🎯',
  'Full Body': '⚡'
};

type MuscleGroupTagSeverity =
  'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

const MUSCLE_GROUP_SEVERITY: Record<string, MuscleGroupTagSeverity> = {
  'Chest': 'danger',
  'Back': 'info',
  'Shoulders': 'warn',
  'Biceps': 'success',
  'Triceps': 'success',
  'Quadriceps': 'contrast',
  'Hamstrings': 'contrast',
  'Glutes': 'secondary',
  'Calves': 'secondary',
  'Core': 'warn',
  'Full Body': 'danger'
};

@Component({
  selector: 'app-exercise-library',
  standalone: true,
  imports: [FormsModule, Button, InputText, Select, Dialog, Tag, FloatLabel, IconField, InputIcon],
  template: `
    <div class="exercise-library">
      <div class="page-header">
        <div class="header-left">
          <h2>Exercise Library</h2>
          <span class="exercise-count">{{ filteredExercises().length }} exercises</span>
        </div>
        <p-button label="Add Exercise" icon="pi pi-plus" (onClick)="showDialog.set(true)" />
      </div>

      <div class="filter-bar">
        <p-iconfield class="search-field">
          <p-inputicon styleClass="pi pi-search" />
          <input pInputText placeholder="Search exercises..." [(ngModel)]="searchTerm"
                 (ngModelChange)="filterExercises()" class="w-full" />
        </p-iconfield>

        <p-select [options]="muscleGroupFilterOptions" [(ngModel)]="selectedMuscleGroup"
                  (ngModelChange)="filterExercises()"
                  optionLabel="label" optionValue="value"
                  placeholder="All Muscle Groups" [showClear]="true"
                  styleClass="filter-select" />

        <p-select [options]="equipmentFilterOptions" [(ngModel)]="selectedEquipment"
                  (ngModelChange)="filterExercises()"
                  optionLabel="label" optionValue="value"
                  placeholder="All Equipment" [showClear]="true"
                  styleClass="filter-select" />
      </div>

      @if (activeFilters()) {
        <div class="active-filters">
          @if (selectedMuscleGroup) {
            <p-tag [value]="selectedMuscleGroup" [rounded]="true"
                   [severity]="getMuscleGroupSeverity(selectedMuscleGroup)"
                   icon="pi pi-times" styleClass="filter-chip"
                   (click)="clearMuscleGroupFilter()" />
          }
          @if (selectedEquipment) {
            <p-tag [value]="selectedEquipment" [rounded]="true" severity="info"
                   icon="pi pi-times" styleClass="filter-chip"
                   (click)="clearEquipmentFilter()" />
          }
          @if (searchTerm) {
            <p-tag [value]="'Search: ' + searchTerm" [rounded]="true" severity="secondary"
                   icon="pi pi-times" styleClass="filter-chip"
                   (click)="clearSearchFilter()" />
          }
          <a class="clear-all" (click)="clearAllFilters()">Clear all</a>
        </div>
      }

      <div class="exercise-grid">
        @for (exercise of filteredExercises(); track exercise.id) {
          <div class="exercise-card" [class.custom-card]="exercise.isCustom">
            <div class="exercise-card-header">
              <span class="muscle-icon">{{ getMuscleGroupIcon(exercise.muscleGroup) }}</span>
              <div class="card-actions">
                @if (exercise.isCustom) {
                  <button class="icon-btn delete-btn" (click)="confirmDelete(exercise)"
                          title="Delete custom exercise">
                    <i class="pi pi-trash"></i>
                  </button>
                }
              </div>
            </div>
            <div class="exercise-card-body">
              <strong class="exercise-name">{{ exercise.name }}</strong>
              <div class="exercise-tags">
                <p-tag [value]="exercise.muscleGroup" [rounded]="true"
                       [severity]="getMuscleGroupSeverity(exercise.muscleGroup)" />
                @if (exercise.equipment) {
                  <p-tag [value]="exercise.equipment" [rounded]="true" severity="secondary" />
                }
                @if (exercise.isCustom) {
                  <p-tag value="Custom" severity="info" [rounded]="true" icon="pi pi-user" />
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state-wrapper">
            <div class="empty-state">
              <i class="pi pi-search"></i>
              <h3>No exercises found</h3>
              <p>Try adjusting your search or filters</p>
              <p-button label="Clear Filters" [text]="true" icon="pi pi-filter-slash"
                        (onClick)="clearAllFilters()" />
            </div>
          </div>
        }
      </div>

      <!-- Add Exercise Dialog -->
      <p-dialog header="Add Custom Exercise" [(visible)]="showDialog"
                [modal]="true" [style]="{width: '440px'}" [draggable]="false"
                [closable]="true">
        <div class="dialog-form">
          <p-floatLabel variant="on">
            <input pInputText id="exName" [(ngModel)]="newExerciseName" class="w-full" />
            <label for="exName">Exercise Name</label>
          </p-floatLabel>

          <p-floatLabel variant="on">
            <p-select id="exMuscle" [options]="muscleGroupOptions" [(ngModel)]="newExerciseMuscle"
                      optionLabel="label" optionValue="value"
                      appendTo="body"
                      styleClass="w-full" />
            <label for="exMuscle">Muscle Group</label>
          </p-floatLabel>

          <p-floatLabel variant="on">
            <p-select id="exEquip" [options]="equipmentOptions" [(ngModel)]="newExerciseEquipment"
                      optionLabel="label" optionValue="value"
                      appendTo="body"
                      styleClass="w-full" />
            <label for="exEquip">Equipment (optional)</label>
          </p-floatLabel>
        </div>
        <ng-template #footer>
          <p-button label="Cancel" [text]="true" severity="secondary" (onClick)="showDialog.set(false)" />
          <p-button label="Add Exercise" icon="pi pi-check" (onClick)="addExercise()"
                    [loading]="saving()" [disabled]="!canSave()" />
        </ng-template>
      </p-dialog>

      <!-- Delete Confirmation Dialog -->
      <p-dialog header="Delete Exercise" [(visible)]="showDeleteDialog"
                [modal]="true" [style]="{width: '380px'}" [draggable]="false">
        <p>Are you sure you want to delete <strong>{{ exerciseToDelete()?.name }}</strong>?</p>
        <ng-template #footer>
          <p-button label="Cancel" [text]="true" severity="secondary" (onClick)="showDeleteDialog.set(false)" />
          <p-button label="Delete" icon="pi pi-trash" severity="danger"
                    (onClick)="deleteExercise()" [loading]="deleting()" />
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .exercise-library {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .header-left {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }
    .header-left h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .exercise-count {
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
      font-weight: 500;
    }

    .filter-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 200px;
    }
    :host ::ng-deep .filter-select {
      min-width: 180px;
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    :host ::ng-deep .filter-chip {
      cursor: pointer;
      transition: opacity 0.2s;
      &:hover { opacity: 0.7; }
    }
    .clear-all {
      font-size: 0.8rem;
      color: var(--p-primary-color);
      cursor: pointer;
      font-weight: 500;
      margin-left: 0.25rem;
      &:hover { text-decoration: underline; }
    }

    .exercise-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
    }

    .exercise-card {
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      border-radius: var(--p-border-radius);
      padding: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .exercise-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .exercise-card.custom-card {
      border-left: 3px solid var(--p-primary-color);
    }

    .exercise-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .muscle-icon {
      font-size: 1.5rem;
      line-height: 1;
    }
    .card-actions {
      display: flex;
      gap: 0.25rem;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--p-border-radius);
      color: var(--p-text-muted-color);
      font-size: 0.8rem;
      transition: all 0.2s;
      &:hover {
        background: var(--p-surface-hover);
      }
    }
    .delete-btn:hover {
      color: var(--p-red-500, #ef4444);
      background: rgba(239, 68, 68, 0.08);
    }

    .exercise-card-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .exercise-name {
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.3;
    }
    .exercise-tags {
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
    }

    .empty-state-wrapper {
      grid-column: 1 / -1;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--p-text-muted-color);
      background: var(--p-surface-card);
      border: 1px dashed var(--p-surface-border);
      border-radius: var(--p-border-radius);
      i { font-size: 2.5rem; margin-bottom: 0.75rem; }
      h3 {
        margin: 0.5rem 0 0.25rem;
        color: var(--p-text-color);
        font-weight: 600;
      }
      p {
        margin: 0 0 1rem;
        font-size: 0.9rem;
      }
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-top: 0.75rem;
    }

    @media (max-width: 640px) {
      .filter-bar {
        flex-direction: column;
      }
      :host ::ng-deep .filter-select {
        min-width: 100%;
      }
      .exercise-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExerciseLibraryComponent implements OnInit {
  private exerciseService = inject(ExerciseService);

  exercises = this.exerciseService.exercises;
  filteredExercises = signal<Exercise[]>([]);
  searchTerm = '';
  selectedMuscleGroup = '';
  selectedEquipment = '';

  showDialog = signal(false);
  showDeleteDialog = signal(false);
  saving = signal(false);
  deleting = signal(false);
  exerciseToDelete = signal<Exercise | null>(null);

  newExerciseName = '';
  newExerciseMuscle = '';
  newExerciseEquipment = '';

  muscleGroupOptions = MUSCLE_GROUPS.map(g => ({ label: g, value: g }));
  equipmentOptions = EQUIPMENT_TYPES.map(e => ({ label: e, value: e }));

  muscleGroupFilterOptions = MUSCLE_GROUPS.map(g => ({ label: g, value: g }));
  equipmentFilterOptions = EQUIPMENT_TYPES.map(e => ({ label: e, value: e }));

  canSave = computed(() => !!this.newExerciseName.trim() && !!this.newExerciseMuscle);
  activeFilters = computed(() => !!this.selectedMuscleGroup || !!this.selectedEquipment || !!this.searchTerm);

  constructor() {
    // React to exercise signal changes
    effect(() => {
      const _ = this.exercises();
      this.filterExercises();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.exerciseService.loadExercises();
    this.filterExercises();
  }

  getMuscleGroupIcon(group: string): string {
    return MUSCLE_GROUP_ICONS[group] ?? '🏋️';
  }

  getMuscleGroupSeverity(group: string): MuscleGroupTagSeverity {
    return MUSCLE_GROUP_SEVERITY[group] ?? undefined;
  }

  filterExercises(): void {
    let result = this.exercises();
    const term = this.searchTerm.toLowerCase();

    if (term) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(term) ||
        e.muscleGroup.toLowerCase().includes(term) ||
        (e.equipment?.toLowerCase().includes(term) ?? false)
      );
    }

    if (this.selectedMuscleGroup) {
      result = result.filter(e => e.muscleGroup === this.selectedMuscleGroup);
    }

    if (this.selectedEquipment) {
      result = result.filter(e => e.equipment === this.selectedEquipment);
    }

    this.filteredExercises.set(result);
  }

  clearMuscleGroupFilter(): void {
    this.selectedMuscleGroup = '';
    this.filterExercises();
  }

  clearEquipmentFilter(): void {
    this.selectedEquipment = '';
    this.filterExercises();
  }

  clearSearchFilter(): void {
    this.searchTerm = '';
    this.filterExercises();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedMuscleGroup = '';
    this.selectedEquipment = '';
    this.filterExercises();
  }

  async addExercise(): Promise<void> {
    if (!this.newExerciseName.trim() || !this.newExerciseMuscle) return;
    this.saving.set(true);
    try {
      await this.exerciseService.addCustomExercise(
        this.newExerciseName.trim(),
        this.newExerciseMuscle,
        this.newExerciseEquipment || undefined
      );
      this.filterExercises();
      this.newExerciseName = '';
      this.newExerciseMuscle = '';
      this.newExerciseEquipment = '';
      this.showDialog.set(false);
    } catch (err) {
      console.error('Failed to add exercise:', err);
    } finally {
      this.saving.set(false);
    }
  }

  confirmDelete(exercise: Exercise): void {
    this.exerciseToDelete.set(exercise);
    this.showDeleteDialog.set(true);
  }

  async deleteExercise(): Promise<void> {
    const exercise = this.exerciseToDelete();
    if (!exercise) return;
    this.deleting.set(true);
    try {
      await this.exerciseService.deleteCustomExercise(exercise.id);
      this.filterExercises();
      this.showDeleteDialog.set(false);
      this.exerciseToDelete.set(null);
    } catch (err) {
      console.error('Failed to delete exercise:', err);
    } finally {
      this.deleting.set(false);
    }
  }
}
