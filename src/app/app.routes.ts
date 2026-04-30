import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./features/legal/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'exercises', loadComponent: () => import('./features/exercises/exercise-library.component').then(m => m.ExerciseLibraryComponent) },
      { path: 'programs', loadComponent: () => import('./features/programs/program-list.component').then(m => m.ProgramListComponent) },
      { path: 'programs/new', loadComponent: () => import('./features/programs/program-builder.component').then(m => m.ProgramBuilderComponent) },
      { path: 'programs/:id', loadComponent: () => import('./features/programs/program-detail.component').then(m => m.ProgramDetailComponent) },
      { path: 'programs/:id/edit', loadComponent: () => import('./features/programs/program-builder.component').then(m => m.ProgramBuilderComponent) },
      { path: 'workouts', loadComponent: () => import('./features/workouts/workout-list.component').then(m => m.WorkoutListComponent) },
      { path: 'workouts/new', loadComponent: () => import('./features/workouts/workout-builder.component').then(m => m.WorkoutBuilderComponent) },
      { path: 'workouts/:id/edit', loadComponent: () => import('./features/workouts/workout-builder.component').then(m => m.WorkoutBuilderComponent) },
      { path: 'workouts/:id/play', loadComponent: () => import('./features/workouts/workout-player.component').then(m => m.WorkoutPlayerComponent) },
      { path: 'history', loadComponent: () => import('./features/history/history-list.component').then(m => m.HistoryListComponent) },
      { path: 'history/:id', loadComponent: () => import('./features/history/session-detail.component').then(m => m.SessionDetailComponent) },
      { path: 'progress', loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
