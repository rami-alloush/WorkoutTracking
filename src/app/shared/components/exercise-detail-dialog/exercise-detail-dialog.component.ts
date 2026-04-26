import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Exercise } from '../../models/exercise.model';
import {
  ExerciseDetails,
  ExerciseDetailsService,
} from '../../../core/services/exercise-details.service';

/** Default ms between animation frames. ~700ms gives a clear start↔end loop. */
const FRAME_INTERVAL_MS = 700;

@Component({
  selector: 'app-exercise-detail-dialog',
  standalone: true,
  imports: [Dialog, Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [dismissableMask]="true"
      [style]="{ width: '520px', maxWidth: '95vw' }"
      [header]="exercise()?.name ?? 'Exercise'"
      (onHide)="onHide()"
    >
      @let ex = exercise();
      @if (ex) {
        <div class="detail-body">
          <div class="detail-tags">
            <p-tag [value]="ex.muscleGroup" [rounded]="true" />
            @if (ex.equipment) {
              <p-tag [value]="ex.equipment" [rounded]="true" severity="secondary" />
            }
          </div>

          <div class="image-stage">
            @if (loading()) {
              <div class="image-placeholder">
                <i class="pi pi-spin pi-spinner"></i>
              </div>
            } @else if (images().length > 0) {
              @for (src of images(); track src; let i = $index) {
                <img
                  [src]="src"
                  [alt]="ex.name + ' frame ' + (i + 1)"
                  class="frame"
                  [class.active]="i === currentFrame()"
                  (error)="onImageError($event)"
                />
              }
              @if (images().length > 1) {
                <span class="frame-indicator">
                  {{ currentFrame() + 1 }} / {{ images().length }}
                </span>
              }
            } @else {
              <div class="image-placeholder">
                <i class="pi pi-image"></i>
                <span>No demonstration available</span>
              </div>
            }
          </div>

          <div class="instructions">
            <h4>How to perform</h4>
            @if (loading()) {
              <p class="muted">Loading instructions…</p>
            } @else if (instructions().length > 0) {
              <ol>
                @for (step of instructions(); track $index) {
                  <li>{{ step }}</li>
                }
              </ol>
            } @else {
              <p class="muted">No instructions available for this exercise.</p>
            }
          </div>
        </div>
      }
    </p-dialog>
  `,
  styles: [
    `
      .detail-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-top: 0.5rem;
      }
      .detail-tags {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }
      .image-stage {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 3;
        background: var(--p-surface-ground, #f4f4f5);
        border-radius: var(--p-border-radius);
        overflow: hidden;
      }
      .frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0;
        transition: opacity 180ms ease-in-out;
      }
      .frame.active {
        opacity: 1;
      }
      .frame-indicator {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 0.75rem;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        backdrop-filter: blur(4px);
      }
      .image-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: var(--p-text-muted-color);
        font-size: 1.5rem;
      }
      .image-placeholder span {
        font-size: 0.85rem;
      }
      .instructions h4 {
        margin: 0 0 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .instructions ol {
        margin: 0;
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      .instructions .muted {
        margin: 0;
        font-size: 0.85rem;
        color: var(--p-text-muted-color);
        font-style: italic;
      }
    `,
  ],
})
export class ExerciseDetailDialogComponent implements OnDestroy {
  private detailsService = inject(ExerciseDetailsService);

  /** The exercise to show. When null, the dialog has nothing to display. */
  exercise = input<Exercise | null>(null);
  /** Two-way bound visibility, mirrors PrimeNG dialog convention. */
  visible = model<boolean>(false);
  /** Animation frame interval in ms. */
  intervalMs = input<number>(FRAME_INTERVAL_MS);

  protected loading = signal(false);
  private detailsSig = signal<ExerciseDetails | null>(null);
  protected images = computed(() => this.detailsSig()?.images ?? []);
  protected instructions = computed(() => this.detailsSig()?.instructions ?? []);
  protected currentFrame = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private loadToken = 0;

  constructor() {
    // Load details whenever the dialog opens with an exercise.
    effect(() => {
      const ex = this.exercise();
      const isOpen = this.visible();
      if (isOpen && ex) {
        void this.load(ex);
      } else {
        this.stopAnimation();
      }
    });

    // Restart animation when image set changes.
    effect(() => {
      const imgs = this.images();
      this.stopAnimation();
      this.currentFrame.set(0);
      if (imgs.length > 1 && this.visible()) {
        this.startAnimation(imgs.length);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  protected onHide(): void {
    this.stopAnimation();
    this.detailsSig.set(null);
    this.currentFrame.set(0);
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private async load(exercise: Exercise): Promise<void> {
    const token = ++this.loadToken;
    this.loading.set(true);
    this.detailsSig.set(null);
    try {
      const details = await this.detailsService.getDetails(exercise);
      if (token !== this.loadToken) return; // superseded
      this.detailsSig.set(details);
    } finally {
      if (token === this.loadToken) this.loading.set(false);
    }
  }

  private startAnimation(frameCount: number): void {
    const ms = Math.max(150, this.intervalMs());
    this.timer = setInterval(() => {
      this.currentFrame.update((i: number) => (i + 1) % frameCount);
    }, ms);
  }

  private stopAnimation(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
