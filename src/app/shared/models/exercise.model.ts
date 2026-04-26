export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  imageUrl?: string;
  isCustom: boolean;
  createdAt: Date;
  userId?: string;
}

/**
 * Base URL for exercise demonstration images.
 * Source: https://github.com/yuhonas/free-exercise-db (Unlicense / public domain).
 * Each image shows start + end positions of the exercise.
 */
export const EXERCISE_IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/** Build a full image URL from a relative path in the free-exercise-db repo. */
export const exerciseImage = (relativePath: string): string => EXERCISE_IMAGE_BASE + relativePath;

/**
 * Extract the free-exercise-db folder/id (e.g. "Barbell_Bench_Press_-_Medium_Grip")
 * from an imageUrl built via {@link exerciseImage}. Returns null if it does not
 * look like a free-exercise-db URL (e.g. user-supplied custom URL).
 */
export const extractExerciseFolder = (imageUrl?: string): string | null => {
  if (!imageUrl || !imageUrl.startsWith(EXERCISE_IMAGE_BASE)) return null;
  const rest = imageUrl.slice(EXERCISE_IMAGE_BASE.length);
  const slashIdx = rest.indexOf('/');
  if (slashIdx <= 0) return null;
  return rest.slice(0, slashIdx);
};

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
  'Full Body',
] as const;

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Bands',
  'Other',
] as const;

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  // Chest
  {
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Bench_Press_-_Medium_Grip/0.jpg'),
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Incline_Dumbbell_Press/0.jpg'),
  },
  {
    name: 'Dumbbell Fly',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Dumbbell_Flyes/0.jpg'),
  },
  {
    name: 'Cable Crossover',
    muscleGroup: 'Chest',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Cable_Crossover/0.jpg'),
  },
  {
    name: 'Push-up',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Pushups/0.jpg'),
  },
  {
    name: 'Chest Dip',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Dips_-_Chest_Version/0.jpg'),
  },

  // Back
  {
    name: 'Deadlift',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Deadlift/0.jpg'),
  },
  {
    name: 'Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Bent_Over_Barbell_Row/0.jpg'),
  },
  {
    name: 'Pull-up',
    muscleGroup: 'Back',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Pullups/0.jpg'),
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Wide-Grip_Lat_Pulldown/0.jpg'),
  },
  {
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Seated_Cable_Rows/0.jpg'),
  },
  {
    name: 'Dumbbell Row',
    muscleGroup: 'Back',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('One-Arm_Dumbbell_Row/0.jpg'),
  },
  {
    name: 'T-Bar Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('T-Bar_Row_with_Handle/0.jpg'),
  },

  // Shoulders
  {
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Standing_Military_Press/0.jpg'),
  },
  {
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Side_Lateral_Raise/0.jpg'),
  },
  {
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Dumbbell_Shoulder_Press/0.jpg'),
  },
  {
    name: 'Face Pull',
    muscleGroup: 'Shoulders',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Face_Pull/0.jpg'),
  },
  {
    name: 'Front Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Front_Dumbbell_Raise/0.jpg'),
  },
  {
    name: 'Reverse Fly',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Reverse_Flyes/0.jpg'),
  },

  // Biceps
  {
    name: 'Barbell Curl',
    muscleGroup: 'Biceps',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Curl/0.jpg'),
  },
  {
    name: 'Dumbbell Curl',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Dumbbell_Bicep_Curl/0.jpg'),
  },
  {
    name: 'Hammer Curl',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Hammer_Curls/0.jpg'),
  },
  {
    name: 'Preacher Curl',
    muscleGroup: 'Biceps',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Preacher_Curl/0.jpg'),
  },
  {
    name: 'Cable Curl',
    muscleGroup: 'Biceps',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Standing_Biceps_Cable_Curl/0.jpg'),
  },

  // Triceps
  {
    name: 'Tricep Pushdown',
    muscleGroup: 'Triceps',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Triceps_Pushdown/0.jpg'),
  },
  {
    name: 'Skull Crusher',
    muscleGroup: 'Triceps',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('EZ-Bar_Skullcrusher/0.jpg'),
  },
  {
    name: 'Overhead Tricep Extension',
    muscleGroup: 'Triceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Seated_Triceps_Press/0.jpg'),
  },
  {
    name: 'Tricep Dip',
    muscleGroup: 'Triceps',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Dips_-_Triceps_Version/0.jpg'),
  },
  {
    name: 'Close-Grip Bench Press',
    muscleGroup: 'Triceps',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Close-Grip_Barbell_Bench_Press/0.jpg'),
  },

  // Quadriceps
  {
    name: 'Barbell Back Squat',
    muscleGroup: 'Quadriceps',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Squat/0.jpg'),
  },
  {
    name: 'Front Squat',
    muscleGroup: 'Quadriceps',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Front_Barbell_Squat/0.jpg'),
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Quadriceps',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Leg_Press/0.jpg'),
  },
  {
    name: 'Leg Extension',
    muscleGroup: 'Quadriceps',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Leg_Extensions/0.jpg'),
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Quadriceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Split_Squats/0.jpg'),
  },
  {
    name: 'Goblet Squat',
    muscleGroup: 'Quadriceps',
    equipment: 'Kettlebell',
    isCustom: false,
    imageUrl: exerciseImage('Goblet_Squat/0.jpg'),
  },

  // Hamstrings
  {
    name: 'Romanian Deadlift',
    muscleGroup: 'Hamstrings',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Romanian_Deadlift/0.jpg'),
  },
  {
    name: 'Lying Leg Curl',
    muscleGroup: 'Hamstrings',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Lying_Leg_Curls/0.jpg'),
  },
  {
    name: 'Seated Leg Curl',
    muscleGroup: 'Hamstrings',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Seated_Leg_Curl/0.jpg'),
  },
  {
    name: 'Nordic Hamstring Curl',
    muscleGroup: 'Hamstrings',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Ball_Leg_Curl/0.jpg'),
  },

  // Glutes
  {
    name: 'Hip Thrust',
    muscleGroup: 'Glutes',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Hip_Thrust/0.jpg'),
  },
  {
    name: 'Glute Bridge',
    muscleGroup: 'Glutes',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Glute_Bridge/0.jpg'),
  },
  {
    name: 'Cable Kickback',
    muscleGroup: 'Glutes',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Glute_Kickback/0.jpg'),
  },

  // Calves
  {
    name: 'Standing Calf Raise',
    muscleGroup: 'Calves',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Standing_Calf_Raises/0.jpg'),
  },
  {
    name: 'Seated Calf Raise',
    muscleGroup: 'Calves',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Seated_Calf_Raise/0.jpg'),
  },

  // Core
  {
    name: 'Plank',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Plank/0.jpg'),
  },
  {
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Hanging_Leg_Raise/0.jpg'),
  },
  {
    name: 'Cable Crunch',
    muscleGroup: 'Core',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Cable_Crunch/0.jpg'),
  },
  {
    name: 'Ab Rollout',
    muscleGroup: 'Core',
    equipment: 'Other',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Ab_Rollout/0.jpg'),
  },
  {
    name: 'Russian Twist',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Russian_Twist/0.jpg'),
  },

  // Full Body
  {
    name: 'Clean and Press',
    muscleGroup: 'Full Body',
    equipment: 'Barbell',
    isCustom: false,
    imageUrl: exerciseImage('Clean_and_Press/0.jpg'),
  },
  {
    name: 'Kettlebell Swing',
    muscleGroup: 'Full Body',
    equipment: 'Kettlebell',
    isCustom: false,
    imageUrl: exerciseImage('One-Arm_Kettlebell_Swings/0.jpg'),
  },
  {
    name: 'Burpee',
    muscleGroup: 'Full Body',
    equipment: 'Bodyweight',
    isCustom: false,
    imageUrl: exerciseImage('Pushups/0.jpg'),
  },
  {
    name: 'Turkish Get-up',
    muscleGroup: 'Full Body',
    equipment: 'Kettlebell',
    isCustom: false,
    imageUrl: exerciseImage('Kettlebell_Turkish_Get-Up_Squat_style/0.jpg'),
  },

  // Additional exercises for program templates
  {
    name: 'Machine Chest Press',
    muscleGroup: 'Chest',
    equipment: 'Machine',
    isCustom: false,
    imageUrl: exerciseImage('Machine_Bench_Press/0.jpg'),
  },
  {
    name: 'Dumbbell Goblet Squat',
    muscleGroup: 'Quadriceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Goblet_Squat/0.jpg'),
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    muscleGroup: 'Hamstrings',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Romanian_Deadlift/0.jpg'),
  },
  {
    name: 'Cable Leg Curl',
    muscleGroup: 'Hamstrings',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Ball_Leg_Curl/0.jpg'),
  },
  {
    name: 'Standing Dumbbell Calf Raise',
    muscleGroup: 'Calves',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Standing_Dumbbell_Calf_Raise/0.jpg'),
  },
  {
    name: 'Single Arm Cable Row',
    muscleGroup: 'Back',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Seated_Cable_Rows/0.jpg'),
  },
  {
    name: 'Cable Chest Fly',
    muscleGroup: 'Chest',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Cable_Crossover/0.jpg'),
  },
  {
    name: 'Cable Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Cable_Seated_Lateral_Raise/0.jpg'),
  },
  {
    name: 'Overhead Cable Tricep Extension',
    muscleGroup: 'Triceps',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Cable_Rope_Overhead_Triceps_Extension/0.jpg'),
  },
  {
    name: 'Dumbbell Step-Up',
    muscleGroup: 'Quadriceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Dumbbell_Step_Ups/0.jpg'),
  },
  {
    name: 'Dumbbell Hip Thrust',
    muscleGroup: 'Glutes',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Hip_Thrust/0.jpg'),
  },
  {
    name: 'Walking Lunge',
    muscleGroup: 'Quadriceps',
    equipment: 'Dumbbell',
    isCustom: false,
    imageUrl: exerciseImage('Barbell_Walking_Lunge/0.jpg'),
  },
  {
    name: 'Cable Pull-Through',
    muscleGroup: 'Glutes',
    equipment: 'Cable',
    isCustom: false,
    imageUrl: exerciseImage('Pull_Through/0.jpg'),
  },
];
