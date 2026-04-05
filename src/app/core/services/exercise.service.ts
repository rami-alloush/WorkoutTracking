import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase.init';
import { Exercise, DEFAULT_EXERCISES } from '../../shared/models/exercise.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private db = getFirebaseFirestore();
  private exercisesSignal = signal<Exercise[]>([]);
  readonly exercises = this.exercisesSignal.asReadonly();

  constructor(private authService: AuthService) {}

  async loadExercises(): Promise<void> {
    // Always include built-in defaults (no Firestore dependency)
    const defaults: Exercise[] = DEFAULT_EXERCISES.map((ex, i) => ({
      ...ex,
      id: `default-${i}`,
      createdAt: new Date(0),
      userId: 'default'
    }));

    // Load user's custom exercises from Firestore
    const uid = this.authService.uid();
    let customs: Exercise[] = [];
    if (uid) {
      try {
        const ref = collection(this.db, 'exercises');
        const q = query(
          ref,
          where('userId', '==', uid),
          orderBy('name')
        );
        const snapshot = await getDocs(q);
        customs = snapshot.docs.map(d => this.fromFirestore(d.id, d.data()));
      } catch (err) {
        console.warn('Could not load custom exercises from Firestore:', err);
      }
    }

    // Merge: defaults first, then user customs
    const all = [...defaults, ...customs].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.exercisesSignal.set(all);
  }

  async addCustomExercise(name: string, muscleGroup: string, equipment?: string): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    const ref = collection(this.db, 'exercises');
    const docRef = doc(ref);
    const data: Record<string, any> = {
      name,
      muscleGroup,
      isCustom: true,
      userId: uid,
      createdAt: Timestamp.now()
    };
    if (equipment) {
      data['equipment'] = equipment;
    }
    await setDoc(docRef, data);
    await this.loadExercises();
  }

  async deleteCustomExercise(exerciseId: string): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    const exercise = this.exercises().find(e => e.id === exerciseId);
    if (!exercise || !exercise.isCustom) return;

    const ref = doc(this.db, 'exercises', exerciseId);
    await deleteDoc(ref);
    await this.loadExercises();
  }

  getExerciseById(id: string): Exercise | undefined {
    return this.exercises().find(e => e.id === id);
  }

  private fromFirestore(id: string, data: Record<string, any>): Exercise {
    return {
      id,
      name: data['name'],
      muscleGroup: data['muscleGroup'],
      equipment: data['equipment'] ?? undefined,
      isCustom: data['isCustom'] ?? false,
      createdAt: data['createdAt']?.toDate?.() ?? new Date(),
      userId: data['userId']
    };
  }
}
