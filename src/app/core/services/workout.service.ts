import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase.init';
import { Workout, WorkoutExercise } from '../../shared/models/workout.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private db = getFirebaseFirestore();
  private workoutsSignal = signal<Workout[]>([]);
  readonly workouts = this.workoutsSignal.asReadonly();

  constructor(private authService: AuthService) {}

  async loadWorkouts(): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    const ref = collection(this.db, 'workouts');
    const q = query(ref, where('userId', '==', uid), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const workouts = snapshot.docs.map(d => this.fromFirestore(d.id, d.data()));
    this.workoutsSignal.set(workouts);
  }

  async createWorkout(name: string, exercises: WorkoutExercise[]): Promise<string> {
    const uid = this.authService.uid();
    if (!uid) throw new Error('Not authenticated');

    const ref = collection(this.db, 'workouts');
    const docRef = doc(ref);
    await setDoc(docRef, {
      name,
      userId: uid,
      createdAt: Timestamp.now(),
      exercises
    });
    await this.loadWorkouts();
    return docRef.id;
  }

  async updateWorkout(id: string, name: string, exercises: WorkoutExercise[]): Promise<void> {
    const ref = doc(this.db, 'workouts', id);
    await updateDoc(ref, { name, exercises });
    await this.loadWorkouts();
  }

  async addExerciseToWorkout(id: string, exerciseId: string, targetSets = 3): Promise<void> {
    const workout = this.getWorkoutById(id);
    if (!workout) throw new Error('Template not found');
    if (workout.exercises.some((exercise) => exercise.exerciseId === exerciseId)) {
      throw new Error('Exercise already exists in this template');
    }

    const nextExercises: WorkoutExercise[] = [
      ...workout.exercises,
      {
        exerciseId,
        order: workout.exercises.length + 1,
        targetSets,
      },
    ];

    await this.updateWorkout(id, workout.name, nextExercises);
  }

  async deleteWorkout(id: string): Promise<void> {
    const ref = doc(this.db, 'workouts', id);
    await deleteDoc(ref);
    await this.loadWorkouts();
  }

  getWorkoutById(id: string): Workout | undefined {
    return this.workouts().find(w => w.id === id);
  }

  private fromFirestore(id: string, data: Record<string, any>): Workout {
    return {
      id,
      name: data['name'],
      userId: data['userId'],
      createdAt: data['createdAt']?.toDate?.() ?? new Date(),
      exercises: data['exercises'] ?? []
    };
  }
}
