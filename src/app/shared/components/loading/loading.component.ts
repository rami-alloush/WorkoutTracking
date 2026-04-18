import { Component, Input } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [ProgressSpinner],
  template: `
    <div class="loading-wrapper" [class.inline]="inline">
      <p-progressSpinner [style]="{ width: size, height: size }" strokeWidth="4" />
      @if (label) {
        <p class="loading-label">{{ label }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      min-height: 240px;
    }
    .loading-wrapper.inline {
      min-height: auto;
      padding: 1rem;
    }
    .loading-label {
      margin: 0;
      color: var(--p-text-muted-color);
      font-size: 0.9rem;
    }
  `]
})
export class LoadingComponent {
  @Input() label = '';
  @Input() size = '3rem';
  @Input() inline = false;
}
