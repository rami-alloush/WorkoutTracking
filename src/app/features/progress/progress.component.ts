import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { ExerciseService } from '../../core/services/exercise.service';
import { SessionService } from '../../core/services/session.service';
import { Exercise } from '../../shared/models/exercise.model';
import { WorkoutSession } from '../../shared/models/session.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [FormsModule, Card, Select],
  template: `
    <div class="progress-page">
      <div class="page-header">
        <h2>Progress Tracking</h2>
      </div>

      <div class="exercise-selector">
        <p-select [options]="exerciseOptions()" [(ngModel)]="selectedExerciseId"
                  optionLabel="name" optionValue="id"
                  placeholder="Select an exercise to view progress"
                  styleClass="w-full" [filter]="true" filterBy="name"
                  (onChange)="onExerciseChange()" />
      </div>

      @if (!selectedExerciseId) {
        <p-card styleClass="empty-card">
          <div class="empty-state">
            <i class="pi pi-chart-line"></i>
            <p>Select an exercise above to view your progress charts</p>
          </div>
        </p-card>
      } @else if (noData()) {
        <p-card styleClass="empty-card">
          <div class="empty-state">
            <i class="pi pi-info-circle"></i>
            <p>No data yet for this exercise. Complete some workouts first!</p>
          </div>
        </p-card>
      } @else {
        <div class="charts-grid">
          <p-card>
            <h3>Weight Progression</h3>
            <p class="chart-subtitle">Max weight per session</p>
            <div class="chart-container">
              <canvas #weightChart></canvas>
            </div>
          </p-card>

          <p-card>
            <h3>Volume Over Time</h3>
            <p class="chart-subtitle">Total volume (weight × reps) per session</p>
            <div class="chart-container">
              <canvas #volumeChart></canvas>
            </div>
          </p-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1rem;
      h2 { margin: 0; }
    }
    .exercise-selector { margin-bottom: 1.5rem; }
    .charts-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h3 { margin: 0 0 0.125rem; }
    .chart-subtitle {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      margin: 0 0 1rem;
    }
    .chart-container {
      position: relative;
      width: 100%;
      min-height: 280px;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--p-text-muted-color);
      i { font-size: 2.5rem; }
      p { margin: 0.5rem 0 0; }
    }
  `]
})
export class ProgressComponent implements OnInit {
  private exerciseService = inject(ExerciseService);
  private sessionService = inject(SessionService);

  exerciseOptions = signal<Exercise[]>([]);
  selectedExerciseId = '';
  noData = signal(false);

  @ViewChild('weightChart') weightChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartRef!: ElementRef<HTMLCanvasElement>;

  private weightChartInstance: Chart | null = null;
  private volumeChartInstance: Chart | null = null;

  async ngOnInit(): Promise<void> {
    await this.exerciseService.loadExercises();
    this.exerciseOptions.set(this.exerciseService.exercises());
  }

  async onExerciseChange(): Promise<void> {
    if (!this.selectedExerciseId) return;

    const sessions = await this.sessionService.getSessionsForExercise(this.selectedExerciseId);

    if (sessions.length === 0) {
      this.noData.set(true);
      return;
    }

    this.noData.set(false);

    const dataPoints = sessions.map(session => {
      const exerciseData = session.exercises.find(
        e => e.exerciseId === this.selectedExerciseId
      );
      if (!exerciseData) return null;

      const maxWeight = Math.max(...exerciseData.sets.map(s => s.weight), 0);
      const volume = exerciseData.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const date = session.startTime;

      return { date, maxWeight, volume };
    }).filter(Boolean) as { date: Date; maxWeight: number; volume: number }[];

    if (dataPoints.length === 0) {
      this.noData.set(true);
      return;
    }

    const labels = dataPoints.map(d =>
      d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const weights = dataPoints.map(d => d.maxWeight);
    const volumes = dataPoints.map(d => d.volume);

    setTimeout(() => {
      this.renderWeightChart(labels, weights);
      this.renderVolumeChart(labels, volumes);
    }, 100);
  }

  private renderWeightChart(labels: string[], data: number[]): void {
    if (this.weightChartInstance) this.weightChartInstance.destroy();
    if (!this.weightChartRef) return;

    this.weightChartInstance = new Chart(this.weightChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Max Weight (lbs)',
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: false,
            title: { display: true, text: 'Weight (lbs)' }
          }
        }
      }
    });
  }

  private renderVolumeChart(labels: string[], data: number[]): void {
    if (this.volumeChartInstance) this.volumeChartInstance.destroy();
    if (!this.volumeChartRef) return;

    this.volumeChartInstance = new Chart(this.volumeChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Volume (lbs)',
          data,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: '#22c55e',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Volume (lbs)' }
          }
        }
      }
    });
  }
}
