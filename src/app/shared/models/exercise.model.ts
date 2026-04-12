export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
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
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Full Body'
] as const;

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Bands',
  'Other'
] as const;

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  // Chest
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', isCustom: false },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', isCustom: false },
  { name: 'Dumbbell Fly', muscleGroup: 'Chest', equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Crossover', muscleGroup: 'Chest', equipment: 'Cable', isCustom: false },
  { name: 'Push-up', muscleGroup: 'Chest', equipment: 'Bodyweight', isCustom: false },
  { name: 'Chest Dip', muscleGroup: 'Chest', equipment: 'Bodyweight', isCustom: false },

  // Back
  { name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', isCustom: false },
  { name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', isCustom: false },
  { name: 'Pull-up', muscleGroup: 'Back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', isCustom: false },
  { name: 'T-Bar Row', muscleGroup: 'Back', equipment: 'Barbell', isCustom: false },

  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Face Pull', muscleGroup: 'Shoulders', equipment: 'Cable', isCustom: false },
  { name: 'Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Reverse Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbell', isCustom: false },

  // Biceps
  { name: 'Barbell Curl', muscleGroup: 'Biceps', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Hammer Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Preacher Curl', muscleGroup: 'Biceps', equipment: 'Barbell', isCustom: false },
  { name: 'Cable Curl', muscleGroup: 'Biceps', equipment: 'Cable', isCustom: false },

  // Triceps
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Cable', isCustom: false },
  { name: 'Skull Crusher', muscleGroup: 'Triceps', equipment: 'Barbell', isCustom: false },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Tricep Dip', muscleGroup: 'Triceps', equipment: 'Bodyweight', isCustom: false },
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps', equipment: 'Barbell', isCustom: false },

  // Quadriceps
  { name: 'Barbell Back Squat', muscleGroup: 'Quadriceps', equipment: 'Barbell', isCustom: false },
  { name: 'Front Squat', muscleGroup: 'Quadriceps', equipment: 'Barbell', isCustom: false },
  { name: 'Leg Press', muscleGroup: 'Quadriceps', equipment: 'Machine', isCustom: false },
  { name: 'Leg Extension', muscleGroup: 'Quadriceps', equipment: 'Machine', isCustom: false },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Quadriceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Goblet Squat', muscleGroup: 'Quadriceps', equipment: 'Kettlebell', isCustom: false },

  // Hamstrings
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell', isCustom: false },
  { name: 'Lying Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine', isCustom: false },
  { name: 'Seated Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine', isCustom: false },
  { name: 'Nordic Hamstring Curl', muscleGroup: 'Hamstrings', equipment: 'Bodyweight', isCustom: false },

  // Glutes
  { name: 'Hip Thrust', muscleGroup: 'Glutes', equipment: 'Barbell', isCustom: false },
  { name: 'Glute Bridge', muscleGroup: 'Glutes', equipment: 'Bodyweight', isCustom: false },
  { name: 'Cable Kickback', muscleGroup: 'Glutes', equipment: 'Cable', isCustom: false },

  // Calves
  { name: 'Standing Calf Raise', muscleGroup: 'Calves', equipment: 'Machine', isCustom: false },
  { name: 'Seated Calf Raise', muscleGroup: 'Calves', equipment: 'Machine', isCustom: false },

  // Core
  { name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },
  { name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },
  { name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cable', isCustom: false },
  { name: 'Ab Rollout', muscleGroup: 'Core', equipment: 'Other', isCustom: false },
  { name: 'Russian Twist', muscleGroup: 'Core', equipment: 'Bodyweight', isCustom: false },

  // Full Body
  { name: 'Clean and Press', muscleGroup: 'Full Body', equipment: 'Barbell', isCustom: false },
  { name: 'Kettlebell Swing', muscleGroup: 'Full Body', equipment: 'Kettlebell', isCustom: false },
  { name: 'Burpee', muscleGroup: 'Full Body', equipment: 'Bodyweight', isCustom: false },
  { name: 'Turkish Get-up', muscleGroup: 'Full Body', equipment: 'Kettlebell', isCustom: false },

  // Additional exercises for program templates
  { name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', isCustom: false },
  { name: 'Dumbbell Goblet Squat', muscleGroup: 'Quadriceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Dumbbell Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Cable', isCustom: false },
  { name: 'Standing Dumbbell Calf Raise', muscleGroup: 'Calves', equipment: 'Dumbbell', isCustom: false },
  { name: 'Single Arm Cable Row', muscleGroup: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'Cable Chest Fly', muscleGroup: 'Chest', equipment: 'Cable', isCustom: false },
  { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cable', isCustom: false },
  { name: 'Overhead Cable Tricep Extension', muscleGroup: 'Triceps', equipment: 'Cable', isCustom: false },
  { name: 'Dumbbell Step-Up', muscleGroup: 'Quadriceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Dumbbell Hip Thrust', muscleGroup: 'Glutes', equipment: 'Dumbbell', isCustom: false },
  { name: 'Walking Lunge', muscleGroup: 'Quadriceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Pull-Through', muscleGroup: 'Glutes', equipment: 'Cable', isCustom: false },
];
