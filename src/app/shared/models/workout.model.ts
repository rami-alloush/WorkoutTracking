export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
}

export interface Workout {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  exercises: WorkoutExercise[];
}
