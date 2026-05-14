import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { ProgramBuilderComponent } from './program-builder.component';
import { ProgramService } from '../../core/services/program.service';
import { ExerciseService } from '../../core/services/exercise.service';

function makeBuilderExercise(overrides: Partial<{ notes: string }> = {}) {
  return {
    exerciseId: 'ex1',
    exerciseName: 'Bench',
    sets: 3,
    repsMin: 8,
    repsMax: 10,
    notes: '',
    ...overrides,
  };
}

function setup() {
  const programService = {
    loadPrograms: vi.fn().mockResolvedValue(undefined),
    getProgramById: vi.fn(),
    createProgram: vi.fn().mockResolvedValue('new-prog-1'),
    updateProgram: vi.fn().mockResolvedValue(undefined),
  };
  const exerciseService = {
    loadExercises: vi.fn().mockResolvedValue(undefined),
    exercises: () => [],
    getExerciseById: vi.fn(() => ({ id: 'ex1', name: 'Bench' })),
  };
  const router = { navigate: vi.fn() };
  const route = {
    snapshot: {
      paramMap: { get: () => null },
      queryParamMap: { get: () => null },
    },
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: ProgramService, useValue: programService },
      { provide: ExerciseService, useValue: exerciseService },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: route },
    ],
  });

  const component = TestBed.runInInjectionContext(() => new ProgramBuilderComponent());
  return { component, programService, exerciseService, router };
}

describe('ProgramBuilderComponent.save', () => {
  it('preserves cached workoutId on days that have one', async () => {
    const { component, programService } = setup();
    component.isEdit.set(true);
    component.editId = 'prog-1';
    component.programName = 'My Prog';
    component.days.set([
      {
        name: 'Day 1',
        workoutId: 'cached-workout-1',
        exercises: [makeBuilderExercise()],
      },
      {
        name: 'Day 2',
        exercises: [makeBuilderExercise()],
      },
    ]);

    await component.save();

    expect(programService.updateProgram).toHaveBeenCalledTimes(1);
    const [savedId, savedName, savedDays] = programService.updateProgram.mock.calls[0];
    expect(savedId).toBe('prog-1');
    expect(savedName).toBe('My Prog');
    expect(savedDays).toHaveLength(2);
    expect(savedDays[0].workoutId).toBe('cached-workout-1');
    expect(savedDays[1].workoutId).toBeUndefined();
  });

  it('omits workoutId field on days without one (avoids Firestore undefined)', async () => {
    const { component, programService } = setup();
    component.isEdit.set(false);
    component.programName = 'Fresh Prog';
    component.days.set([
      {
        name: 'Day 1',
        exercises: [makeBuilderExercise()],
      },
    ]);

    await component.save();

    expect(programService.createProgram).toHaveBeenCalledTimes(1);
    const [, savedDays] = programService.createProgram.mock.calls[0];
    expect(savedDays[0]).not.toHaveProperty('workoutId');
  });
});
