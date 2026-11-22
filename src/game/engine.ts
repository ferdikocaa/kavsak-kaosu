import {
  BOARD_UNITS,
  DIRECTIONS,
  DIR_VECTOR,
  FEVER_COMBO_THRESHOLD,
  getLevelConfig,
  getWeatherForElapsed,
  LANE_POS,
  MAX_QUEUE_PER_LANE,
  ROAD_MAX,
  ROAD_MIN,
  SAFE_FOLLOW_GAP,
  SLOW_MO_DURATION_SEC,
  SLOW_MO_MIN_ENERGY,
  SLOW_MO_TIME_SCALE,
  SPAWN_POS,
  STOP_LINE,
  VEHICLE_SPECS,
} from './constants';
import {
  Direction,
  FloatingText,
  GameEvent,
  GameState,
  LightsState,
  Mission,
  Vehicle,
  VehicleType,
  ViewBounds,
} from './types';

const DEFAULT_VIEW_BOUNDS: ViewBounds = {
  minX: 0,
  maxX: BOARD_UNITS,
  minY: 0,
  maxY: BOARD_UNITS,
};

const MISSION_TEMPLATES: Array<{
  type: Mission['type'];
  label: (target: number) => string;
  baseTarget: number;
  reward: number;
}> = [
  {
    type: 'clear_cars',
    label: t => `${t} araç geçir`,
    baseTarget: 6,
    reward: 75,
  },
  {
    type: 'turbo_boost',
    label: t => `${t} araca Turbo ver`,
    baseTarget: 3,
    reward: 85,
  },
  {
    type: 'combo_reach',
    label: t => `x${t} seriye ulaş`,
    baseTarget: 5,
    reward: 100,
  },
  {
    type: 'near_miss',
    label: t => `${t} kıl payı geçiş yap`,
    baseTarget: 2,
    reward: 120,
  },
];

export function createMission(index: number): Mission {
  const tpl = MISSION_TEMPLATES[index % MISSION_TEMPLATES.length];
  const tier = Math.floor(index / MISSION_TEMPLATES.length);
  const target =
    tpl.type === 'combo_reach'
      ? Math.min(8, tpl.baseTarget + tier)
      : tpl.baseTarget + tier * (tpl.type === 'clear_cars' ? 3 : 1);
  return {
    id: index + 1,
    type: tpl.type,
    label: tpl.label(target),
    target,
    progress: 0,
    reward: tpl.reward + tier * 25,
  };
}

export function createInitialState(bestScore = 0): GameState {
  return {
    phase: 'menu',
    score: 0,
    bestScore,
    combo: 1,
    maxCombo: 1,
    carsCleared: 0,
    nearMisses: 0,
    turboBoostsUsed: 0,
    missionsCompleted: 0,
    level: 1,
    elapsedSec: 0,
    weather: 'day',
    isFever: false,
    slowMoEnergy: 45, // Start with enough energy to try Slow-Mo right away!
    slowMoActiveSec: 0,
    mission: createMission(0),
    lights: {
      N: 'green',
      S: 'green',
      E: 'red',
      W: 'red',
    },
    vehicles: [],
    floatingTexts: [],
    collision: null,
    spawnTimer: 0.45,
    nextId: 1,
    shake: 0,
    events: [],
  };
}

export function startNewGame(prevBestScore: number): GameState {
  return {
    ...createInitialState(prevBestScore),
    phase: 'playing',
  };
}

export function toggleLight(state: GameState, dir: Direction): GameState {
  if (state.phase !== 'playing') {
    return state;
  }
  const nextColor = state.lights[dir] === 'green' ? 'red' : 'green';
  return {
    ...state,
    lights: {
      ...state.lights,
      [dir]: nextColor,
    },
  };
}

