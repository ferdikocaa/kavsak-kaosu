import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLevelConfig, WEATHER_INFO } from '../game/constants';
import { GamePhase, WeatherMode } from '../game/types';

interface Props {
  score: number;
  bestScore: number;
  combo: number;
  isFever: boolean;
  weather: WeatherMode;
  missionLabel: string;
  missionProgress: number;
  missionTarget: number;
  missionReward: number;
  phase: GamePhase;
  onTogglePause: () => void;
}

export const HudBar: React.FC<Props> = React.memo(
  ({
    score,
    bestScore,
    combo,
    isFever,
    weather,
    missionLabel,
    missionProgress,
    missionTarget,
    missionReward,
    phase,
    onTogglePause,
  }) => {
    const levelCfg = getLevelConfig(score);
    const weatherInfo = WEATHER_INFO[weather];
    const missionPct = Math.min(
      100,
      Math.round((missionProgress / Math.max(1, missionTarget)) * 100),
    );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.label}>SKOR</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.centerBlock}>
          <View
            style={[
              styles.levelPill,
              levelCfg.level >= 4 && styles.levelPillRush,
            ]}>
            <Text style={styles.levelText}>
              {weatherInfo.icon} LVL {levelCfg.level} • {levelCfg.label}
            </Text>
          </View>
          {combo > 1 && (
            <View
              style={[styles.comboPill, isFever && styles.comboPillFever]}>
              <Text style={styles.comboText}>
                {isFever ? `🔥 x${combo} ATEŞ (2X)` : `🔥 x${combo} SERİ`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rightBlock}>
          <View style={styles.bestBlock}>
            <Text style={styles.label}>REKOR</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
          {(phase === 'playing' || phase === 'paused') && (
            <Pressable
              onPress={onTogglePause}
              style={({ pressed }) => [
                styles.pauseBtn,
                pressed && { opacity: 0.7 },
              ]}>
              <Text style={styles.pauseIcon}>
                {phase === 'paused' ? '▶' : '⏸'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Live Mini-Mission Pill */}
      {phase === 'playing' && (
        <View style={styles.missionPill}>
          <Text style={styles.missionText}>
            🎯 {missionLabel} ({missionProgress}/{missionTarget})
          </Text>
          <View style={styles.missionTrack}>
            <View
              style={[styles.missionFill, { width: `${missionPct}%` }]}
            />
          </View>
          <Text style={styles.missionReward}>+{missionReward}</Text>
        </View>
      )}
    </View>
  );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 6,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.84)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
  },
  scoreBlock: {
    minWidth: 68,
  },
  label: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  centerBlock: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingHorizontal: 4,
  },
  levelPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
  },
  levelPillRush: {
    backgroundColor: '#450A0A',
    borderColor: '#EF4444',
  },
  levelText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  comboPill: {
    backgroundColor: 'rgba(250,204,21,0.16)',
    borderWidth: 1,
    borderColor: '#FACC15',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 999,
  },
  comboPillFever: {
    backgroundColor: 'rgba(234, 88, 12, 0.28)',
    borderColor: '#FB923C',
  },
  comboText: {
    color: '#FDE047',
    fontSize: 10.5,
    fontWeight: '900',
  },
  rightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestBlock: {
    alignItems: 'flex-end',
  },
  bestValue: {
    color: '#FACC15',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pauseBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  missionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  missionText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  missionTrack: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 65, 85, 0.9)',
    overflow: 'hidden',
  },
  missionFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  missionReward: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '900',
  },
});
