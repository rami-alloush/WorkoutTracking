import { Injectable } from '@angular/core';
import {
  EXERCISE_IMAGE_BASE,
  Exercise,
  exerciseImage,
  extractExerciseFolder,
} from '../../shared/models/exercise.model';

/**
 * Subset of the free-exercise-db record we care about.
 * @see https://github.com/yuhonas/free-exercise-db/blob/main/dist/exercises.json
 */
interface FreeExerciseRecord {
  id: string;
  name: string;
  images: string[];
  instructions: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
}

const DETAILS_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

export interface ExerciseDetails {
  /** Fully-qualified image URLs in playback order. */
  images: string[];
  /** Step-by-step instructions, one per item. */
  instructions: string[];
}

@Injectable({ providedIn: 'root' })
export class ExerciseDetailsService {
  private cache: Map<string, FreeExerciseRecord> | null = null;
  private inflight: Promise<Map<string, FreeExerciseRecord>> | null = null;

  /**
   * Resolve details (images + instructions) for an exercise. Falls back to a
   * single-image / no-instruction record for custom exercises that aren't in
   * the free-exercise-db dataset.
   */
  async getDetails(exercise: Exercise): Promise<ExerciseDetails> {
    const folder = extractExerciseFolder(exercise.imageUrl);
    const fallback: ExerciseDetails = {
      images: exercise.imageUrl ? [exercise.imageUrl] : [],
      instructions: [],
    };

    if (!folder) return fallback;

    try {
      const index = await this.loadIndex();
      const record = index.get(folder);
      if (!record) return fallback;
      return {
        images: record.images.map((p) => EXERCISE_IMAGE_BASE + p),
        instructions: record.instructions ?? [],
      };
    } catch {
      // Network/parse failure — degrade gracefully: derive 0.jpg + 1.jpg from
      // the folder so the user still sees animation, without instructions.
      return {
        images: [exerciseImage(`${folder}/0.jpg`), exerciseImage(`${folder}/1.jpg`)],
        instructions: [],
      };
    }
  }

  private async loadIndex(): Promise<Map<string, FreeExerciseRecord>> {
    if (this.cache) return this.cache;
    if (this.inflight) return this.inflight;

    this.inflight = (async () => {
      const res = await fetch(DETAILS_URL);
      if (!res.ok) throw new Error(`Failed to fetch exercise details: ${res.status}`);
      const records = (await res.json()) as FreeExerciseRecord[];
      const map = new Map<string, FreeExerciseRecord>();
      for (const r of records) map.set(r.id, r);
      this.cache = map;
      return map;
    })().finally(() => {
      this.inflight = null;
    });

    return this.inflight;
  }
}
