import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ProgramService } from '../../core/services/program.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { Exercise } from '../../shared/models/exercise.model';
import { ProgramDay, ProgramExercise } from '../../shared/models/program.model';

interface BuilderDay {
  name: string;
  exercises: BuilderExercise[];
}

interface BuilderExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  notes: string;
}

@Component({
  selector: 'app-program-builder',
  standalone: true,
  imports: [
    FormsModule, Button, Card, InputText, InputNumber, Textarea, Select,
    FloatLabel, Message, Accordion, AccordionContent, AccordionHeader, AccordionPanel
  ],
  template: `
    <div class="program-builder">
      <div class="page-header">
        <h2>{{ isEdit() ? 'Edit Program' : 'New Program' }}</h2>
      </div>

      @if (error()) {
        <p-message severity="error" [text]="error()" styleClass="mb-3 w-full" />
      }

      <p-card styleClass="meta-card">
        <div class="form-grid">
          <p-floatlabel variant="on" class="full-width">
            <input pInputText id="progName" [(ngModel)]="programName" class="w-full" />
            <label for="progName">Program Name</label>
          </p-floatlabel>
          <p-floatlabel variant="on" class="full-width">
            <textarea pTextarea id="progDesc" [(ngModel)]="programDesc" class="w-full"
                      [rows]="2" [autoResize]="true"></textarea>
            <label for="progDesc">Description (optional)</label>
          </p-floatlabel>
          <div class="meta-row">
            <p-floatlabel variant="on">
              <input pInputText id="progGoal" [(ngModel)]="programGoal" />
              <label for="progGoal">Goal</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
              <input pInputText id="progSession" [(ngModel)]="programSession" />
              <label for="progSession">Session Length</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
              <input pInputText id="progProg" [(ngModel)]="programProgression" />
              <label for="progProg">Progression</label>
            </p-floatlabel>
          </div>
        </div>
      </p-card>

      <div class="days-header">
        <h3>Days</h3>
        <p-button icon="pi pi-plus" label="Add Day" [outlined]="true" (onClick)="addDay()" />
      </div>

      @if (days().length === 0) {
        <p-card>
          <div class="empty-days">
            <p>No days added. Click "Add Day" to start building your program.</p>
          </div>
        </p-card>
      } @else {
        <p-accordion [multiple]="true" [value]="allDayValues()">
          @for (day of days(); track $index; let di = $index) {
            <p-accordionpanel [value]="'day-' + di">
              <p-accordionheader>
                <span class="day-header-content">
                  <strong>{{ day.name || 'Day ' + (di + 1) }}</strong>
                  <span class="day-ex-count">{{ day.exercises.length }} exercises</span>
                </span>
              </p-accordionheader>
              <p-accordioncontent>
                <div class="day-form">
                  <div class="day-name-row">
                    <p-floatlabel variant="on" class="flex-1">
                      <input pInputText [id]="'dayName' + di" [(ngModel)]="day.name" class="w-full" />
                      <label [for]="'dayName' + di">Day Name</label>
                    </p-floatlabel>
                    <p-button icon="pi pi-trash" severity="danger" [outlined]="true"
                              (onClick)="removeDay(di)" pTooltip="Remove Day" />
                  </div>

                  <div class="add-exercise-row">
                    <p-select [options]="exerciseOptions()" [(ngModel)]="selectedExerciseIds[di]"
                              optionLabel="name" optionValue="id"
                              placeholder="Select exercise" styleClass="flex-1"
                              [filter]="true" filterBy="name" />
                    <p-button icon="pi pi-plus" label="Add" (onClick)="addExerciseToDay(di)"
                              [disabled]="!selectedExerciseIds[di]" />
                  </div>

                  @if (day.exercises.length > 0) {
                    <div class="exercise-list">
                      @for (ex of day.exercises; track ex.exerciseId; let ei = $index) {
                        <div class="exercise-row">
                          <div class="exercise-order-col">
                            <p-button icon="pi pi-chevron-up" [text]="true" [rounded]="true"
                                      size="small" (onClick)="moveExUp(di, ei)" [disabled]="ei === 0" />
                            <span class="order-num">{{ ei + 1 }}</span>
                            <p-button icon="pi pi-chevron-down" [text]="true" [rounded]="true"
                                      size="small" (onClick)="moveExDown(di, ei)"
                                      [disabled]="ei === day.exercises.length - 1" />
                          </div>
                          <div class="exercise-fields">
                            <strong>{{ ex.exerciseName }}</strong>
                            <div class="fields-row">
                              <div class="field-group">
                                <label>Sets</label>
                                <p-inputNumber [(ngModel)]="ex.sets" [min]="1" [max]="20"
                                               [showButtons]="true" />
                              </div>
                              <div class="field-group">
                                <label>Reps Min</label>
                                <p-inputNumber [(ngModel)]="ex.repsMin" [min]="1" [max]="100"
                                               [showButtons]="true" />
                              </div>
                              <div class="field-group">
                                <label>Reps Max</label>
                                <p-inputNumber [(ngModel)]="ex.repsMax" [min]="1" [max]="100"
                                               [showButtons]="true" />
                              </div>
                              <p-floatlabel variant="on" class="notes-field">
                                <input pInputText [id]="'notes' + di + '_' + ei" [(ngModel)]="ex.notes" />
                                <label [for]="'notes' + di + '_' + ei">Notes</label>
                              </p-floatlabel>
                            </div>
                          </div>
                          <p-button icon="pi pi-trash" severity="danger" [text]="true"
                                    (onClick)="removeExercise(di, ei)" />
                        </div>
                      }
                    </div>
                  }
                </div>
              </p-accordioncontent>
            </p-accordionpanel>
          }
        </p-accordion>
      }

      <div class="form-actions">
        <p-button label="Cancel" [text]="true" (onClick)="cancel()" />
        <p-button [label]="isEdit() ? 'Update' : 'Create'" icon="pi pi-check"
                  (onClick)="save()" [loading]="saving()" />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1rem;
      h2 { margin: 0; }
    }
    :host ::ng-deep .meta-card {
      margin-bottom: 1rem;
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .full-width { width: 100%; }
    .meta-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .meta-row > * { flex: 1; min-width: 150px; }
    .days-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      h3 { margin: 0; }
    }
    .day-header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }
    .day-ex-count {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      font-weight: 400;
    }
    .day-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .day-name-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .flex-1 { flex: 1; }
    .add-exercise-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .exercise-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--p-surface-50);
      border-radius: var(--p-border-radius);
      border: 1px solid var(--p-surface-200);
    }
    .exercise-order-col {
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
    .exercise-fields {
      flex: 1;
      min-width: 0;
      strong {
        display: block;
        margin-bottom: 0.375rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .fields-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      label {
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
      }
    }
    .notes-field { flex: 1; min-width: 120px; }
    .empty-days {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 1rem;
      margin-top: 1rem;
      border-top: 1px solid var(--p-surface-border);
    }
  `]
})
export class ProgramBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private exerciseService = inject(ExerciseService);

  isEdit = signal(false);
  editId = '';
  programName = '';
  programDesc = '';
  programGoal = '';
  programSession = '';
  programProgression = '';
  days = signal<BuilderDay[]>([]);
  exerciseOptions = signal<Exercise[]>([]);
  selectedExerciseIds: string[] = [];
  error = signal('');
  saving = signal(false);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.programService.loadPrograms()
    ]);
    this.exerciseOptions.set(this.exerciseService.exercises());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const program = this.programService.getProgramById(id);
      if (program) {
        this.isEdit.set(true);
        this.editId = id;
        this.programName = program.name;
        this.programDesc = program.description ?? '';
        this.programGoal = program.goal ?? '';
        this.programSession = program.sessionLength ?? '';
        this.programProgression = program.progression ?? '';
        this.days.set(
          program.days.map(d => ({
            name: d.name,
            exercises: d.exercises.map(e => ({
              exerciseId: e.exerciseId,
              exerciseName: this.exerciseService.getExerciseById(e.exerciseId)?.name ?? 'Unknown',
              sets: e.sets,
              repsMin: e.repsMin,
              repsMax: e.repsMax,
              notes: e.notes ?? ''
            }))
          }))
        );
        this.selectedExerciseIds = program.days.map(() => '');
      }
    }
  }

  allDayValues(): string[] {
    return this.days().map((_, i) => 'day-' + i);
  }

  addDay(): void {
    const current = this.days();
    const dayNum = current.length + 1;
    this.days.set([...current, { name: `Day ${dayNum}`, exercises: [] }]);
    this.selectedExerciseIds.push('');
  }

  removeDay(index: number): void {
    const current = [...this.days()];
    current.splice(index, 1);
    this.days.set(current);
    this.selectedExerciseIds.splice(index, 1);
  }

  addExerciseToDay(dayIndex: number): void {
    const exId = this.selectedExerciseIds[dayIndex];
    if (!exId) return;
    const exercise = this.exerciseService.getExerciseById(exId);
    if (!exercise) return;

    const current = [...this.days()];
    const day = { ...current[dayIndex], exercises: [...current[dayIndex].exercises] };

    if (day.exercises.some(e => e.exerciseId === exercise.id)) return;

    day.exercises.push({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      notes: ''
    });
    current[dayIndex] = day;
    this.days.set(current);
    this.selectedExerciseIds[dayIndex] = '';
  }

  removeExercise(dayIndex: number, exIndex: number): void {
    const current = [...this.days()];
    const day = { ...current[dayIndex], exercises: [...current[dayIndex].exercises] };
    day.exercises.splice(exIndex, 1);
    current[dayIndex] = day;
    this.days.set(current);
  }

  moveExUp(dayIndex: number, exIndex: number): void {
    if (exIndex === 0) return;
    const current = [...this.days()];
    const exercises = [...current[dayIndex].exercises];
    [exercises[exIndex - 1], exercises[exIndex]] = [exercises[exIndex], exercises[exIndex - 1]];
    current[dayIndex] = { ...current[dayIndex], exercises };
    this.days.set(current);
  }

  moveExDown(dayIndex: number, exIndex: number): void {
    const current = [...this.days()];
    const exercises = [...current[dayIndex].exercises];
    if (exIndex >= exercises.length - 1) return;
    [exercises[exIndex], exercises[exIndex + 1]] = [exercises[exIndex + 1], exercises[exIndex]];
    current[dayIndex] = { ...current[dayIndex], exercises };
    this.days.set(current);
  }

  async save(): Promise<void> {
    if (!this.programName.trim()) {
      this.error.set('Please enter a program name');
      return;
    }
    if (this.days().length === 0) {
      this.error.set('Please add at least one day');
      return;
    }
    const emptyDay = this.days().find(d => d.exercises.length === 0);
    if (emptyDay) {
      this.error.set(`"${emptyDay.name || 'Unnamed day'}" has no exercises`);
      return;
    }

    this.saving.set(true);
    this.error.set('');
    try {
      const days: ProgramDay[] = this.days().map(d => ({
        name: d.name,
        exercises: d.exercises.map(e => {
          const pe: ProgramExercise = {
            exerciseId: e.exerciseId,
            sets: e.sets,
            repsMin: e.repsMin,
            repsMax: e.repsMax
          };
          if (e.notes) pe.notes = e.notes;
          return pe;
        })
      }));

      const options = {
        description: this.programDesc.trim(),
        daysPerWeek: days.length,
        goal: this.programGoal.trim(),
        sessionLength: this.programSession.trim(),
        progression: this.programProgression.trim()
      };

      if (this.isEdit()) {
        await this.programService.updateProgram(this.editId, this.programName.trim(), days, options);
      } else {
        await this.programService.createProgram(this.programName.trim(), days, options);
      }
      this.router.navigate(['/programs']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/programs']);
  }
}
