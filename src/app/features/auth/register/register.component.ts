import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, Button, InputText, Password, Card, Message, FloatLabel],
  template: `
    <div class="auth-container">
      <p-card>
        <div class="auth-header">
          <i class="pi pi-bolt auth-icon"></i>
          <h2>Create Account</h2>
          <p>Start tracking your workouts</p>
        </div>

        @if (error()) {
          <p-message severity="error" [text]="error()" styleClass="mb-3 w-full" />
        }

        <form (ngSubmit)="onRegister()" class="auth-form">
          <p-floatlabel variant="on">
            <input pInputText id="email" [(ngModel)]="email" name="email"
                   class="w-full" autocomplete="email" />
            <label for="email">Email</label>
          </p-floatlabel>

          <p-floatlabel variant="on">
            <p-password id="password" [(ngModel)]="password" name="password"
                        [toggleMask]="true"
                        styleClass="w-full" inputStyleClass="w-full" autocomplete="new-password" />
            <label for="password">Password</label>
          </p-floatlabel>

          <p-floatlabel variant="on">
            <p-password id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword"
                        [feedback]="false" [toggleMask]="true"
                        styleClass="w-full" inputStyleClass="w-full" autocomplete="new-password" />
            <label for="confirmPassword">Confirm Password</label>
          </p-floatlabel>

          <p-button label="Create Account" icon="pi pi-user-plus" type="submit"
                    [loading]="loading()" styleClass="w-full" />

          <div class="divider"><span>or</span></div>

          <p-button label="Sign up with Google" icon="pi pi-google"
                    [outlined]="true" (onClick)="onGoogleRegister()"
                    [loading]="loading()" styleClass="w-full" />
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign in</a>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      background: var(--p-surface-ground);
    }
    :host ::ng-deep .p-card {
      width: 100%;
      max-width: 420px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
      h2 { margin: 0.5rem 0 0.25rem; font-size: 1.5rem; }
      p { color: var(--p-text-muted-color); margin: 0; }
    }
    .auth-icon {
      font-size: 2.5rem;
      color: var(--p-primary-color);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
      &::before, &::after {
        content: '';
        flex: 1;
        border-top: 1px solid var(--p-surface-border);
      }
    }
    .auth-footer {
      text-align: center;
      margin-top: 1.25rem;
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
      a {
        color: var(--p-primary-color);
        margin-left: 0.25rem;
        text-decoration: none;
        font-weight: 600;
        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  error = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister(): Promise<void> {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.error.set('Please fill in all fields');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleRegister(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Google sign-up failed');
    } finally {
      this.loading.set(false);
    }
  }
}
