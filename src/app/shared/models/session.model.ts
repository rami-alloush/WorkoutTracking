export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface SessionExercise {
  exerciseId: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  exercises: SessionExercise[];
}
