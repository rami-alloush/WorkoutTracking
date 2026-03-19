import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  setDoc,
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
    const uid = this.authService.uid();
    if (!uid) return;

    const ref = collection(this.db, 'exercises');
    const q = query(
      ref,
      where('userId', 'in', [uid, 'default']),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    const exercises = snapshot.docs.map(d => this.fromFirestore(d.id, d.data()));
    this.exercisesSignal.set(exercises);
  }

  async seedDefaultExercises(): Promise<void> {
    const ref = collection(this.db, 'exercises');
    const q = query(ref, where('userId', '==', 'default'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return;

    for (const ex of DEFAULT_EXERCISES) {
      const docRef = doc(ref);
      await setDoc(docRef, {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        isCustom: false,
        userId: 'default',
        createdAt: Timestamp.now()
      });
    }
  }

  async addCustomExercise(name: string, muscleGroup: string): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    const ref = collection(this.db, 'exercises');
    const docRef = doc(ref);
    await setDoc(docRef, {
      name,
      muscleGroup,
      isCustom: true,
      userId: uid,
      createdAt: Timestamp.now()
    });
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
      isCustom: data['isCustom'] ?? false,
      createdAt: data['createdAt']?.toDate?.() ?? new Date(),
      userId: data['userId']
    };
  }
}
