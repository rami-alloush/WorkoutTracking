import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase.init';
import { WorkoutSession, SessionExercise } from '../../shared/models/session.model';
import { AuthService } from './auth.service';
import { WeightUnitService } from './weight-unit.service';
import { WeightUnit } from '../../shared/models/weight-unit.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private db = getFirebaseFirestore();
  private sessionsSignal = signal<WorkoutSession[]>([]);
  readonly sessions = this.sessionsSignal.asReadonly();

  constructor(
    private authService: AuthService,
    private weightUnitService: WeightUnitService,
  ) {}

  async loadSessions(): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    const ref = collection(this.db, 'sessions');
    const q = query(ref, where('userId', '==', uid), orderBy('startTime', 'desc'));
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(d => this.fromFirestore(d.id, d.data()));
    this.sessionsSignal.set(sessions);
  }

  async saveSession(
    workoutId: string,
    startTime: Date,
    exercises: SessionExercise[]
  ): Promise<string> {
    const uid = this.authService.uid();
    if (!uid) throw new Error('Not authenticated');

    const ref = collection(this.db, 'sessions');
    const docRef = doc(ref);
    await setDoc(docRef, {
      workoutId,
      userId: uid,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.now(),
      exercises,
      weightUnit: 'kg',
    });
    await this.loadSessions();
    return docRef.id;
  }

  async getSessionById(id: string): Promise<WorkoutSession | null> {
    const ref = doc(this.db, 'sessions', id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return this.fromFirestore(snapshot.id, snapshot.data());
  }

  async getSessionsForExercise(exerciseId: string): Promise<WorkoutSession[]> {
    const uid = this.authService.uid();
    if (!uid) return [];

    const ref = collection(this.db, 'sessions');
    const q = query(ref, where('userId', '==', uid), orderBy('startTime', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(d => this.fromFirestore(d.id, d.data()))
      .filter(s => s.exercises.some(e => e.exerciseId === exerciseId));
  }

  getLastSessionForWorkout(workoutId: string): WorkoutSession | undefined {
    return this.sessions().find(s => s.workoutId === workoutId);
  }

  private fromFirestore(id: string, data: Record<string, any>): WorkoutSession {
    const storedWeightUnit = data['weightUnit'] === 'kg' ? 'kg' : 'lb';
    return {
      id,
      workoutId: data['workoutId'],
      userId: data['userId'],
      startTime: data['startTime']?.toDate?.() ?? new Date(),
      endTime: data['endTime']?.toDate?.() ?? null,
      exercises: this.normalizeExercises(data['exercises'] ?? [], storedWeightUnit),
    };
  }

  private normalizeExercises(
    exercises: SessionExercise[],
    storedWeightUnit: WeightUnit,
  ): SessionExercise[] {
    return exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({
        ...set,
        weight: this.weightUnitService.normalizeStoredWeight(set.weight, storedWeightUnit),
      })),
    }));
  }
}
