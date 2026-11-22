import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../game/types';
import { shareScore } from '../utils/shareScore';

interface Props {
  state: GameState;
  onStart: () => void;
  onResume: () => void;
}

export const OverlayModal: React.FC<Props> = React.memo(
  ({ state, onStart, onResume }) => {
    if (state.phase === 'playing') {
      return null;
    }

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {state.phase === 'menu' && (
          <>
            <Text style={styles.kicker}>TRAFİK KONTROL OYUNU</Text>
            <Text style={styles.title}>KAVŞAK KAOSU</Text>
            <Text style={styles.subtitle}>
              4 yöndeki trafik ışıklarına dokunarak Yeşil/Kırmızı yap. Kazaları
              önle, sabırsız sürücülere dikkat et!
            </Text>

            <View style={styles.legend}>
              <View style={styles.legendRow}>
                <Text style={styles.legendIcon}>🚦</Text>
                <Text style={styles.legendText}>
                  Işıklara dokun veya alttaki hızlı tuşlarla trafiği yönet
                </Text>
              </View>
              <View style={styles.legendRow}>
                <Text style={styles.legendIcon}>💨</Text>
                <Text style={styles.legendText}>
                  YENİ! Giden araca dokun = Nitro Turbo ile son anda kurtar!
                </Text>
              </View>
              <View style={styles.legendRow}>
                <Text style={styles.legendIcon}>⏱️</Text>
                <Text style={styles.legendText}>
                  YENİ! Enerji dolunca Zamanı Yavaşlat (Slow-Mo) & Görevleri tamamla
                </Text>
              </View>
              <View style={styles.legendRow}>
                <Text style={styles.legendIcon}>👑</Text>
                <Text style={styles.legendText}>
                  VIP (+100) & Ambulansa öncelik ver; gece ve yağmura dikkat!
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onStart}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}>
              <Text style={styles.primaryBtnText}>OYUNA BAŞLA</Text>
            </Pressable>

            {state.bestScore > 0 && (
              <Pressable
                onPress={() => shareScore(state, 'native', 'best')}
                style={({ pressed }) => [
                  styles.menuShareBtn,
                  pressed && styles.btnPressed,
                ]}>
                <Text style={styles.menuShareText}>
                  🏆 Rekorunu Paylaş ({state.bestScore} Puan)
                </Text>
              </Pressable>
            )}
          </>
        )}

        {state.phase === 'paused' && (
          <>
            <Text style={styles.kicker}>DURAKLATILDI</Text>
            <Text style={styles.title}>MOLA</Text>
            <View style={styles.btnStack}>
              <Pressable
                onPress={onResume}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.btnPressed,
                ]}>
                <Text style={styles.primaryBtnText}>DEVAM ET</Text>
              </Pressable>
              <Pressable
                onPress={onStart}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.btnPressed,
                ]}>
                <Text style={styles.secondaryBtnText}>BAŞTAN BAŞLA</Text>
              </Pressable>
            </View>
          </>
        )}

        {state.phase === 'gameover' && (
          <>
            <Text style={styles.kickerDanger}>
              {state.collision?.reason === 'gridlock'
                ? 'TRAFİK KİLİTLENDİ'
                : 'ÇARPIŞMA!'}
            </Text>
            <Text style={styles.title}>OYUN BİTTİ</Text>
            {state.score > 0 && state.score >= state.bestScore && (
              <View style={styles.newRecordBadge}>
                <Text style={styles.newRecordText}>🏆 YENİ REKOR!</Text>
              </View>
            )}
            <Text style={styles.subtitle}>{state.collision?.message}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SKOR</Text>
                <Text style={styles.statVal}>{state.score}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>REKOR</Text>
                <Text style={[styles.statVal, { color: '#FACC15' }]}>
                  {state.bestScore}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>GEÇEN ARAÇ</Text>
                <Text style={styles.statVal}>{state.carsCleared}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>KIL PAYI</Text>
                <Text style={[styles.statVal, { color: '#38BDF8' }]}>
                  {state.nearMisses}
                </Text>
              </View>
            </View>

            {/* Social Media Share Section */}
            <View style={styles.shareSection}>
              <Text style={styles.shareHeading}>SKORUNU PAYLAŞ</Text>
              <View style={styles.shareRow}>
                <Pressable
                  onPress={() => shareScore(state, 'whatsapp', 'gameover')}
                  style={({ pressed }) => [
                    styles.shareBtn,
                    styles.shareBtnWhatsapp,
                    pressed && styles.btnPressed,
                  ]}>
                  <Text style={styles.shareBtnIcon}>💬</Text>
                  <Text style={[styles.shareBtnLabel, { color: '#86EFAC' }]}>
                    WhatsApp
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => shareScore(state, 'x', 'gameover')}
                  style={({ pressed }) => [
                    styles.shareBtn,
                    styles.shareBtnX,
                    pressed && styles.btnPressed,
                  ]}>
                  <Text style={styles.shareBtnIcon}>𝕏</Text>
                  <Text style={[styles.shareBtnLabel, { color: '#F8FAFC' }]}>
                    Paylaş
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => shareScore(state, 'native', 'gameover')}
                  style={({ pressed }) => [
                    styles.shareBtn,
                    styles.shareBtnMore,
                    pressed && styles.btnPressed,
                  ]}>
                  <Text style={styles.shareBtnIcon}>📤</Text>
                  <Text style={[styles.shareBtnLabel, { color: '#7DD3FC' }]}>
                    Diğer
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={onStart}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}>
              <Text style={styles.primaryBtnText}>TEKRAR OYNA</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
  },
  (prev, next) =>
    prev.state.phase === 'playing' && next.state.phase === 'playing',
);

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 50,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  kicker: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  kickerDanger: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  legend: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendIcon: {
    fontSize: 17,
    width: 24,
    textAlign: 'center',
  },
  legendText: {
    color: '#E2E8F0',
    fontSize: 12.5,
    flex: 1,
    lineHeight: 17,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statVal: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
  },
  btnStack: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#052E16',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#1E293B',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  secondaryBtnText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '800',
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  newRecordBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.18)',
    borderWidth: 1,
    borderColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  newRecordText: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  menuShareBtn: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
  },
  menuShareText: {
    color: '#7DD3FC',
    fontSize: 13,
    fontWeight: '800',
  },
  shareSection: {
    width: '100%',
    marginBottom: 16,
  },
  shareHeading: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 8,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  shareBtnWhatsapp: {
    backgroundColor: 'rgba(37, 211, 102, 0.14)',
    borderColor: '#25D366',
  },
  shareBtnX: {
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
    borderColor: '#64748B',
  },
  shareBtnMore: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderColor: '#38BDF8',
  },
  shareBtnIcon: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
  },
  shareBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
});
