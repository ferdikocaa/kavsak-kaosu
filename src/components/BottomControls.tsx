import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SLOW_MO_MIN_ENERGY } from '../game/constants';

interface Props {
  isPlaying: boolean;
  isNSActive: boolean;
  isEWActive: boolean;
  isAllRed: boolean;
  slowMoPct: number;
  /** Remaining active Slow-Mo rounded to 0.1s (0 when inactive) */
  slowMoSecTenth: number;
  bottomInset: number;
  onActivateSlowMo: () => void;
  onQuickAxis: (mode: 'NS' | 'EW' | 'ALL_RED') => void;
}

export const BottomControls: React.FC<Props> = React.memo(
  ({
    isPlaying,
    isNSActive,
    isEWActive,
    isAllRed,
    slowMoPct,
    slowMoSecTenth,
    bottomInset,
    onActivateSlowMo,
    onQuickAxis,
  }) => {
    const slowMoActive = slowMoSecTenth > 0;
    const slowMoReady = slowMoPct >= SLOW_MO_MIN_ENERGY && !slowMoActive;

    return (
      <View
        pointerEvents="box-none"
        style={[
          styles.bottomOverlay,
          { paddingBottom: Math.max(bottomInset, 10) },
        ]}>
        {/* Bullet-Time Slow-Mo Power Button */}
        {isPlaying && (
          <Pressable
            onPress={onActivateSlowMo}
            disabled={!slowMoReady}
            style={({ pressed }) => [
              styles.slowMoBtn,
              slowMoReady && styles.slowMoBtnReady,
              slowMoActive && styles.slowMoBtnActive,
              pressed && slowMoReady && styles.quickBtnPressed,
            ]}>
            <View
              style={[
                styles.slowMoFill,
                {
                  width: slowMoActive
                    ? `${Math.min(100, Math.round((slowMoSecTenth / 4.5) * 100))}%`
                    : `${slowMoPct}%`,
                },
              ]}
            />
            <Text style={styles.slowMoText}>
              {slowMoActive
                ? `⏱️ YAVAŞ ZAMAN • ${slowMoSecTenth.toFixed(1)}s`
                : slowMoReady
                  ? `⏱️ ZAMANI YAVAŞLAT (%${slowMoPct})`
                  : `⏱️ YAVAŞLATMA ŞARJI %${slowMoPct}`}
            </Text>
          </Pressable>
        )}

        <View style={styles.controlsBar}>
          <Pressable
            onPress={() => onQuickAxis('NS')}
            style={({ pressed }) => [
              styles.quickBtn,
              isNSActive && styles.quickBtnActiveGreen,
              pressed && styles.quickBtnPressed,
            ]}>
            <Text style={styles.quickBtnIcon}>↕</Text>
            <Text style={styles.quickBtnLabel}>KUZEY-GÜNEY</Text>
          </Pressable>

          <Pressable
            onPress={() => onQuickAxis('ALL_RED')}
            style={({ pressed }) => [
              styles.quickBtn,
              styles.stopBtn,
              isAllRed && styles.quickBtnActiveRed,
              pressed && styles.quickBtnPressed,
            ]}>
            <Text style={styles.quickBtnIcon}>⛔</Text>
            <Text style={styles.quickBtnLabel}>TÜMÜ DUR</Text>
          </Pressable>

          <Pressable
            onPress={() => onQuickAxis('EW')}
            style={({ pressed }) => [
              styles.quickBtn,
              isEWActive && styles.quickBtnActiveGreen,
              pressed && styles.quickBtnPressed,
            ]}>
            <Text style={styles.quickBtnIcon}>↔</Text>
            <Text style={styles.quickBtnLabel}>DOĞU-BATI</Text>
          </Pressable>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    zIndex: 35,
  },
  slowMoBtn: {
    width: '92%',
    maxWidth: 432,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1.5,
    borderColor: 'rgba(71, 85, 105, 0.7)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slowMoBtnReady: {
    borderColor: '#38BDF8',
  },
  slowMoBtnActive: {
    borderColor: '#7DD3FC',
    backgroundColor: 'rgba(14, 116, 144, 0.92)',
  },
  slowMoFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(56, 189, 248, 0.34)',
  },
  slowMoText: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  controlsBar: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(71, 85, 105, 0.85)',
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stopBtn: {
    borderColor: 'rgba(185, 28, 28, 0.85)',
    backgroundColor: 'rgba(30, 11, 16, 0.9)',
  },
  quickBtnActiveGreen: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(20, 83, 45, 0.9)',
  },
  quickBtnActiveRed: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(127, 29, 29, 0.9)',
  },
  quickBtnPressed: {
    transform: [{ scale: 0.96 }],
  },
  quickBtnIcon: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  quickBtnLabel: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
