import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CENTER,
  ROAD_MAX,
  ROAD_MIN,
  ROAD_WIDTH,
  STOP_LINE,
} from '../game/constants';
import { Direction, GameState } from '../game/types';
import { StaticBoardLayer } from './StaticBoardLayer';
import { TrafficLightButton } from './TrafficLightButton';
import { VehicleView } from './VehicleView';

interface Props {
  state: GameState;
  boardWidth: number;
  boardHeight: number;
  scale: number;
  originX: number;
  originY: number;
  onToggleLight: (dir: Direction) => void;
  onBoostVehicle: (id: number) => void;
}

const RAIN_DROPS = [
  { x: 0.08, y: 0.12, len: 24, speed: 1.15 },
  { x: 0.21, y: 0.44, len: 20, speed: 0.95 },
  { x: 0.34, y: 0.78, len: 26, speed: 1.25 },
  { x: 0.47, y: 0.25, len: 22, speed: 1.05 },
  { x: 0.59, y: 0.61, len: 28, speed: 1.3 },
  { x: 0.72, y: 0.15, len: 22, speed: 1.0 },
  { x: 0.85, y: 0.48, len: 25, speed: 1.2 },
  { x: 0.16, y: 0.71, len: 20, speed: 1.05 },
  { x: 0.52, y: 0.88, len: 24, speed: 1.18 },
  { x: 0.91, y: 0.76, len: 26, speed: 1.22 },
];

