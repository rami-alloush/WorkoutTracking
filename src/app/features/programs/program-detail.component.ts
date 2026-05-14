import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ProgramService } from '../../core/services/program.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutService } from '../../core/services/workout.service';
import { Program, ProgramDay } from '../../shared/models/program.model';
import { WorkoutExercise } from '../../shared/models/workout.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Card,
    Tag,
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    LoadingComponent,
  ],
  template: `
    <div class="program-detail">
      @if (loading()) {
        <app-loading label="Loading program..." />
      } @else if (program()) {
        <div class="page-header">
          <div>
            <p-button
              icon="pi pi-arrow-left"
              [text]="true"
              label="Programs"
              routerLink="/programs"
            />
            <h2>{{ program()!.name }}</h2>
          </div>
          <div class="header-actions">
            <p-button
              icon="pi pi-pencil"
              label="Edit"
              [outlined]="true"
              [routerLink]="['/programs', program()!.id, 'edit']"
            />
          </div>
        </div>

        @if (program()!.description) {
          <p class="program-desc">{{ program()!.description }}</p>
        }

        <div class="program-meta-bar">
          @if (program()!.goal) {
            <p-tag [value]="program()!.goal!" icon="pi pi-flag" />
          }
          @if (program()!.sessionLength) {
            <p-tag [value]="program()!.sessionLength!" severity="info" icon="pi pi-clock" />
          }
          @if (program()!.daysPerWeek) {
            <p-tag
              [value]="program()!.daysPerWeek + ' days/week'"
              severity="secondary"
              icon="pi pi-calendar"
            />
          }
        </div>

        @if (program()!.progression) {
          <p-card styleClass="progression-card">
            <div class="progression">
              <i class="pi pi-chart-line"></i>
              <div>
                <strong>Progression</strong>
                <p>{{ program()!.progression }}</p>
              </div>
            </div>
          </p-card>
        }

        <p-accordion [multiple]="true" [value]="allDayValues()">
          @for (day of program()!.days; track day.name; let di = $index) {
            <p-accordionpanel [value]="'day-' + di">
              <p-accordionheader>
                <span class="day-header">
                  <strong>{{ day.name }}</strong>
                  <span class="exercise-count">{{ day.exercises.length }} exercises</span>
                </span>
              </p-accordionheader>
              <p-accordioncontent>
                <div class="exercise-table">
                  <div class="exercise-table-header">
                    <span class="col-num">#</span>
                    <span class="col-name">Exercise</span>
                    <span class="col-sets">Sets</span>
                    <span class="col-reps">Reps</span>
                    <span class="col-notes">Notes</span>
                  </div>
                  @for (ex of day.exercises; track ex.exerciseId; let ei = $index) {
                    <div class="exercise-table-row">
                      <span class="col-num">{{ ei + 1 }}</span>
                      <span class="col-name">{{ getExerciseName(ex.exerciseId) }}</span>
                      <span class="col-sets">{{ ex.sets }}</span>
                      <span class="col-reps">{{ formatReps(ex.repsMin, ex.repsMax) }}</span>
                      <span class="col-notes">{{ ex.notes ?? '' }}</span>
                    </div>
                  }
                </div>
                <div class="day-actions">
                  <p-button
                    label="Start This Day"
                    icon="pi pi-play"
                    (onClick)="startDay(day, di)"
                    [loading]="starting()"
                  />
                </div>
              </p-accordioncontent>
            </p-accordionpanel>
          }
        </p-accordion>
      } @else {
        <p-card>
          <div class="empty-state">
            <p>Program not found.</p>
            <p-button label="Back to Programs" icon="pi pi-arrow-left" routerLink="/programs" />
          </div>
        </p-card>
      }
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
        gap: 0.5rem;
        h2 {
          margin: 0.25rem 0 0;
        }
      }
      .header-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .program-desc {
        color: var(--p-text-muted-color);
        font-size: 0.9rem;
        margin: 0 0 0.75rem;
      }
      .program-meta-bar {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      :host ::ng-deep .progression-card {
        margin-bottom: 1rem;
      }
      .progression {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        i {
          font-size: 1.25rem;
          color: var(--p-primary-color);
          margin-top: 0.125rem;
        }
        strong {
          display: block;
          margin-bottom: 0.125rem;
        }
        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--p-text-muted-color);
        }
      }
      .day-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
      }
      .exercise-count {
        font-size: 0.8rem;
        color: var(--p-text-muted-color);
        font-weight: 400;
      }
      .exercise-table {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .exercise-table-header,
      .exercise-table-row {
        display: grid;
        grid-template-columns: 2rem 1fr 3.5rem 4rem 1fr;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        align-items: center;
      }
      .exercise-table-header {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--p-text-muted-color);
        text-transform: uppercase;
        border-bottom: 1px solid var(--p-surface-200);
      }
      .exercise-table-row {
        font-size: 0.875rem;
        border-bottom: 1px solid var(--p-surface-100);
      }
      .exercise-table-row:last-child {
        border-bottom: none;
      }
      .col-num {
        font-weight: 600;
        color: var(--p-text-muted-color);
      }
      .col-notes {
        font-size: 0.8rem;
        color: var(--p-text-muted-color);
        font-style: italic;
      }
      .day-actions {
        padding: 0.75rem 0 0;
        display: flex;
        gap: 0.5rem;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--p-text-muted-color);
      }
      @media (max-width: 600px) {
        .exercise-table-header,
        .exercise-table-row {
          grid-template-columns: 1.5rem 1fr 2.5rem 3rem;
        }
        .col-notes {
          display: none;
        }
        .exercise-table-header .col-notes {
          display: none;
        }
      }
    `,
  ],
})
export class ProgramDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);

  program = signal<Program | null>(null);
  starting = signal(false);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.exerciseService.loadExercises(),
        this.programService.loadPrograms(),
        this.workoutService.loadWorkouts(),
      ]);

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        const p = this.programService.getProgramById(id);
        this.program.set(p ?? null);
      }
    } finally {
      this.loading.set(false);
    }
  }

  allDayValues(): string[] {
    const p = this.program();
    if (!p) return [];
    return p.days.map((_, i) => 'day-' + i);
  }

  getExerciseName(exerciseId: string): string {
    return this.exerciseService.getExerciseById(exerciseId)?.name ?? 'Unknown';
  }

  formatReps(min: number, max: number): string {
    return min === max ? `${min}` : `${min}–${max}`;
  }

  async startDay(day: ProgramDay, dayIndex: number): Promise<void> {
    const program = this.program();
    if (!program) return;

    this.starting.set(true);
    try {
      const exercises: WorkoutExercise[] = day.exercises.map((e, i) => ({
        exerciseId: e.exerciseId,
        order: i + 1,
        targetSets: e.sets,
        targetReps: e.repsMin,
      }));

      const cached = day.workoutId
        ? this.workoutService.getWorkoutById(day.workoutId)
        : undefined;

      let workoutId: string;
      if (cached) {
        await this.workoutService.updateWorkout(cached.id, day.name, exercises);
        workoutId = cached.id;
      } else {
        workoutId = await this.workoutService.createWorkout(day.name, exercises);
        const updatedDays = program.days.map((d, i) =>
          i === dayIndex ? { ...d, workoutId } : d,
        );
        await this.programService.updateProgram(program.id, program.name, updatedDays, {
          description: program.description,
          daysPerWeek: program.daysPerWeek,
          goal: program.goal,
          sessionLength: program.sessionLength,
          progression: program.progression,
        });
        this.program.set(this.programService.getProgramById(program.id) ?? null);
      }

      this.router.navigate(['/workouts', workoutId, 'play']);
    } catch (err) {
      console.error('Failed to start day:', err);
    } finally {
      this.starting.set(false);
    }
  }
}
