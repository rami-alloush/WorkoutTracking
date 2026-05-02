import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [Card, Button, RouterLink],
  template: `
    <div class="policy-shell">
      <div class="policy-header">
        <p class="eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p class="intro">
          This Privacy Policy explains how Workout Tracker collects, uses, and protects your
          information when you use the app.
        </p>
        <p class="updated">Last updated: April 29, 2026</p>
      </div>

      <p-card styleClass="policy-card">
        <section>
          <h2>Information We Collect</h2>
          <p>Workout Tracker collects information you provide directly when you use the app, including:</p>
          <ul>
            <li>Your account information, such as your email address and sign-in method.</li>
            <li>Your workout content, including exercises, workout templates, programs, and session history.</li>
            <li>Your app preferences, such as weight unit settings.</li>
          </ul>
          <p>
            If you choose Google sign-in, we also receive the basic account details needed to
            authenticate you through Google.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Create and secure your account.</li>
            <li>Save, sync, and display your workouts and training history across your devices.</li>
            <li>Maintain your preferences and improve the reliability of the app.</li>
            <li>Respond to support requests and troubleshoot issues if you contact us.</li>
          </ul>
        </section>

        <section>
          <h2>How Your Data Is Stored</h2>
          <p>
            Your account and workout data are stored using Firebase services. Access to your workout
            records, programs, sessions, and preferences is restricted to your authenticated account.
          </p>
        </section>

        <section>
          <h2>When We Share Information</h2>
          <p>
            We do not sell your personal information. We only share information with service providers
            that help operate the app, such as authentication and cloud data hosting providers, or
            when required by law.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We keep your information for as long as your account remains active or as needed to provide
            the service. If you stop using the app, your data may remain stored unless and until it is
            deleted through account cleanup or support processes.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>You can:</p>
          <ul>
            <li>Update or replace workout data directly in the app.</li>
            <li>Change app preferences, including your preferred weight unit.</li>
            <li>Choose whether to sign in with email and password or Google, when available.</li>
          </ul>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            We use reasonable administrative, technical, and platform-provided safeguards to protect
            your information. No method of storage or transmission is completely secure, so we cannot
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Workout Tracker is not intended for children under 13, and we do not knowingly collect
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            "Last updated" date on this page.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact the support channel or
            store listing associated with your copy of Workout Tracker.
          </p>
        </section>

        <div class="actions">
          <a routerLink="/login">
            <p-button label="Back to Sign In" icon="pi pi-arrow-left" [text]="true" />
          </a>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      .policy-shell {
        min-height: 100vh;
        padding: 2rem 1rem 3rem;
        background:
          radial-gradient(circle at top, color-mix(in srgb, var(--p-primary-color) 12%, transparent), transparent 35%),
          var(--p-surface-ground);
      }

      .policy-header,
      :host ::ng-deep .policy-card {
        width: min(860px, 100%);
        margin: 0 auto;
      }

      .policy-header {
        margin-bottom: 1rem;
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--p-primary-color);
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .intro,
      .updated {
        max-width: 48rem;
        color: var(--p-text-muted-color);
      }

      .updated {
        margin-top: 0.75rem;
        font-size: 0.95rem;
      }

      :host ::ng-deep .policy-card .p-card-body {
        padding: clamp(1.25rem, 2vw, 2rem);
      }

      section + section {
        margin-top: 1.5rem;
      }

      h2 {
        margin: 0 0 0.75rem;
        font-size: 1.15rem;
      }

      p,
      li {
        line-height: 1.7;
      }

      ul {
        margin: 0.75rem 0 0;
        padding-left: 1.25rem;
      }

      .actions {
        margin-top: 2rem;
        display: flex;
        justify-content: flex-start;
      }

      @media (max-width: 768px) {
        .policy-shell {
          padding: 1.25rem 0.75rem 2rem;
        }

        section + section {
          margin-top: 1.25rem;
        }
      }
    `,
  ],
})
export class PrivacyPolicyComponent {}