export function setAxisLights(
  state: GameState,
  mode: 'NS' | 'EW' | 'ALL_RED',
): GameState {
  if (state.phase !== 'playing') {
    return state;
  }
  const lights: LightsState =
    mode === 'NS'
      ? { N: 'green', S: 'green', E: 'red', W: 'red' }
      : mode === 'EW'
        ? { N: 'red', S: 'red', E: 'green', W: 'green' }
        : { N: 'red', S: 'red', E: 'red', W: 'red' };
  return {
    ...state,
    lights,
  };
}

/** Activate Bullet-Time Slow-Mo when enough energy is charged */
export function activateSlowMo(state: GameState): GameState {
  if (
    state.phase !== 'playing' ||
    state.slowMoActiveSec > 0 ||
    state.slowMoEnergy < SLOW_MO_MIN_ENERGY
  ) {
    return state;
  }
  const nextId = state.nextId + 1;
  return {
    ...state,
    slowMoEnergy: Math.max(0, state.slowMoEnergy - 45),
    slowMoActiveSec: SLOW_MO_DURATION_SEC,
    nextId,
    floatingTexts: [
      ...state.floatingTexts,
      {
        id: state.nextId,
        x: 500,
        y: 320,
        text: '⏱️ ZAMAN YAVAŞLADI!',
        color: '#38BDF8',
        age: 0,
        duration: 1.15,
      },
    ],
    events: [...state.events, 'slowmo'],
  };
}

/** Tap a moving vehicle to give it an instant Nitro Turbo Boost! */
export function boostVehicle(state: GameState, vehicleId: number): GameState {
  if (state.phase !== 'playing') {
    return state;
  }
  const target = state.vehicles.find(v => v.id === vehicleId);
  if (!target || target.boostTimer > 0.15) {
    return state;
  }
  // Don't boost cars that are stopped at a red light before the stop line
  const stopLineProg = getStopLineProgress(target.dir);
  const frontBumper = getAxisProgress(target) + target.length / 2;
  if (
    state.lights[target.dir] === 'red' &&
    !target.isRaging &&
    frontBumper <= stopLineProg + 14
  ) {
    return state;
  }

  let nextId = state.nextId;
  const floatingTexts = [
    ...state.floatingTexts,
    {
      id: nextId++,
      x: target.x,
      y: target.y - 26,
      text: '💨 TURBO!',
      color: '#38BDF8',
      age: 0,
      duration: 0.75,
    },
  ];

  const vehicles = state.vehicles.map(v =>
    v.id === vehicleId
      ? {
          ...v,
          boostTimer: 1.15,
          speed: Math.max(v.speed, v.maxSpeed * 1.65),
          isStopped: false,
        }
      : v,
  );

  let mission = { ...state.mission };
  let score = state.score;
  let slowMoEnergy = state.slowMoEnergy;
  let missionsCompleted = state.missionsCompleted;
  const events: GameEvent[] = [...state.events, 'turbo'];

  if (mission.type === 'turbo_boost') {
    mission.progress += 1;
    if (mission.progress >= mission.target) {
      score += mission.reward;
      slowMoEnergy = Math.min(100, slowMoEnergy + 25);
      missionsCompleted += 1;
      events.push('mission');
      floatingTexts.push({
        id: nextId++,
        x: 500,
        y: 280,
        text: `🎯 GÖREV TAMAM! +${mission.reward}`,
        color: '#4ADE80',
        age: 0,
        duration: 1.35,
      });
      mission = createMission(missionsCompleted);
    }
  }

  return {
    ...state,
    score,
    bestScore: Math.max(state.bestScore, score),
    slowMoEnergy,
    turboBoostsUsed: state.turboBoostsUsed + 1,
    missionsCompleted,
    mission,
    vehicles,
    floatingTexts,
    nextId,
    events,
  };
}

/** Returns progress coordinate along the vehicle's travel axis (higher = further along) */
function getAxisProgress(v: Vehicle): number {
  switch (v.dir) {
    case 'N':
      return v.y;
    case 'S':
      return BOARD_UNITS - v.y;
    case 'W':
      return v.x;
    case 'E':
      return BOARD_UNITS - v.x;
  }
}

