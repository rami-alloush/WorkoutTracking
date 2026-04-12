import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { SessionService } from '../../core/services/session.service';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutSession } from '../../shared/models/session.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [Button, Card, Tag, DatePipe],
  template: `
    <div class="history-list">
      <div class="page-header">
        <h2>Workout History</h2>
      </div>

      @if (sessions().length === 0) {
        <p-card styleClass="empty-card">
          <div class="empty-state">
            <i class="pi pi-history"></i>
            <p>No workouts completed yet</p>
            <p-button label="Start a Workout" icon="pi pi-play" routerLink="/workouts" />
          </div>
        </p-card>
      } @else {
        <div class="session-list">
          @for (session of sessions(); track session.id) {
            <p-card styleClass="session-card" (click)="viewDetail(session)">
              <div class="session-row">
                <div class="session-info">
                  <h3>{{ getWorkoutName(session.workoutId) }}</h3>
                  <div class="session-meta">
                    <span><i class="pi pi-calendar"></i> {{ session.startTime | date:'mediumDate' }}</span>
                    <span><i class="pi pi-clock"></i> {{ getDuration(session) }}</span>
                  </div>
                  <div class="session-tags">
                    <p-tag [value]="session.exercises.length + ' exercises'" [rounded]="true" />
                    <p-tag [value]="getTotalSets(session) + ' sets'" severity="info" [rounded]="true" />
                    <p-tag [value]="getTotalVolume(session)" severity="success" [rounded]="true" />
                  </div>
                </div>
                <i class="pi pi-chevron-right session-arrow"></i>
              </div>
            </p-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1rem;
      h2 { margin: 0; }
    }
    .session-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    :host ::ng-deep .session-card {
      cursor: pointer;
      transition: transform 0.15s;
      &:hover { transform: translateY(-1px); }
    }
    .session-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .session-info {
      flex: 1;
      min-width: 0;
      h3 { margin: 0 0 0.25rem; }
    }
    .session-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      margin-bottom: 0.5rem;
      i { margin-right: 0.25rem; }
    }
    .session-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .session-arrow {
      color: var(--p-text-muted-color);
      font-size: 1.2rem;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      i { font-size: 2.5rem; }
      p { margin: 0.5rem 0 1rem; }
    }
  `]
})
export class HistoryListComponent implements OnInit {
  private sessionService = inject(SessionService);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);

  sessions = this.sessionService.sessions;

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.exerciseService.loadExercises(),
      this.workoutService.loadWorkouts(),
      this.sessionService.loadSessions()
    ]);
  }

  getWorkoutName(workoutId: string): string {
    return this.workoutService.getWorkoutById(workoutId)?.name ?? 'Workout';
  }

  getDuration(session: WorkoutSession): string {
    if (!session.endTime) return '—';
    const diff = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    return `${mins} min`;
  }

  getTotalSets(session: WorkoutSession): number {
    return session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  }

  getTotalVolume(session: WorkoutSession): string {
    const vol = session.exercises.reduce((sum, e) =>
      sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
    return vol.toLocaleString() + ' lbs';
  }

  viewDetail(session: WorkoutSession): void {
    this.router.navigate(['/history', session.id]);
  }
}
