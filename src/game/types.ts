export type Direction = 'N' | 'S' | 'E' | 'W';

export type LightColor = 'red' | 'green';

export type LightsState = Record<Direction, LightColor>;

export type VehicleType = 'sedan' | 'sport' | 'truck' | 'ambulance' | 'vip';

export type WeatherMode = 'day' | 'sunset' | 'night' | 'rain';

export type MissionType =
  | 'clear_cars'
  | 'near_miss'
  | 'turbo_boost'
  | 'combo_reach';

export interface Mission {
  id: number;
  type: MissionType;
  label: string;
  target: number;
  progress: number;
  reward: number;
}

export interface Vehicle {
  id: number;
  dir: Direction;
  type: VehicleType;
  /** Position in normalized 0..1000 board coordinates (center of vehicle) */
  x: number;
  y: number;
  /** Current speed in normalized units per second */
  speed: number;
  maxSpeed: number;
  /** Length along travel axis, width perpendicular to travel axis */
  length: number;
  width: number;
  color: string;
  accentColor: string;
  /** Remaining patience 0..1 */
  patience: number;
  /** Max patience in seconds */
  maxPatienceSec: number;
  /** True when car is waiting at red light or behind a stopped car */
  isStopped: boolean;
  /** True when patience hit 0 and the driver runs the red light! */
  isRaging: boolean;
  /** True once the car has passed the intersection exit */
  passedIntersection: boolean;
  /** Cooldown for honk floating text */
  honkCooldown: number;
  /** Set of vehicle IDs this car already scored a near-miss with */
  nearMissIds: number[];
  /** Remaining nitro turbo boost time in seconds (activated by tapping the car) */
  boostTimer: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  age: number;
  duration: number;
}

export interface CollisionInfo {
  x: number;
  y: number;
  reason: 'crash' | 'gridlock';
  message: string;
}

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';

export interface ViewBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export type GameEvent =
  | 'score'
  | 'nearmiss'
  | 'rage'
  | 'crash'
  | 'ambulance'
  | 'vip'
  | 'turbo'
  | 'slowmo'
  | 'mission';

export interface GameState {
  phase: GamePhase;
  score: number;
  bestScore: number;
  combo: number;
  maxCombo: number;
  carsCleared: number;
  nearMisses: number;
  turboBoostsUsed: number;
  missionsCompleted: number;
  level: number;
  elapsedSec: number;
  weather: WeatherMode;
  isFever: boolean;
  /** 0..100 energy bar for Bullet-Time Slow-Mo */
  slowMoEnergy: number;
  /** Remaining seconds of active Slow-Mo */
  slowMoActiveSec: number;
  mission: Mission;
  lights: LightsState;
  vehicles: Vehicle[];
  floatingTexts: FloatingText[];
  collision: CollisionInfo | null;
  spawnTimer: number;
  nextId: number;
  /** Screen shake intensity 0..1 */
  shake: number;
  /** Event flags consumed by UI for haptics */
  events: GameEvent[];
}
