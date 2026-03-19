# WorkoutTracker

A personal workout tracking web application built with Angular, Firebase, PrimeNG, and Chart.js. Mobile-ready with Capacitor.

## Tech Stack

- **Frontend:** Angular 21 (standalone components, Signals)
- **UI:** PrimeNG + PrimeIcons
- **Charts:** Chart.js
- **Backend:** Firebase (Firestore + Auth)
- **Mobile:** Capacitor

## Setup

### 1. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and Google sign-in
3. Create a **Firestore** database
4. Copy your Firebase config into `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
```

### 2. Firestore Indexes

Create a composite index for each collection that uses `where` + `orderBy`:

| Collection  | Fields                              |
|-------------|-------------------------------------|
| exercises   | `userId` (Asc), `name` (Asc)       |
| workouts    | `userId` (Asc), `createdAt` (Desc)  |
| sessions    | `userId` (Asc), `startTime` (Desc)  |

### 3. Install & Run

```bash
npm install
ng serve
```

Open `http://localhost:4200`

### 4. Deploy to Firebase Hosting

```bash
ng build
firebase deploy
```

## Features

- **Auth:** Email/password + Google sign-in
- **Exercise Library:** 8 preloaded exercises, create custom exercises
- **Workout Templates:** Create, edit, reorder exercises, set target sets
- **Workout Player:** Execute workouts with pre-filled last session values, live timer, add/remove sets
- **History:** View all past sessions (locked after save)
- **Progress Charts:** Weight progression and volume over time per exercise

## Project Structure

```
src/app/
├── core/
│   ├── firebase.init.ts
│   ├── guards/auth.guard.ts
│   └── services/
│       ├── auth.service.ts
│       ├── exercise.service.ts
│       ├── workout.service.ts
│       └── session.service.ts
├── features/
│   ├── auth/ (login, register)
│   ├── dashboard/
│   ├── exercises/
│   ├── workouts/ (list, builder, player)
│   ├── history/ (list, detail)
│   └── progress/
└── shared/
    ├── components/layout/
    └── models/ (exercise, workout, session)
```

## Capacitor (Mobile)

Capacitor is pre-configured. To add platforms:

```bash
npx cap add android
npx cap add ios
npx cap sync
```