export const IntersectionBoard: React.FC<Props> = ({
  state,
  boardWidth,
  boardHeight,
  scale,
  originX,
  originY,
  onToggleLight,
  onBoostVehicle,
}) => {
  const roadLeft = originX + ROAD_MIN * scale;
  const roadRight = originX + ROAD_MAX * scale;
  const roadTop = originY + ROAD_MIN * scale;
  const roadBottom = originY + ROAD_MAX * scale;
  const roadWidthPx = ROAD_WIDTH * scale;
  const centerX = originX + CENTER * scale;
  const centerY = originY + CENTER * scale;

  const stopNorthPx = originY + STOP_LINE.N * scale;
  const stopSouthPx = originY + STOP_LINE.S * scale;
  const stopWestPx = originX + STOP_LINE.W * scale;
  const stopEastPx = originX + STOP_LINE.E * scale;

  // Memoize TrafficLightButton corner styles so React.memo works properly!
  const lightStyles = useMemo(() => {
    const lightW = 58;
    const lightH = 74;
    const cornerGap = Math.max(12, 26 * scale);
    const leftX = Math.max(8, roadLeft - lightW - cornerGap);
    const rightX = Math.min(boardWidth - lightW - 8, roadRight + cornerGap);
    const topY = Math.max(8, roadTop - lightH - cornerGap);
    const bottomY = Math.min(boardHeight - lightH - 8, roadBottom + cornerGap);
    return {
      N: { left: leftX, top: topY },
      E: { left: rightX, top: topY },
      W: { left: leftX, top: bottomY },
      S: { left: rightX, top: bottomY },
    };
  }, [boardHeight, boardWidth, roadBottom, roadLeft, roadRight, roadTop, scale]);

  // Count waiting vehicles and urgent status per direction
  const laneStats = useMemo(() => {
    const stats: Record<Direction, { queue: number; urgent: boolean }> = {
      N: { queue: 0, urgent: false },
      S: { queue: 0, urgent: false },
      E: { queue: 0, urgent: false },
      W: { queue: 0, urgent: false },
    };
    for (const v of state.vehicles) {
      if (!v.passedIntersection) {
        if (v.isStopped) {
          stats[v.dir].queue += 1;
        }
        if (v.patience < 0.3 || v.type === 'ambulance' || v.isRaging) {
          stats[v.dir].urgent = true;
        }
      }
    }
    return stats;
  }, [state.vehicles]);

  const shakeX =
    state.shake > 0
      ? Math.sin(state.elapsedSec * 90) * state.shake * 8
      : 0;
  const shakeY =
    state.shake > 0
      ? Math.cos(state.elapsedSec * 80) * state.shake * 8
      : 0;

  return (
    <View
      style={[
        styles.board,
        {
          width: boardWidth,
          height: boardHeight,
          transform:
            state.shake > 0
              ? [{ translateX: shakeX }, { translateY: shakeY }]
              : undefined,
        },
      ]}>
      {/* Hardware-Cached Static City + Roads + Crosswalks + Dashes */}
      <StaticBoardLayer
        boardWidth={boardWidth}
        boardHeight={boardHeight}
        scale={scale}
        originX={originX}
        originY={originY}
      />

      {/* Dynamic Colored Stop Lines (only 4 tiny Views!) */}
      <View
        pointerEvents="none"
        style={[
          styles.stopLineH,
          {
            left: roadLeft + 5,
            top: stopNorthPx - 2.5,
            width: roadWidthPx / 2 - 8,
            backgroundColor:
              state.lights.N === 'green' ? '#22C55E' : '#EF4444',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.stopLineH,
          {
            left: centerX + 3,
            top: stopSouthPx - 2.5,
            width: roadWidthPx / 2 - 8,
            backgroundColor:
              state.lights.S === 'green' ? '#22C55E' : '#EF4444',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.stopLineV,
          {
            left: stopWestPx - 2.5,
            top: centerY + 3,
            height: roadWidthPx / 2 - 8,
            backgroundColor:
              state.lights.W === 'green' ? '#22C55E' : '#EF4444',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.stopLineV,
          {
            left: stopEastPx - 2.5,
            top: roadTop + 5,
            height: roadWidthPx / 2 - 8,
            backgroundColor:
              state.lights.E === 'green' ? '#22C55E' : '#EF4444',
          },
        ]}
      />

      {/* Vehicles (GPU-composited translateX/Y, tappable for Nitro Turbo Boost!) */}
      {state.vehicles.map(v => (
        <VehicleView
          key={v.id}
          vehicle={v}
          scale={scale}
          originX={originX}
          originY={originY}
          elapsedSec={state.elapsedSec}
          weather={state.weather}
          onBoost={onBoostVehicle}
        />
      ))}

      {/* Dynamic Weather & Day/Night Atmospheric Overlay */}
      {state.weather !== 'day' && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.weatherTint,
            state.weather === 'sunset' && styles.sunsetTint,
            state.weather === 'night' && styles.nightTint,
            state.weather === 'rain' && styles.rainTint,
          ]}>
          {state.weather === 'rain' &&
            RAIN_DROPS.map((drop, idx) => {
              const progress =
                (drop.y + state.elapsedSec * drop.speed * 0.85) % 1;
              const ty = progress * boardHeight;
              const tx = ((drop.x - progress * 0.12 + 1) % 1) * boardWidth;
              return (
                <View
                  key={`rain-${idx}`}
                  style={[
                    styles.rainStreak,
                    {
                      height: drop.len,
                      transform: [
                        { translateX: tx },
                        { translateY: ty },
                        { rotate: '12deg' },
                      ],
                    },
                  ]}
                />
              );
            })}
        </View>
      )}

      {/* Slow-Mo Bullet-Time Neon Frame / Fever Golden Frame */}
      {state.slowMoActiveSec > 0 ? (
        <View pointerEvents="none" style={styles.slowMoFrame} />
      ) : state.isFever ? (
        <View pointerEvents="none" style={styles.feverFrame} />
      ) : null}

      {/* Collision Impact Marker */}
      {state.collision && (
        <View
          pointerEvents="none"
          style={[
            styles.impactRing,
            {
              transform: [
                { translateX: originX + state.collision.x * scale - 30 },
                { translateY: originY + state.collision.y * scale - 30 },
              ],
            },
          ]}>
          <Text style={styles.impactEmoji}>💥</Text>
        </View>
      )}

      {/* Floating Score / Honk / Near-Miss Texts */}
      {state.floatingTexts.map(ft => {
        const opacity = Math.max(0, 1 - ft.age / ft.duration);
        return (
          <View
            key={ft.id}
            pointerEvents="none"
            style={[
              styles.floatingWrap,
              {
                opacity,
                transform: [
                  { translateX: originX + ft.x * scale - 65 },
                  { translateY: originY + ft.y * scale - 14 },
                ],
              },
            ]}>
            <Text style={[styles.floatingText, { color: ft.color }]}>
              {ft.text}
            </Text>
          </View>
        );
      })}

      {/* 4 Interactive Traffic Light Buttons (stable style props -> zero unnecessary re-renders!) */}
      <TrafficLightButton
        dir="N"
        color={state.lights.N}
        queueCount={laneStats.N.queue}
        hasUrgent={laneStats.N.urgent}
        onPress={onToggleLight}
        style={lightStyles.N}
      />
      <TrafficLightButton
        dir="E"
        color={state.lights.E}
        queueCount={laneStats.E.queue}
        hasUrgent={laneStats.E.urgent}
        onPress={onToggleLight}
        style={lightStyles.E}
      />
      <TrafficLightButton
        dir="W"
        color={state.lights.W}
        queueCount={laneStats.W.queue}
        hasUrgent={laneStats.W.urgent}
        onPress={onToggleLight}
        style={lightStyles.W}
      />
      <TrafficLightButton
        dir="S"
        color={state.lights.S}
        queueCount={laneStats.S.queue}
        hasUrgent={laneStats.S.urgent}
        onPress={onToggleLight}
        style={lightStyles.S}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#1B4332',
    overflow: 'hidden',
    position: 'relative',
  },
  stopLineH: {
    position: 'absolute',
    height: 5,
    borderRadius: 2.5,
    opacity: 0.95,
  },
  stopLineV: {
    position: 'absolute',
    width: 5,
    borderRadius: 2.5,
    opacity: 0.95,
  },
  impactRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239,68,68,0.38)',
    borderWidth: 3,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
  impactEmoji: {
    fontSize: 30,
  },
  floatingWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 130,
    alignItems: 'center',
    zIndex: 40,
  },
  floatingText: {
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  weatherTint: {
    zIndex: 18,
  },
  sunsetTint: {
    backgroundColor: 'rgba(249, 115, 22, 0.13)',
  },
  nightTint: {
    backgroundColor: 'rgba(2, 6, 23, 0.42)',
  },
  rainTint: {
    backgroundColor: 'rgba(15, 23, 42, 0.24)',
  },
  rainStreak: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1.5,
    backgroundColor: 'rgba(186, 230, 253, 0.55)',
    borderRadius: 1,
  },
  slowMoFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 4,
    borderColor: 'rgba(56, 189, 248, 0.72)',
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    zIndex: 22,
  },
  feverFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 3,
    borderColor: 'rgba(250, 204, 21, 0.55)',
    zIndex: 22,
  },
});
