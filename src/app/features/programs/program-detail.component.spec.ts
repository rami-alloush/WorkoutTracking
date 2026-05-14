import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { ProgramDetailComponent } from './program-detail.component';
import { ProgramService } from '../../core/services/program.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutService } from '../../core/services/workout.service';
import { Program, ProgramDay } from '../../shared/models/program.model';
import { Workout } from '../../shared/models/workout.model';

function makeProgram(overrides: Partial<Program> = {}): Program {
  return {
    id: 'prog1',
    name: 'Test Program',
    description: 'desc',
    daysPerWeek: 1,
    goal: 'strength',
    sessionLength: '60 min',
    progression: 'linear',
    userId: 'user1',
    createdAt: new Date(),
    days: [
      {
        name: 'Day 1',
        exercises: [{ exerciseId: 'ex1', sets: 3, repsMin: 8, repsMax: 10 }],
      },
    ],
    ...overrides,
  };
}

function setup(program: Program, workouts: Workout[] = []) {
  const workoutMap = new Map(workouts.map((w) => [w.id, w]));
  let nextId = 1;
  let storedProgram = program;

  const workoutService = {
    loadWorkouts: vi.fn().mockResolvedValue(undefined),
    getWorkoutById: vi.fn((id: string) => workoutMap.get(id)),
    createWorkout: vi.fn(async (name: string, exercises: any[]) => {
      const id = 'new-workout-' + nextId++;
      workoutMap.set(id, {
        id,
        name,
        userId: 'user1',
        createdAt: new Date(),
        exercises,
      });
      return id;
    }),
    updateWorkout: vi.fn(async (id: string, name: string, exercises: any[]) => {
      const w = workoutMap.get(id);
      if (w) workoutMap.set(id, { ...w, name, exercises });
    }),
  };

  const programService = {
    loadPrograms: vi.fn().mockResolvedValue(undefined),
    getProgramById: vi.fn((id: string) =>
      id === storedProgram.id ? storedProgram : undefined,
    ),
    updateProgram: vi.fn(
      async (id: string, name: string, days: ProgramDay[], options: any) => {
        storedProgram = { ...storedProgram, name, days, ...options };
      },
    ),
  };

  const exerciseService = {
    loadExercises: vi.fn().mockResolvedValue(undefined),
    getExerciseById: vi.fn(() => ({ id: 'ex1', name: 'Bench' })),
  };

  const router = { navigate: vi.fn() };
  const route = {
    snapshot: { paramMap: { get: (k: string) => (k === 'id' ? program.id : null) } },
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: WorkoutService, useValue: workoutService },
      { provide: ProgramService, useValue: programService },
      { provide: ExerciseService, useValue: exerciseService },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: route },
    ],
  });

  const component = TestBed.runInInjectionContext(() => new ProgramDetailComponent());
  component.program.set(storedProgram);

  return {
    component,
    workoutService,
    programService,
    router,
    getStoredProgram: () => storedProgram,
  };
}

describe('ProgramDetailComponent.startDay', () => {
  it('creates a new workout and persists workoutId when day has no cached workoutId', async () => {
    const { component, workoutService, programService, router, getStoredProgram } =
      setup(makeProgram());
    const day = getStoredProgram().days[0];

    await component.startDay(day, 0);

    expect(workoutService.createWorkout).toHaveBeenCalledTimes(1);
    expect(workoutService.updateWorkout).not.toHaveBeenCalled();
    expect(programService.updateProgram).toHaveBeenCalledTimes(1);
    expect(getStoredProgram().days[0].workoutId).toBe('new-workout-1');
    expect(router.navigate).toHaveBeenCalledWith(['/workouts', 'new-workout-1', 'play']);
  });

  it('reuses existing workout when day.workoutId points to a live workout', async () => {
    const existingWorkout: Workout = {
      id: 'workout-A',
      name: 'Day 1',
      userId: 'user1',
      createdAt: new Date(),
      exercises: [{ exerciseId: 'ex1', order: 1, targetSets: 3, targetReps: 8 }],
    };
    const program = makeProgram();
    program.days[0].workoutId = existingWorkout.id;

    const { component, workoutService, programService, router } = setup(program, [
      existingWorkout,
    ]);

    await component.startDay(program.days[0], 0);

    expect(workoutService.createWorkout).not.toHaveBeenCalled();
    expect(workoutService.updateWorkout).toHaveBeenCalledTimes(1);
    expect(workoutService.updateWorkout).toHaveBeenCalledWith(
      'workout-A',
      'Day 1',
      [{ exerciseId: 'ex1', order: 1, targetSets: 3, targetReps: 8 }],
    );
    expect(programService.updateProgram).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/workouts', 'workout-A', 'play']);
  });

  it('syncs program-day changes onto the reused workout', async () => {
    const existingWorkout: Workout = {
      id: 'workout-A',
      name: 'Day 1 (old)',
      userId: 'user1',
      createdAt: new Date(),
      exercises: [{ exerciseId: 'old-ex', order: 1, targetSets: 5, targetReps: 5 }],
    };
    const program = makeProgram();
    program.days[0] = {
      name: 'Day 1 Updated',
      workoutId: existingWorkout.id,
      exercises: [
        { exerciseId: 'ex1', sets: 4, repsMin: 10, repsMax: 12 },
        { exerciseId: 'ex2', sets: 3, repsMin: 8, repsMax: 8 },
      ],
    };

    const { component, workoutService } = setup(program, [existingWorkout]);

    await component.startDay(program.days[0], 0);

    expect(workoutService.updateWorkout).toHaveBeenCalledWith(
      'workout-A',
      'Day 1 Updated',
      [
        { exerciseId: 'ex1', order: 1, targetSets: 4, targetReps: 10 },
        { exerciseId: 'ex2', order: 2, targetSets: 3, targetReps: 8 },
      ],
    );
  });

  it('creates a fresh workout when cached workoutId is stale', async () => {
    const program = makeProgram();
    program.days[0].workoutId = 'stale-id';

    const { component, workoutService, programService, getStoredProgram } = setup(
      program,
      [],
    );

    await component.startDay(program.days[0], 0);

    expect(workoutService.createWorkout).toHaveBeenCalledTimes(1);
    expect(workoutService.updateWorkout).not.toHaveBeenCalled();
    expect(programService.updateProgram).toHaveBeenCalledTimes(1);
    expect(getStoredProgram().days[0].workoutId).toBe('new-workout-1');
  });

  it('starting the same day twice creates only one workout doc', async () => {
    const { component, workoutService, getStoredProgram } = setup(makeProgram());

    await component.startDay(getStoredProgram().days[0], 0);
    await component.startDay(getStoredProgram().days[0], 0);

    expect(workoutService.createWorkout).toHaveBeenCalledTimes(1);
    expect(workoutService.updateWorkout).toHaveBeenCalledTimes(1);
  });
});
