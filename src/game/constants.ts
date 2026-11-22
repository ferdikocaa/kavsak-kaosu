import { Direction, VehicleType, WeatherMode } from './types';

/** Normalized square coordinate space (0..1000) */
export const BOARD_UNITS = 1000;
export const CENTER = 500;

/** Road spans 376..624 (width 248) */
export const ROAD_WIDTH = 248;
export const ROAD_MIN = CENTER - ROAD_WIDTH / 2; // 376
export const ROAD_MAX = CENTER + ROAD_WIDTH / 2; // 624

/** Lane centers (right-hand traffic) */
export const LANE_OFFSET = 62;
export const LANE_POS: Record<Direction, number> = {
  N: CENTER - LANE_OFFSET, // 438 (x) — driving down (+y)
  S: CENTER + LANE_OFFSET, // 562 (x) — driving up (-y)
  W: CENTER + LANE_OFFSET, // 562 (y) — driving right (+x)
  E: CENTER - LANE_OFFSET, // 438 (y) — driving left (-x)
};

/** Stop line coordinate along the vehicle's travel axis (front bumper stops here) */
export const STOP_LINE: Record<Direction, number> = {
  N: ROAD_MIN - 28, // 348
  S: ROAD_MAX + 28, // 652
  W: ROAD_MIN - 28, // 348
  E: ROAD_MAX + 28, // 652
};

/** Spawn position outside the visible board */
export const SPAWN_POS: Record<Direction, number> = {
  N: -65,
  S: BOARD_UNITS + 65,
  W: -65,
  E: BOARD_UNITS + 65,
};

/** Direction unit vectors */
export const DIR_VECTOR: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: 1 },
  S: { dx: 0, dy: -1 },
  W: { dx: 1, dy: 0 },
  E: { dx: -1, dy: 0 },
};

export const DIRECTIONS: Direction[] = ['N', 'S', 'E', 'W'];

/** Minimum bumper-to-bumper gap when queued behind another car */
export const SAFE_FOLLOW_GAP = 28;

/** Maximum waiting cars in a single lane before gridlock warning / game over */
export const MAX_QUEUE_PER_LANE = 5;

/** Minimum Slow-Mo energy required to activate Bullet Time */
export const SLOW_MO_MIN_ENERGY = 35;
export const SLOW_MO_DURATION_SEC = 4.5;
export const SLOW_MO_TIME_SCALE = 0.38;

/** Combo threshold for 2x Fever Mode */
export const FEVER_COMBO_THRESHOLD = 6;

export interface VehicleSpec {
  length: number;
  width: number;
  maxSpeed: number;
  maxPatienceSec: number;
  score: number;
  colors: Array<{ body: string; accent: string }>;
}

export const VEHICLE_SPECS: Record<VehicleType, VehicleSpec> = {
  sedan: {
    length: 84,
    width: 48,
    maxSpeed: 215,
    maxPatienceSec: 11.5,
    score: 10,
    colors: [
      { body: '#3B82F6', accent: '#93C5FD' }, // Blue
      { body: '#10B981', accent: '#6EE7B7' }, // Emerald
      { body: '#F59E0B', accent: '#FDE68A' }, // Amber
      { body: '#A855F7', accent: '#D8B4FE' }, // Purple
      { body: '#EC4899', accent: '#F9A8D4' }, // Pink
      { body: '#E2E8F0', accent: '#FFFFFF' }, // Silver
    ],
  },
  sport: {
    length: 80,
    width: 46,
    maxSpeed: 310,
    maxPatienceSec: 7.5,
    score: 20,
    colors: [
      { body: '#EF4444', accent: '#FCA5A5' }, // Racing Red
      { body: '#F97316', accent: '#FDBA74' }, // Vivid Orange
      { body: '#06B6D4', accent: '#67E8F9' }, // Cyan
    ],
  },
  truck: {
    length: 132,
    width: 54,
    maxSpeed: 160,
    maxPatienceSec: 15.0,
    score: 25,
    colors: [
      { body: '#64748B', accent: '#CBD5E1' }, // Slate Cargo
      { body: '#0EA5E9', accent: '#BAE6FD' }, // Logistics Blue
      { body: '#D97706', accent: '#FDE68A' }, // City Bus Yellow
    ],
  },
  ambulance: {
    length: 94,
    width: 50,
    maxSpeed: 290,
    maxPatienceSec: 6.2,
    score: 50,
    colors: [{ body: '#F8FAFC', accent: '#EF4444' }],
  },
  vip: {
    length: 112,
    width: 48,
    maxSpeed: 265,
    maxPatienceSec: 7.2,
    score: 100,
    colors: [{ body: '#EAB308', accent: '#FEF08A' }],
  },
};

export interface LevelConfig {
  level: number;
  label: string;
  minScore: number;
  spawnIntervalMin: number;
  spawnIntervalMax: number;
  speedMultiplier: number;
  weights: Record<VehicleType, number>;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    label: 'SABAH TRAFİĞİ',
    minScore: 0,
    spawnIntervalMin: 1.55,
    spawnIntervalMax: 2.35,
    speedMultiplier: 1.0,
    weights: { sedan: 85, sport: 15, truck: 0, ambulance: 0, vip: 0 },
  },
  {
    level: 2,
    label: 'ÖĞLE HAREKETLİLİĞİ',
    minScore: 140,
    spawnIntervalMin: 1.25,
    spawnIntervalMax: 1.95,
    speedMultiplier: 1.08,
    weights: { sedan: 55, sport: 25, truck: 14, ambulance: 0, vip: 6 },
  },
  {
    level: 3,
    label: 'İŞ ÇIKIŞI',
    minScore: 380,
    spawnIntervalMin: 1.0,
    spawnIntervalMax: 1.65,
    speedMultiplier: 1.15,
    weights: { sedan: 40, sport: 26, truck: 18, ambulance: 8, vip: 8 },
  },
  {
    level: 4,
    label: 'YOĞUN SAAT!',
    minScore: 760,
    spawnIntervalMin: 0.82,
    spawnIntervalMax: 1.38,
    speedMultiplier: 1.22,
    weights: { sedan: 33, sport: 28, truck: 18, ambulance: 11, vip: 10 },
  },
  {
    level: 5,
    label: 'KAVŞAK KAOSU!',
    minScore: 1300,
    spawnIntervalMin: 0.68,
    spawnIntervalMax: 1.15,
    speedMultiplier: 1.3,
    weights: { sedan: 26, sport: 30, truck: 20, ambulance: 12, vip: 12 },
  },
];

export function getLevelConfig(score: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export const WEATHER_INFO: Record<
  WeatherMode,
  { icon: string; label: string }
> = {
  day: { icon: '☀️', label: 'GÜNDÜZ' },
  sunset: { icon: '🌅', label: 'GÜN BATIMI' },
  night: { icon: '🌙', label: 'GECE' },
  rain: { icon: '🌧️', label: 'YAĞMURLU' },
};

/** Dynamic atmosphere cycle every ~104 seconds */
export function getWeatherForElapsed(elapsedSec: number): WeatherMode {
  const cycle = elapsedSec % 104;
  if (cycle < 28) {
    return 'day';
  }
  if (cycle < 52) {
    return 'sunset';
  }
  if (cycle < 80) {
    return 'night';
  }
  return 'rain';
}
