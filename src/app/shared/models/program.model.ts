export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  notes?: string;
}

export interface ProgramDay {
  name: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  daysPerWeek: number;
  goal?: string;
  sessionLength?: string;
  progression?: string;
  days: ProgramDay[];
  userId: string;
  createdAt: Date;
}

export interface ProgramTemplateExercise {
  exerciseName: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  notes?: string;
}

export interface ProgramTemplateDay {
  name: string;
  exercises: ProgramTemplateExercise[];
}

export interface ProgramTemplate {
  name: string;
  description: string;
  daysPerWeek: number;
  goal: string;
  sessionLength: string;
  progression: string;
  days: ProgramTemplateDay[];
}

export const DEFAULT_PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    name: 'Lean Muscle + Conditioning (4-Day)',
    description: 'A balanced 4-day upper/lower split focused on lean muscle building and conditioning using dumbbells, cables, and machines.',
    daysPerWeek: 4,
    goal: 'Lean muscle + conditioning',
    sessionLength: '45–60 minutes',
    progression: 'Add reps until top of range → increase weight next session',
    days: [
      {
        name: 'Day 1 – Upper Push + Pull',
        exercises: [
          { exerciseName: 'Machine Chest Press', sets: 4, repsMin: 6, repsMax: 8, notes: 'Controlled eccentric (3 sec down)' },
          { exerciseName: 'Lat Pulldown', sets: 4, repsMin: 8, repsMax: 10, notes: 'Wide or neutral grip' },
          { exerciseName: 'Dumbbell Shoulder Press', sets: 3, repsMin: 8, repsMax: 10 },
          { exerciseName: 'Seated Cable Row', sets: 3, repsMin: 10, repsMax: 12 },
          { exerciseName: 'Dumbbell Lateral Raise', sets: 3, repsMin: 12, repsMax: 15 },
          { exerciseName: 'Tricep Pushdown', sets: 3, repsMin: 12, repsMax: 12 },
          { exerciseName: 'Dumbbell Curl', sets: 3, repsMin: 12, repsMax: 12 },
        ]
      },
      {
        name: 'Day 2 – Lower Body',
        exercises: [
          { exerciseName: 'Dumbbell Goblet Squat', sets: 4, repsMin: 8, repsMax: 10 },
          { exerciseName: 'Dumbbell Romanian Deadlift', sets: 4, repsMin: 8, repsMax: 8 },
          { exerciseName: 'Bulgarian Split Squat', sets: 3, repsMin: 8, repsMax: 8, notes: 'Each leg' },
          { exerciseName: 'Cable Leg Curl', sets: 3, repsMin: 12, repsMax: 12, notes: 'Ankle strap' },
          { exerciseName: 'Standing Dumbbell Calf Raise', sets: 4, repsMin: 15, repsMax: 15 },
          { exerciseName: 'Cable Crunch', sets: 3, repsMin: 15, repsMax: 15 },
        ]
      },
      {
        name: 'Day 3 – Upper Hypertrophy (Cable Emphasis)',
        exercises: [
          { exerciseName: 'Incline Dumbbell Press', sets: 4, repsMin: 8, repsMax: 10, notes: 'Use bench' },
          { exerciseName: 'Single Arm Cable Row', sets: 3, repsMin: 10, repsMax: 10, notes: 'Each arm' },
          { exerciseName: 'Cable Chest Fly', sets: 3, repsMin: 12, repsMax: 12 },
          { exerciseName: 'Face Pull', sets: 3, repsMin: 15, repsMax: 15 },
          { exerciseName: 'Cable Lateral Raise', sets: 3, repsMin: 15, repsMax: 15, notes: 'Superset with next' },
          { exerciseName: 'Overhead Cable Tricep Extension', sets: 3, repsMin: 12, repsMax: 12, notes: 'Superset with previous' },
          { exerciseName: 'Hammer Curl', sets: 3, repsMin: 12, repsMax: 12 },
        ]
      },
      {
        name: 'Day 4 – Lower + Conditioning',
        exercises: [
          { exerciseName: 'Dumbbell Step-Up', sets: 3, repsMin: 10, repsMax: 10, notes: 'Each leg' },
          { exerciseName: 'Dumbbell Hip Thrust', sets: 4, repsMin: 8, repsMax: 10, notes: 'Bench supported' },
          { exerciseName: 'Walking Lunge', sets: 3, repsMin: 12, repsMax: 12, notes: 'Each leg' },
          { exerciseName: 'Cable Pull-Through', sets: 3, repsMin: 12, repsMax: 12 },
        ]
      }
    ]
  }
];
