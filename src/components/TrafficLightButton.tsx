import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Direction, LightColor } from '../game/types';

interface Props {
  dir: Direction;
  color: LightColor;
  queueCount: number;
  hasUrgent: boolean;
  onPress: (dir: Direction) => void;
  style?: object;
}

const ARROW_BY_DIR: Record<Direction, string> = {
  N: '↓',
  S: '↑',
  W: '→',
  E: '←',
};

export const TrafficLightButton: React.FC<Props> = React.memo(
  ({ dir, color, queueCount, hasUrgent, onPress, style }) => {
    const isGreen = color === 'green';
    const isDangerQueue = queueCount >= 4;

    return (
      <Pressable
        onPress={() => onPress(dir)}
        hitSlop={14}
        style={({ pressed }) => [
          styles.container,
          {
            borderColor: hasUrgent
              ? '#EF4444'
              : isGreen
                ? '#22C55E'
                : '#475569',
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
          style,
        ]}>
        {/* Red LED */}
        <View
          style={[
            styles.led,
            {
              backgroundColor: isGreen ? '#3F1D24' : '#EF4444',
              shadowColor: '#EF4444',
              shadowOpacity: isGreen ? 0 : 0.95,
              shadowRadius: isGreen ? 0 : 8,
            },
          ]}
        />
        {/* Green LED */}
        <View
          style={[
            styles.led,
            {
              backgroundColor: isGreen ? '#22C55E' : '#143322',
              shadowColor: '#22C55E',
              shadowOpacity: isGreen ? 0.95 : 0,
              shadowRadius: isGreen ? 8 : 0,
            },
          ]}
        />
        <Text
          style={[
            styles.arrow,
            { color: isGreen ? '#86EFAC' : '#94A3B8' },
          ]}>
          {ARROW_BY_DIR[dir]}
        </Text>

        {queueCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDangerQueue ? '#DC2626' : '#0F172A',
                borderColor: isDangerQueue ? '#FCA5A5' : '#475569',
              },
            ]}>
            <Text style={styles.badgeText}>{queueCount}</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 54,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 30,
  },
  led: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  arrow: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
});
