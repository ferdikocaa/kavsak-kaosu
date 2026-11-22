import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Vehicle, WeatherMode } from '../game/types';

interface Props {
  vehicle: Vehicle;
  scale: number;
  originX: number;
  originY: number;
  elapsedSec: number;
  weather: WeatherMode;
  onBoost: (id: number) => void;
}

const ROTATION_BY_DIR = {
  N: '180deg', // Facing down (+y)
  S: '0deg', // Facing up (-y)
  E: '270deg', // Facing left (-x)
  W: '90deg', // Facing right (+x)
} as const;

export const VehicleView: React.FC<Props> = React.memo(
  ({ vehicle, scale, originX, originY, elapsedSec, weather, onBoost }) => {
    // Render car in canonical "facing UP (S)" orientation, then rotate by dir
    const w = vehicle.width * scale;
    const h = vehicle.length * scale;

    // Subtle angry jitter when low patience or raging
    let jitterX = 0;
    let jitterY = 0;
    if (vehicle.isRaging || (vehicle.isStopped && vehicle.patience < 0.3)) {
      const freq = vehicle.isRaging ? 55 : 35;
      const amp = vehicle.isRaging ? 2.4 : 1.4;
      jitterX = Math.sin(elapsedSec * freq + vehicle.id) * amp;
      jitterY = Math.cos(elapsedSec * freq + vehicle.id) * amp;
    }

    const left = originX + vehicle.x * scale - w / 2 + jitterX;
    const top = originY + vehicle.y * scale - h / 2 + jitterY;

    const sirenPhase = Math.floor(elapsedSec * 9) % 2 === 0;
    const isBoosting = vehicle.boostTimer > 0;
    const showHeadlightBeams = weather === 'night' || weather === 'rain';
    const showPatience =
      !vehicle.passedIntersection &&
      (vehicle.patience < 0.92 || vehicle.isRaging);

    const patienceColor =
      vehicle.patience > 0.55
        ? '#22C55E'
        : vehicle.patience > 0.28
          ? '#F59E0B'
          : '#EF4444';

    const borderColor = isBoosting
      ? '#38BDF8'
      : vehicle.isRaging
        ? '#EF4444'
        : vehicle.type === 'vip'
          ? '#FEF08A'
          : 'rgba(15,23,42,0.55)';

    return (
      <Pressable
        onPress={() => onBoost(vehicle.id)}
        hitSlop={10}
        style={[
          styles.wrapper,
          {
            width: w,
            height: h,
            transform: [{ translateX: left }, { translateY: top }],
          },
        ]}>
        <View
          style={[
            styles.body,
            {
              width: w,
              height: h,
              backgroundColor: vehicle.color,
              borderRadius: Math.max(4, w * 0.24),
              transform: [{ rotate: ROTATION_BY_DIR[vehicle.dir] }],
              borderColor,
              borderWidth: isBoosting || vehicle.isRaging || vehicle.type === 'vip' ? 2 : 1,
            },
          ]}>
          {/* Night / Rain Headlight Beams */}
          {showHeadlightBeams && (
            <View
              pointerEvents="none"
              style={[
                styles.headlightBeamsRow,
                {
                  top: -h * 0.55,
                  width: w * 1.12,
                  height: h * 0.58,
                },
              ]}>
              <View style={styles.beamCone} />
              <View style={styles.beamCone} />
            </View>
          )}

          {/* Nitro Turbo Exhaust Flame (behind rear bumper) */}
          {isBoosting && (
            <View
              pointerEvents="none"
              style={[
                styles.nitroRow,
                {
                  bottom: -h * 0.34,
                  width: w * 0.56,
                  height: h * 0.36,
                },
              ]}>
              <View
                style={[
                  styles.nitroFlame,
                  { opacity: sirenPhase ? 0.95 : 0.7 },
                ]}
              />
              <View
                style={[
                  styles.nitroFlame,
                  { opacity: sirenPhase ? 0.7 : 0.95 },
                ]}
              />
            </View>
          )}

          {/* Headlights (front = top in canonical orientation) */}
          <View style={styles.headlightsRow}>
            <View style={[styles.headlight, { width: w * 0.2, height: h * 0.06 }]} />
            <View style={[styles.headlight, { width: w * 0.2, height: h * 0.06 }]} />
          </View>

          {/* Sport racing stripe */}
          {vehicle.type === 'sport' && (
            <View
              style={[
                styles.racingStripe,
                { width: w * 0.16, backgroundColor: vehicle.accentColor },
              ]}
            />
          )}

          {/* Truck cargo vs cab separation */}
          {vehicle.type === 'truck' ? (
            <>
              <View
                style={[
                  styles.windshield,
                  {
                    top: h * 0.12,
                    width: w * 0.74,
                    height: h * 0.13,
                    borderRadius: 3,
                  },
                ]}
              />
              <View
                style={[
                  styles.truckCargo,
                  {
                    top: h * 0.31,
                    width: w * 0.86,
                    height: h * 0.62,
                    backgroundColor: vehicle.accentColor,
                  },
                ]}
              />
            </>
          ) : (
            <>
              {/* Front Windshield */}
              <View
                style={[
                  styles.windshield,
                  {
                    top: h * 0.18,
                    width: w * 0.74,
                    height: h * 0.18,
                    borderRadius: 3,
                  },
                ]}
              />
              {/* Roof */}
              <View
                style={[
                  styles.roof,
                  {
                    top: h * 0.38,
                    width: w * 0.68,
                    height: vehicle.type === 'vip' ? h * 0.34 : h * 0.28,
                    backgroundColor:
                      vehicle.type === 'ambulance'
                        ? '#FFFFFF'
                        : vehicle.type === 'vip'
                          ? '#1E293B'
                          : vehicle.accentColor,
                  },
                ]}>
                {vehicle.type === 'ambulance' && (
                  <View style={styles.crossWrap}>
                    <View style={styles.crossV} />
                    <View style={styles.crossH} />
                  </View>
                )}
                {vehicle.type === 'vip' && (
                  <Text style={styles.vipCrown}>👑</Text>
                )}
              </View>
              {/* Rear window */}
              <View
                style={[
                  styles.windshield,
                  {
                    bottom: h * 0.13,
                    width: w * 0.66,
                    height: h * 0.12,
                    borderRadius: 2,
                  },
                ]}
              />
            </>
          )}

          {/* Ambulance flashing siren bar */}
          {vehicle.type === 'ambulance' && (
            <View style={[styles.sirenRow, { top: h * 0.26, width: w * 0.65 }]}>
              <View
                style={[
                  styles.sirenLight,
                  { backgroundColor: sirenPhase ? '#EF4444' : '#3B82F6' },
                ]}
              />
              <View
                style={[
                  styles.sirenLight,
                  { backgroundColor: sirenPhase ? '#3B82F6' : '#EF4444' },
                ]}
              />
            </View>
          )}

          {/* Taillights / Brake lights */}
          <View style={styles.taillightsRow}>
            <View
              style={[
                styles.taillight,
                {
                  width: w * 0.22,
                  height: h * 0.06,
                  backgroundColor: vehicle.isStopped ? '#FF2E2E' : '#991B1B',
                },
              ]}
            />
            <View
              style={[
                styles.taillight,
                {
                  width: w * 0.22,
                  height: h * 0.06,
                  backgroundColor: vehicle.isStopped ? '#FF2E2E' : '#991B1B',
                },
              ]}
            />
          </View>
        </View>

        {/* Patience bar (unrotated, floating right above vehicle) */}
        {showPatience && (
          <View
            pointerEvents="none"
            style={[
              styles.patienceTrack,
              {
                width: Math.max(26, w * 1.15),
                left: (w - Math.max(26, w * 1.15)) / 2,
              },
            ]}>
            <View
              style={[
                styles.patienceFill,
                {
                  width: `${Math.round(vehicle.patience * 100)}%`,
                  backgroundColor: patienceColor,
                },
              ]}
            />
          </View>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlightBeamsRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  beamCone: {
    width: '44%',
    height: '100%',
    backgroundColor: 'rgba(254, 240, 138, 0.22)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  nitroRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nitroFlame: {
    width: '38%',
    height: '100%',
    backgroundColor: '#38BDF8',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  headlightsRow: {
    position: 'absolute',
    top: 2,
    width: '78%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headlight: {
    backgroundColor: '#FEF08A',
    borderRadius: 2,
  },
  taillightsRow: {
    position: 'absolute',
    bottom: 2,
    width: '78%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taillight: {
    borderRadius: 2,
  },
  windshield: {
    position: 'absolute',
    backgroundColor: '#0F172A',
    opacity: 0.85,
  },
  roof: {
    position: 'absolute',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.92,
  },
  vipCrown: {
    fontSize: 10,
  },
  racingStripe: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    opacity: 0.65,
  },
  truckCargo: {
    position: 'absolute',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.25)',
  },
  crossWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossV: {
    position: 'absolute',
    width: 3,
    height: 9,
    backgroundColor: '#EF4444',
    borderRadius: 1,
  },
  crossH: {
    position: 'absolute',
    width: 9,
    height: 3,
    backgroundColor: '#EF4444',
    borderRadius: 1,
  },
  sirenRow: {
    position: 'absolute',
    height: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  sirenLight: {
    width: '44%',
    height: '100%',
    borderRadius: 2,
  },
  patienceTrack: {
    position: 'absolute',
    top: -9,
    height: 4,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  patienceFill: {
    height: '100%',
    borderRadius: 2,
  },
});
