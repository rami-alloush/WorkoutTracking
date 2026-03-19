import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { FloatLabel } from 'primeng/floatlabel';
import { ExerciseService } from '../../core/services/exercise.service';
import { Exercise, MUSCLE_GROUPS } from '../../shared/models/exercise.model';

@Component({
  selector: 'app-exercise-library',
  standalone: true,
  imports: [FormsModule, Button, Card, InputText, Select, Dialog, Tag, FloatLabel],
  template: `
    <div class="exercise-library">
      <div class="page-header">
        <h2>Exercise Library</h2>
        <p-button label="Add Exercise" icon="pi pi-plus" (onClick)="showDialog.set(true)" />
      </div>

      <div class="search-bar">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search"></i>
          <input pInputText placeholder="Search exercises..." [(ngModel)]="searchTerm"
                 (ngModelChange)="filterExercises()" class="w-full" />
        </span>
      </div>

      <div class="exercise-grid">
        @for (exercise of filteredExercises(); track exercise.id) {
          <p-card styleClass="exercise-card">
            <div class="exercise-item">
              <div class="exercise-info">
                <strong>{{ exercise.name }}</strong>
                <div class="exercise-meta">
                  <p-tag [value]="exercise.muscleGroup" [rounded]="true" />
                  @if (exercise.isCustom) {
                    <p-tag value="Custom" severity="info" [rounded]="true" />
                  }
                </div>
              </div>
            </div>
          </p-card>
        } @empty {
          <p-card styleClass="empty-card">
            <div class="empty-state">
              <i class="pi pi-search"></i>
              <p>No exercises found</p>
            </div>
          </p-card>
        }
      </div>

      <p-dialog header="Add Custom Exercise" [(visible)]="showDialog"
                [modal]="true" [style]="{width: '400px'}" [draggable]="false">
        <div class="dialog-form">
          <p-floatlabel variant="on">
            <input pInputText id="exName" [(ngModel)]="newExerciseName" class="w-full" />
            <label for="exName">Exercise Name</label>
          </p-floatlabel>

          <p-floatlabel variant="on">
            <p-select id="exMuscle" [options]="muscleGroupOptions" [(ngModel)]="newExerciseMuscle"
                      optionLabel="label" optionValue="value"
                      placeholder="Select Muscle Group" styleClass="w-full" />
            <label for="exMuscle">Muscle Group</label>
          </p-floatlabel>
        </div>
        <ng-template #footer>
          <p-button label="Cancel" [text]="true" (onClick)="showDialog.set(false)" />
          <p-button label="Add" icon="pi pi-check" (onClick)="addExercise()" [loading]="saving()" />
        </ng-template>
      </p-dialog>
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
    .search-bar { margin-bottom: 1rem; }
    .exercise-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.75rem;
    }
    .exercise-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .exercise-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-top: 0.5rem;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      i { font-size: 2rem; }
      p { margin: 0.5rem 0 0; }
    }
  `]
})
export class ExerciseLibraryComponent implements OnInit {
  private exerciseService = inject(ExerciseService);

  exercises = this.exerciseService.exercises;
  filteredExercises = signal<Exercise[]>([]);
  searchTerm = '';
  showDialog = signal(false);
  saving = signal(false);
  newExerciseName = '';
  newExerciseMuscle = '';
  muscleGroupOptions = MUSCLE_GROUPS.map(g => ({ label: g, value: g }));

  async ngOnInit(): Promise<void> {
    await this.exerciseService.loadExercises();
    this.filterExercises();
  }

  filterExercises(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredExercises.set(this.exercises());
    } else {
      this.filteredExercises.set(
        this.exercises().filter(e =>
          e.name.toLowerCase().includes(term) ||
          e.muscleGroup.toLowerCase().includes(term)
        )
      );
    }
  }

  async addExercise(): Promise<void> {
    if (!this.newExerciseName.trim() || !this.newExerciseMuscle) return;
    this.saving.set(true);
    try {
      await this.exerciseService.addCustomExercise(
        this.newExerciseName.trim(),
        this.newExerciseMuscle
      );
      this.filterExercises();
      this.newExerciseName = '';
      this.newExerciseMuscle = '';
      this.showDialog.set(false);
    } finally {
      this.saving.set(false);
    }
  }
}
