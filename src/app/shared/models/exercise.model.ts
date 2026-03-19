export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  isCustom: boolean;
  createdAt: Date;
  userId?: string;
}

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Full Body'
] as const;

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  { name: 'Bench Press', muscleGroup: 'Chest', isCustom: false },
  { name: 'Squat', muscleGroup: 'Legs', isCustom: false },
  { name: 'Deadlift', muscleGroup: 'Back', isCustom: false },
  { name: 'Overhead Press', muscleGroup: 'Shoulders', isCustom: false },
  { name: 'Barbell Row', muscleGroup: 'Back', isCustom: false },
  { name: 'Pull-up', muscleGroup: 'Back', isCustom: false },
  { name: 'Bicep Curl', muscleGroup: 'Biceps', isCustom: false },
  { name: 'Tricep Extension', muscleGroup: 'Triceps', isCustom: false }
];