/** Returns stop line in progress coordinates (higher = further along) */
function getStopLineProgress(dir: Direction): number {
  switch (dir) {
    case 'N':
      return STOP_LINE.N;
    case 'S':
      return BOARD_UNITS - STOP_LINE.S;
    case 'W':
      return STOP_LINE.W;
    case 'E':
      return BOARD_UNITS - STOP_LINE.E;
  }
}

/** Returns vehicle bounding box in board coordinates */
function getVehicleBox(v: Vehicle, inset = 0) {
  const isVertical = v.dir === 'N' || v.dir === 'S';
  const halfW = (isVertical ? v.width : v.length) / 2 - inset;
  const halfH = (isVertical ? v.length : v.width) / 2 - inset;
  return {
    left: v.x - halfW,
    right: v.x + halfW,
    top: v.y - halfH,
    bottom: v.y + halfH,
  };
}

function boxesOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
): boolean {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function isInsideIntersection(v: Vehicle): boolean {
  const margin = v.length / 2;
  return (
    v.x > ROAD_MIN - margin &&
    v.x < ROAD_MAX + margin &&
    v.y > ROAD_MIN - margin &&
    v.y < ROAD_MAX + margin
  );
}

function pickVehicleType(weights: Record<VehicleType, number>): VehicleType {
  const total =
    weights.sedan +
    weights.sport +
    weights.truck +
    weights.ambulance +
    weights.vip;
  let r = Math.random() * total;
  const types: VehicleType[] = ['sedan', 'sport', 'truck', 'ambulance', 'vip'];
  for (const t of types) {
    r -= weights[t];
    if (r <= 0) {
      return t;
    }
  }
  return 'sedan';
}

function addFloatingText(
  list: FloatingText[],
  nextIdRef: { current: number },
  x: number,
  y: number,
  text: string,
  color: string,
  duration = 0.95,
) {
  list.push({
    id: nextIdRef.current++,
    x,
    y,
    text,
    color,
    age: 0,
    duration,
  });
}

function getDynamicSpawnCoord(dir: Direction, bounds: ViewBounds): number {
  switch (dir) {
    case 'N':
      return Math.min(SPAWN_POS.N, bounds.minY - 65);
    case 'S':
      return Math.max(SPAWN_POS.S, bounds.maxY + 65);
    case 'W':
      return Math.min(SPAWN_POS.W, bounds.minX - 65);
    case 'E':
      return Math.max(SPAWN_POS.E, bounds.maxX + 65);
  }
}

function getDynamicSpawnProgress(dir: Direction, bounds: ViewBounds): number {
  const coord = getDynamicSpawnCoord(dir, bounds);
  switch (dir) {
    case 'N':
    case 'W':
      return coord;
    case 'S':
    case 'E':
      return BOARD_UNITS - coord;
  }
}

export function stepGame(
  state: GameState,
  rawDt: number,
  viewBounds: ViewBounds = DEFAULT_VIEW_BOUNDS,
): GameState {
  if (state.phase !== 'playing') {
    if (state.shake > 0) {
      return { ...state, shake: Math.max(0, state.shake - rawDt * 2.8) };
    }
    return state;
  }

  // Clamp real dt to avoid physics jumps on background/frame drops
  const realDt = Math.min(rawDt, 0.05);
  const slowMoActiveSec = Math.max(0, state.slowMoActiveSec - realDt);
  const simDt =
    state.slowMoActiveSec > 0 ? realDt * SLOW_MO_TIME_SCALE : realDt;

  const nextIdRef = { current: state.nextId };
  const events: GameEvent[] = [];
  const floatingTexts: FloatingText[] = [];

  // Update existing floating texts (smooth in real time)
  for (const ft of state.floatingTexts) {
    const age = ft.age + realDt;
    if (age < ft.duration) {
      floatingTexts.push({
        ...ft,
        age,
        y: ft.y - 42 * realDt,
      });
    }
  }

  let score = state.score;
  let combo = state.combo;
  let maxCombo = state.maxCombo;
  let carsCleared = state.carsCleared;
  let nearMisses = state.nearMisses;
  let slowMoEnergy = state.slowMoEnergy;
  let missionsCompleted = state.missionsCompleted;
  let mission: Mission = { ...state.mission };
  let shake = Math.max(0, state.shake - realDt * 3.0);

  const newElapsedSec = state.elapsedSec + simDt;
  const weather = getWeatherForElapsed(newElapsedSec);
  const levelCfg = getLevelConfig(score);

  const checkMissionAdvance = (
    type: Mission['type'],
    amount = 1,
    absoluteVal?: number,
  ) => {
    if (mission.type !== type) {
      return;
    }
    if (absoluteVal !== undefined) {
      mission.progress = Math.max(mission.progress, absoluteVal);
    } else {
      mission.progress += amount;
    }
    if (mission.progress >= mission.target) {
      score += mission.reward;
      slowMoEnergy = Math.min(100, slowMoEnergy + 25);
      missionsCompleted += 1;
      events.push('mission');
      addFloatingText(
        floatingTexts,
        nextIdRef,
        500,
        280,
        `🎯 GÖREV TAMAM! +${mission.reward}`,
        '#4ADE80',
        1.35,
      );
      mission = createMission(missionsCompleted);
    }
  };

  // Clone vehicles for mutation in this frame
  let vehicles = state.vehicles.map(v => ({
    ...v,
    nearMissIds: [...v.nearMissIds],
  }));

  // 1. Spawning new vehicles
  let spawnTimer = state.spawnTimer - simDt;
  let gridlockDir: Direction | null = null;

  if (spawnTimer <= 0) {
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const laneVehicles = vehicles.filter(v => v.dir === dir);

    const spawnProg = getDynamicSpawnProgress(dir, viewBounds);
    const spawnBlocked = laneVehicles.some(
      v => getAxisProgress(v) < spawnProg + 135,
    );
    const waitingCount = laneVehicles.filter(
      v => v.isStopped && !v.passedIntersection,
    ).length;

    if (
      waitingCount >= MAX_QUEUE_PER_LANE + 1 ||
      (waitingCount >= MAX_QUEUE_PER_LANE && spawnBlocked)
    ) {
      gridlockDir = dir;
    } else if (!spawnBlocked) {
      const type = pickVehicleType(levelCfg.weights);
      const spec = VEHICLE_SPECS[type];
      const palette =
        spec.colors[Math.floor(Math.random() * spec.colors.length)];

      const spawnCoord = getDynamicSpawnCoord(dir, viewBounds);
      const x = dir === 'N' || dir === 'S' ? LANE_POS[dir] : spawnCoord;
      const y = dir === 'E' || dir === 'W' ? LANE_POS[dir] : spawnCoord;

      const newVehicle: Vehicle = {
        id: nextIdRef.current++,
        dir,
        type,
        x,
        y,
        speed: spec.maxSpeed * levelCfg.speedMultiplier * 0.85,
        maxSpeed: spec.maxSpeed * levelCfg.speedMultiplier,
        length: spec.length,
        width: spec.width,
        color: palette.body,
        accentColor: palette.accent,
        patience: 1,
        maxPatienceSec: spec.maxPatienceSec,
        isStopped: false,
        isRaging: false,
        passedIntersection: false,
        honkCooldown: 0,
        nearMissIds: [],
        boostTimer: 0,
      };
      vehicles.push(newVehicle);

      if (type === 'ambulance' || type === 'vip') {
        events.push(type === 'ambulance' ? 'ambulance' : 'vip');
        const labelX =
          dir === 'W'
            ? Math.max(viewBounds.minX + 120, 120)
            : dir === 'E'
              ? Math.min(viewBounds.maxX - 120, 880)
              : x;
        const labelY =
          dir === 'N'
            ? Math.max(viewBounds.minY + 260, 120)
            : dir === 'S'
              ? Math.min(viewBounds.maxY - 260, 880)
              : y;
        addFloatingText(
          floatingTexts,
          nextIdRef,
          labelX,
          labelY,
          type === 'ambulance' ? '🚑 AMBULANS!' : '👑 VIP KONVOY!',
          type === 'ambulance' ? '#EF4444' : '#FACC15',
          1.25,
        );
      }
    }

    const span = levelCfg.spawnIntervalMax - levelCfg.spawnIntervalMin;
    spawnTimer = levelCfg.spawnIntervalMin + Math.random() * span;
  }

  // Handle gridlock game over
  if (gridlockDir) {
    const gx =
      gridlockDir === 'N' || gridlockDir === 'S'
        ? LANE_POS[gridlockDir]
        : gridlockDir === 'W'
          ? 85
          : 915;
    const gy =
      gridlockDir === 'E' || gridlockDir === 'W'
        ? LANE_POS[gridlockDir]
        : gridlockDir === 'N'
          ? 85
          : 915;
    const bestScore = Math.max(state.bestScore, score);
    return {
      ...state,
      phase: 'gameover',
      score,
      bestScore,
      combo,
      maxCombo,
      carsCleared,
      nearMisses,
      missionsCompleted,
      mission,
      slowMoEnergy,
      slowMoActiveSec: 0,
      weather,
      isFever: combo >= FEVER_COMBO_THRESHOLD,
      level: levelCfg.level,
      vehicles,
      floatingTexts,
      collision: {
        x: gx,
        y: gy,
        reason: 'gridlock',
        message:
          'Trafik tamamen kilitlendi! Bir şerit çok uzun süre kapalı kaldı.',
      },
      shake: 1,
      events: ['crash'],
      nextId: nextIdRef.current,
    };
  }

  // Rain makes roads slightly slicker (longer braking distance)
  const brakeRate = weather === 'rain' ? 540 : 780;
  const brakeDistDivisor = weather === 'rain' ? 460 : 620;
  const isFever = combo >= FEVER_COMBO_THRESHOLD;

  // 2. Move vehicles lane by lane (sorted front-to-back)
  for (const dir of DIRECTIONS) {
    const laneCars = vehicles
      .filter(v => v.dir === dir)
      .sort((a, b) => getAxisProgress(b) - getAxisProgress(a));

    const stopLineProg = getStopLineProgress(dir);
    const isRed = state.lights[dir] === 'red';
    const vec = DIR_VECTOR[dir];

    for (let i = 0; i < laneCars.length; i++) {
      const car = laneCars[i];
      if (car.boostTimer > 0) {
        car.boostTimer = Math.max(0, car.boostTimer - simDt);
      }

      const prog = getAxisProgress(car);
      const frontBumper = prog + car.length / 2;

      let maxAllowedFront = Infinity;

      // A) Red light stop constraint
      if (isRed && !car.isRaging && frontBumper <= stopLineProg + 14) {
        maxAllowedFront = Math.min(maxAllowedFront, stopLineProg);
      }

      // B) Car ahead in the same lane
      if (i > 0) {
        const ahead = laneCars[i - 1];
        const aheadBackBumper = getAxisProgress(ahead) - ahead.length / 2;
        maxAllowedFront = Math.min(
          maxAllowedFront,
          aheadBackBumper - SAFE_FOLLOW_GAP,
        );
      }

      const distToObstacle = maxAllowedFront - frontBumper;
      const brakingDist =
        (car.speed * car.speed) / (2 * brakeDistDivisor) + 8;

      let targetSpeed = car.maxSpeed;
      if (car.boostTimer > 0) {
        targetSpeed = car.maxSpeed * 1.65;
      } else if (car.isRaging) {
        targetSpeed = car.maxSpeed * 1.25;
      }

      if (distToObstacle <= 2) {
        car.speed = 0;
        car.isStopped = true;
        car.boostTimer = 0;
      } else if (distToObstacle < brakingDist) {
        const ratio = Math.max(0, distToObstacle / brakingDist);
        const desired = Math.min(targetSpeed, targetSpeed * ratio);
        car.speed = Math.max(0, car.speed - brakeRate * simDt);
        if (car.speed > desired) {
          car.speed = desired;
        }
        car.isStopped = car.speed < 25;
      } else {
        const accel =
          car.boostTimer > 0
            ? 900
            : car.type === 'sport' ||
                car.type === 'ambulance' ||
                car.type === 'vip'
              ? 460
              : 320;
        car.speed = Math.min(targetSpeed, car.speed + accel * simDt);
        car.isStopped = false;
      }

      // Advance position
      const stepDist = Math.min(car.speed * simDt, Math.max(0, distToObstacle));
      car.x += vec.dx * stepDist;
      car.y += vec.dy * stepDist;

      // Check patience drain when stopped before intersection
      const newProg = getAxisProgress(car);
      if (car.isStopped && newProg < ROAD_MAX) {
        const drainFactor = isFever ? 0.8 : 1.0;
        car.patience = Math.max(
          0,
          car.patience - (simDt * drainFactor) / car.maxPatienceSec,
        );
        car.honkCooldown = Math.max(0, car.honkCooldown - simDt);

        if (car.patience < 0.32 && car.patience > 0 && car.honkCooldown <= 0) {
          car.honkCooldown = 1.6;
          addFloatingText(
            floatingTexts,
            nextIdRef,
            car.x,
            car.y - 28,
            'BİP!',
            '#FBBF24',
            0.7,
          );
        }

        // Patience exhausted -> driver snaps and runs the red light!
        if (car.patience <= 0 && !car.isRaging) {
          car.isRaging = true;
          car.isStopped = false;
          combo = 1;
          events.push('rage');
          addFloatingText(
            floatingTexts,
            nextIdRef,
            car.x,
            car.y - 30,
            'YETER! 💢',
            '#EF4444',
            1.1,
          );
        }
      } else if (!car.isStopped && !car.isRaging) {
        car.patience = Math.min(1, car.patience + simDt * 0.2);
      }

      // Check if car just cleared the intersection!
      if (!car.passedIntersection && newProg - car.length / 2 > ROAD_MAX + 12) {
        car.passedIntersection = true;
        carsCleared += 1;

        const basePts = VEHICLE_SPECS[car.type].score;
        const feverMult = combo >= FEVER_COMBO_THRESHOLD ? 2 : 1;
        const earned = Math.round(
          basePts * (1 + (combo - 1) * 0.25) * feverMult,
        );
        score += earned;
        combo = Math.min(8, combo + 1);
        maxCombo = Math.max(maxCombo, combo);
        slowMoEnergy = Math.min(
          100,
          slowMoEnergy + (car.type === 'vip' ? 22 : 6),
        );
        events.push('score');

        const textColor =
          car.type === 'vip'
            ? '#FDE047'
            : car.type === 'ambulance'
              ? '#38BDF8'
              : combo >= FEVER_COMBO_THRESHOLD
                ? '#FACC15'
                : '#4ADE80';

        addFloatingText(
          floatingTexts,
          nextIdRef,
          car.x,
          car.y,
          feverMult > 1 ? `+${earned} 🔥` : `+${earned}`,
          textColor,
          0.85,
        );

        // Ambulance bonus: calms waiting cars!
        if (car.type === 'ambulance' && !car.isRaging) {
          for (const other of vehicles) {
            if (!other.isRaging) {
              other.patience = Math.min(1, other.patience + 0.35);
            }
          }
          addFloatingText(
            floatingTexts,
            nextIdRef,
            car.x,
            car.y - 36,
            'SAĞLIK BONUSU!',
            '#38BDF8',
            1.1,
          );
        }

        // VIP bonus: extra Slow-Mo charge!
        if (car.type === 'vip' && !car.isRaging) {
          addFloatingText(
            floatingTexts,
            nextIdRef,
            car.x,
            car.y - 36,
            '👑 VIP +ENERJİ!',
            '#FDE047',
            1.15,
          );
        }

        checkMissionAdvance('clear_cars', 1);
        checkMissionAdvance('combo_reach', 0, combo);
      }
    }
  }

  // 3. Collision & Near-Miss detection between perpendicular vehicles
  for (let i = 0; i < vehicles.length; i++) {
    const a = vehicles[i];
    if (!isInsideIntersection(a)) {
      continue;
    }
    const aVertical = a.dir === 'N' || a.dir === 'S';
    const boxA = getVehicleBox(a, 5);
    const nearBoxA = getVehicleBox(a, -18);

    for (let j = i + 1; j < vehicles.length; j++) {
      const b = vehicles[j];
      const bVertical = b.dir === 'N' || b.dir === 'S';
      if (aVertical === bVertical) {
        continue;
      }
      if (!isInsideIntersection(b)) {
        continue;
      }

      const boxB = getVehicleBox(b, 5);
      if (boxesOverlap(boxA, boxB)) {
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2;
        const bestScore = Math.max(state.bestScore, score);
        return {
          ...state,
          phase: 'gameover',
          score,
          bestScore,
          combo,
          maxCombo,
          carsCleared,
          nearMisses,
          missionsCompleted,
          mission,
          slowMoEnergy,
          slowMoActiveSec: 0,
          weather,
          isFever: combo >= FEVER_COMBO_THRESHOLD,
          level: getLevelConfig(score).level,
          elapsedSec: newElapsedSec,
          vehicles,
          floatingTexts,
          collision: {
            x: cx,
            y: cy,
            reason: 'crash',
            message:
              a.isRaging || b.isRaging
                ? 'Sabırsız sürücü kırmızı ışıkta geçti ve çarpışma oldu!'
                : 'Kavşakta iki araç çarpıştı!',
          },
          shake: 1,
          events: ['crash'],
          nextId: nextIdRef.current,
        };
      }

      // Near miss bonus check!
      if (!a.nearMissIds.includes(b.id)) {
        const nearBoxB = getVehicleBox(b, -18);
        if (boxesOverlap(nearBoxA, nearBoxB)) {
          a.nearMissIds.push(b.id);
          b.nearMissIds.push(a.id);
          nearMisses += 1;
          score += 30;
          slowMoEnergy = Math.min(100, slowMoEnergy + 14);
          events.push('nearmiss');
          addFloatingText(
            floatingTexts,
            nextIdRef,
            (a.x + b.x) / 2,
            (a.y + b.y) / 2 - 20,
            'KIL PAYI! +30',
            '#FACC15',
            1.05,
          );
          checkMissionAdvance('near_miss', 1);
        }
      }
    }
  }

  // 4. Remove vehicles that exited the visible board
  vehicles = vehicles.filter(
    v =>
      v.x > viewBounds.minX - 160 &&
      v.x < viewBounds.maxX + 160 &&
      v.y > viewBounds.minY - 160 &&
      v.y < viewBounds.maxY + 160,
  );

  const bestScore = Math.max(state.bestScore, score);
  const newLevel = getLevelConfig(score).level;

  return {
    ...state,
    score,
    bestScore,
    combo,
    maxCombo,
    carsCleared,
    nearMisses,
    missionsCompleted,
    mission,
    slowMoEnergy,
    slowMoActiveSec,
    weather,
    isFever: combo >= FEVER_COMBO_THRESHOLD,
    level: newLevel,
    elapsedSec: newElapsedSec,
    vehicles,
    floatingTexts,
    spawnTimer,
    nextId: nextIdRef.current,
    shake,
    events,
  };
}
