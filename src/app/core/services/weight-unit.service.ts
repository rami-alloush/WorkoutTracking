import { Injectable, effect, signal } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase.init';
import { AuthService } from './auth.service';
import {
  DEFAULT_WEIGHT_UNIT,
  WEIGHT_UNIT_OPTIONS,
  WeightUnit,
} from '../../shared/models/weight-unit.model';

const POUNDS_PER_KILOGRAM = 2.2046226218;

@Injectable({ providedIn: 'root' })
export class WeightUnitService {
  private db = getFirebaseFirestore();
  private weightUnitSignal = signal<WeightUnit>(DEFAULT_WEIGHT_UNIT);
  readonly weightUnit = this.weightUnitSignal.asReadonly();
  readonly options = WEIGHT_UNIT_OPTIONS;
  private loadToken = 0;

  constructor(private authService: AuthService) {
    effect(() => {
      const uid = this.authService.uid();
      this.loadToken += 1;
      const token = this.loadToken;

      if (!uid) {
        this.weightUnitSignal.set(DEFAULT_WEIGHT_UNIT);
        return;
      }

      void this.loadPreference(uid, token);
    });
  }

  async updateWeightUnit(unit: WeightUnit): Promise<void> {
    this.weightUnitSignal.set(unit);

    const uid = this.authService.uid();
    if (!uid) return;

    await setDoc(
      doc(this.db, 'userPreferences', uid),
      {
        weightUnit: unit,
      },
      { merge: true },
    );
  }

  async ensureLoaded(): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;
    this.loadToken += 1;
    await this.loadPreference(uid, this.loadToken);
  }

  convertWeight(value: number, from: WeightUnit, to: WeightUnit, digits = 1): number {
    if (!Number.isFinite(value) || from === to) return this.round(value, digits);
    if (from === 'lb' && to === 'kg') return this.round(value / POUNDS_PER_KILOGRAM, digits);
    return this.round(value * POUNDS_PER_KILOGRAM, digits);
  }

  toDisplayWeight(valueInKg: number, digits = 1): number {
    return this.convertWeight(valueInKg, 'kg', this.weightUnit(), digits);
  }

  fromDisplayWeight(value: number, digits = 3): number {
    return this.convertWeight(value, this.weightUnit(), 'kg', digits);
  }

  normalizeStoredWeight(value: number, storedUnit: WeightUnit | null | undefined): number {
    return this.convertWeight(value, storedUnit ?? 'lb', 'kg', 3);
  }

  formatWeight(valueInKg: number, digits = 1): string {
    return `${this.formatNumber(this.toDisplayWeight(valueInKg, digits), digits)} ${this.unitLabel()}`;
  }

  formatVolume(valueInKg: number, digits = 0): string {
    return `${this.formatNumber(this.toDisplayWeight(valueInKg, digits), digits)} ${this.unitLabel()}`;
  }

  unitLabel(): string {
    return this.weightUnit();
  }

  step(): number {
    return this.weightUnit() === 'lb' ? 5 : 2.5;
  }

  private async loadPreference(uid: string, token: number): Promise<void> {
    const snapshot = await getDoc(doc(this.db, 'userPreferences', uid));
    if (token !== this.loadToken) return;

    const storedUnit = snapshot.data()?.['weightUnit'];
    this.weightUnitSignal.set(storedUnit === 'kg' || storedUnit === 'lb' ? storedUnit : DEFAULT_WEIGHT_UNIT);
  }

  private formatNumber(value: number, digits: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: digits === 0 ? 0 : value % 1 === 0 ? 0 : 1,
      maximumFractionDigits: digits,
    });
  }

  private round(value: number, digits: number): number {
    if (!Number.isFinite(value)) return 0;
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }
}
