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
import { Program, ProgramDay, ProgramExercise, ProgramTemplate } from '../../shared/models/program.model';
import { AuthService } from './auth.service';
import { ExerciseService } from './exercise.service';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private db = getFirebaseFirestore();
  private programsSignal = signal<Program[]>([]);
  readonly programs = this.programsSignal.asReadonly();

  constructor(
    private authService: AuthService,
    private exerciseService: ExerciseService
  ) {}

  async loadPrograms(): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    const ref = collection(this.db, 'programs');
    const q = query(ref, where('userId', '==', uid), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const programs = snapshot.docs.map(d => this.fromFirestore(d.id, d.data()));
    this.programsSignal.set(programs);
  }

  async createProgram(
    name: string,
    days: ProgramDay[],
    options?: { description?: string; daysPerWeek?: number; goal?: string; sessionLength?: string; progression?: string }
  ): Promise<string> {
    const uid = this.authService.uid();
    if (!uid) throw new Error('Not authenticated');

    const ref = collection(this.db, 'programs');
    const docRef = doc(ref);
    await setDoc(docRef, {
      name,
      description: options?.description ?? '',
      daysPerWeek: options?.daysPerWeek ?? days.length,
      goal: options?.goal ?? '',
      sessionLength: options?.sessionLength ?? '',
      progression: options?.progression ?? '',
      days,
      userId: uid,
      createdAt: Timestamp.now()
    });
    await this.loadPrograms();
    return docRef.id;
  }

  async updateProgram(
    id: string,
    name: string,
    days: ProgramDay[],
    options?: { description?: string; daysPerWeek?: number; goal?: string; sessionLength?: string; progression?: string }
  ): Promise<void> {
    const ref = doc(this.db, 'programs', id);
    await updateDoc(ref, {
      name,
      description: options?.description ?? '',
      daysPerWeek: options?.daysPerWeek ?? days.length,
      goal: options?.goal ?? '',
      sessionLength: options?.sessionLength ?? '',
      progression: options?.progression ?? '',
      days
    });
    await this.loadPrograms();
  }

  async deleteProgram(id: string): Promise<void> {
    const ref = doc(this.db, 'programs', id);
    await deleteDoc(ref);
    await this.loadPrograms();
  }

  getProgramById(id: string): Program | undefined {
    return this.programs().find(p => p.id === id);
  }

  importTemplate(template: ProgramTemplate): { days: ProgramDay[]; unmapped: string[] } {
    const exercises = this.exerciseService.exercises();
    const unmapped: string[] = [];

    const days: ProgramDay[] = template.days.map(td => ({
      name: td.name,
      exercises: td.exercises
        .map(te => {
          const match = exercises.find(e => e.name === te.exerciseName);
          if (!match) {
            unmapped.push(te.exerciseName);
            return null;
          }
          return {
            exerciseId: match.id,
            sets: te.sets,
            repsMin: te.repsMin,
            repsMax: te.repsMax,
            notes: te.notes
          } as ProgramExercise;
        })
        .filter((e): e is ProgramExercise => e !== null)
    }));

    return { days, unmapped };
  }

  private fromFirestore(id: string, data: Record<string, any>): Program {
    return {
      id,
      name: data['name'],
      description: data['description'] ?? '',
      daysPerWeek: data['daysPerWeek'] ?? 0,
      goal: data['goal'] ?? '',
      sessionLength: data['sessionLength'] ?? '',
      progression: data['progression'] ?? '',
      days: data['days'] ?? [],
      userId: data['userId'],
      createdAt: data['createdAt']?.toDate?.() ?? new Date()
    };
  }
}
