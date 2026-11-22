import { LANE_POS, ROAD_MAX, STOP_LINE } from '../src/game/constants';
import {
  activateSlowMo,
  boostVehicle,
  setAxisLights,
  startNewGame,
  stepGame,
  toggleLight,
} from '../src/game/engine';
import { Vehicle } from '../src/game/types';

function makeVehicle(overrides: Partial<Vehicle>): Vehicle {
  return {
    id: 1,
    dir: 'N',
    type: 'sedan',
    x: LANE_POS.N,
    y: 200,
    speed: 200,
    maxSpeed: 210,
    length: 76,
    width: 44,
    color: '#3B82F6',
    accentColor: '#93C5FD',
    patience: 1,
    maxPatienceSec: 10,
    isStopped: false,
    isRaging: false,
    passedIntersection: false,
    honkCooldown: 0,
    nearMissIds: [],
    boostTimer: 0,
    ...overrides,
  };
}

describe('Kavşak Kaosu engine', () => {
  test('toggles individual lights and axis presets', () => {
    let state = startNewGame(0);
    expect(state.lights.N).toBe('green');
    state = toggleLight(state, 'N');
    expect(state.lights.N).toBe('red');

    state = setAxisLights(state, 'EW');
    expect(state.lights).toEqual({
      N: 'red',
      S: 'red',
      E: 'green',
      W: 'green',
    });

    state = setAxisLights(state, 'ALL_RED');
    expect(state.lights).toEqual({
      N: 'red',
      S: 'red',
      E: 'red',
      W: 'red',
    });
  });

  test('stops vehicle at red light stop line', () => {
    let state = startNewGame(0);
    state = setAxisLights(state, 'ALL_RED');
    state.spawnTimer = 999;
    state.vehicles = [makeVehicle({ dir: 'N', y: STOP_LINE.N - 60 })];

    for (let i = 0; i < 40; i++) {
      state = stepGame(state, 0.03);
    }

    const car = state.vehicles[0];
    expect(car.isStopped).toBe(true);
    expect(car.y + car.length / 2).toBeLessThanOrEqual(STOP_LINE.N + 2);
  });

  test('scores points when vehicle clears intersection', () => {
    let state = startNewGame(0);
    state = setAxisLights(state, 'NS');
    state.spawnTimer = 999;
    state.vehicles = [makeVehicle({ dir: 'N', y: ROAD_MAX })];

    for (let i = 0; i < 20; i++) {
      state = stepGame(state, 0.03);
    }

    expect(state.carsCleared).toBe(1);
    expect(state.score).toBeGreaterThanOrEqual(10);
    expect(state.combo).toBe(2);
  });

  test('detects perpendicular collision inside intersection', () => {
    let state = startNewGame(0);
    state.lights = { N: 'green', S: 'green', E: 'green', W: 'green' };
    state.spawnTimer = 999;
    state.vehicles = [
      makeVehicle({ id: 1, dir: 'N', x: 445, y: 550 }),
      makeVehicle({ id: 2, dir: 'W', x: 440, y: 555 }),
    ];

    state = stepGame(state, 0.03);
    expect(state.phase).toBe('gameover');
    expect(state.collision?.reason).toBe('crash');
  });

  test('boostVehicle applies nitro turbo to moving car and ignores red-stopped car', () => {
    let state = startNewGame(0);
    state = setAxisLights(state, 'NS');
    state.vehicles = [makeVehicle({ id: 7, dir: 'N', y: 200 })];

    const boosted = boostVehicle(state, 7);
    expect(boosted.vehicles[0].boostTimer).toBeGreaterThan(0.5);
    expect(boosted.turboBoostsUsed).toBe(1);

    // Stopped at red light before stop line should NOT boost
    let redState = startNewGame(0);
    redState = setAxisLights(redState, 'ALL_RED');
    redState.vehicles = [makeVehicle({ id: 8, dir: 'N', y: STOP_LINE.N - 80 })];
    const notBoosted = boostVehicle(redState, 8);
    expect(notBoosted.vehicles[0].boostTimer).toBe(0);
  });

  test('activateSlowMo activates bullet time and slows simulation', () => {
    let state = startNewGame(0);
    state.slowMoEnergy = 60;
    state = activateSlowMo(state);
    expect(state.slowMoActiveSec).toBeGreaterThan(4);
    expect(state.slowMoEnergy).toBeLessThan(60);

    const stepped = stepGame(state, 0.05);
    expect(stepped.elapsedSec).toBeLessThan(0.03);
  });
});
