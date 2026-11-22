import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BottomControls } from './src/components/BottomControls';
import { HudBar } from './src/components/HudBar';
import { IntersectionBoard } from './src/components/IntersectionBoard';
import { OverlayModal } from './src/components/OverlayModal';
import { BOARD_UNITS } from './src/game/constants';
import {
  activateSlowMo,
  boostVehicle,
  createInitialState,
  setAxisLights,
  startNewGame,
  stepGame,
  toggleLight,
} from './src/game/engine';
import { Direction, GameState, ViewBounds } from './src/game/types';

function safeVibrate(pattern: number | number[]) {
  try {
    Vibration.vibrate(pattern);
  } catch {
    // Ignore vibration errors on unsupported devices
  }
}

function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const boardWidth = Math.max(300, width);
  const boardHeight = Math.max(300, height);
  const scale = Math.min(boardWidth, boardHeight) / BOARD_UNITS;
  const originX = (boardWidth - BOARD_UNITS * scale) / 2;
  const originY = (boardHeight - BOARD_UNITS * scale) / 2;

  const viewBounds = useMemo<ViewBounds>(
    () => ({
      minX: -originX / scale,
      maxX: (boardWidth - originX) / scale,
      minY: -originY / scale,
      maxY: (boardHeight - originY) / scale,
    }),
    [boardWidth, boardHeight, originX, originY, scale],
  );
  const viewBoundsRef = useRef<ViewBounds>(viewBounds);
  viewBoundsRef.current = viewBounds;

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(0),
  );
  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  // Smooth 60fps requestAnimationFrame loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const current = stateRef.current;
      if (current.phase === 'playing' || current.shake > 0) {
        const next = stepGame(current, dt, viewBoundsRef.current);

        if (next.events.length > 0) {
          if (next.events.includes('crash')) {
            safeVibrate(240);
          } else if (next.events.includes('mission')) {
            safeVibrate([0, 30, 35, 50]);
          } else if (next.events.includes('rage')) {
            safeVibrate([0, 40, 40, 40]);
          } else if (next.events.includes('nearmiss')) {
            safeVibrate(30);
          } else if (
            next.events.includes('ambulance') ||
            next.events.includes('vip')
          ) {
            safeVibrate([0, 25, 45, 25]);
          }
        }

        stateRef.current = next;
        setGameState(next);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleStart = useCallback(() => {
    const next = startNewGame(stateRef.current.bestScore);
    stateRef.current = next;
    setGameState(next);
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState(prev => {
      if (prev.phase === 'playing') {
        return { ...prev, phase: 'paused' };
      }
      if (prev.phase === 'paused') {
        return { ...prev, phase: 'playing' };
      }
      return prev;
    });
  }, []);

  const handleToggleLight = useCallback((dir: Direction) => {
    safeVibrate(12);
    setGameState(prev => {
      const next = toggleLight(prev, dir);
      stateRef.current = next;
      return next;
    });
  }, []);

  const handleBoostVehicle = useCallback((vehicleId: number) => {
    setGameState(prev => {
      const next = boostVehicle(prev, vehicleId);
      if (next !== prev) {
        safeVibrate(18);
        stateRef.current = next;
      }
      return next;
    });
  }, []);

  const handleActivateSlowMo = useCallback(() => {
    setGameState(prev => {
      const next = activateSlowMo(prev);
      if (next !== prev) {
        safeVibrate([0, 20, 30, 35]);
        stateRef.current = next;
      }
      return next;
    });
  }, []);

  const handleQuickAxis = useCallback((mode: 'NS' | 'EW' | 'ALL_RED') => {
    safeVibrate(15);
    setGameState(prev => {
      const next = setAxisLights(prev, mode);
      stateRef.current = next;
      return next;
    });
  }, []);

  const isNSActive =
    gameState.lights.N === 'green' &&
    gameState.lights.S === 'green' &&
    gameState.lights.E === 'red' &&
    gameState.lights.W === 'red';

  const isEWActive =
    gameState.lights.E === 'green' &&
    gameState.lights.W === 'green' &&
    gameState.lights.N === 'red' &&
    gameState.lights.S === 'red';

  const isAllRed =
    gameState.lights.N === 'red' &&
    gameState.lights.S === 'red' &&
    gameState.lights.E === 'red' &&
    gameState.lights.W === 'red';

  const slowMoPct = Math.round(gameState.slowMoEnergy);
  const slowMoSecTenth =
    gameState.slowMoActiveSec > 0
      ? Math.ceil(gameState.slowMoActiveSec * 10) / 10
      : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-Screen Interactive City & Intersection Board */}
      <IntersectionBoard
        state={gameState}
        boardWidth={boardWidth}
        boardHeight={boardHeight}
        scale={scale}
        originX={originX}
        originY={originY}
        onToggleLight={handleToggleLight}
        onBoostVehicle={handleBoostVehicle}
      />

      {/* Floating Top HUD (Memoized with primitive props) */}
      <View
        pointerEvents="box-none"
        style={[styles.topOverlay, { paddingTop: Math.max(insets.top, 8) }]}>
        <HudBar
          score={gameState.score}
          bestScore={gameState.bestScore}
          combo={gameState.combo}
          isFever={gameState.isFever}
          weather={gameState.weather}
          missionLabel={gameState.mission.label}
          missionProgress={gameState.mission.progress}
          missionTarget={gameState.mission.target}
          missionReward={gameState.mission.reward}
          phase={gameState.phase}
          onTogglePause={handleTogglePause}
        />
      </View>

      {/* Floating Bottom Controls (Memoized so it only updates on state changes) */}
      <BottomControls
        isPlaying={gameState.phase === 'playing'}
        isNSActive={isNSActive}
        isEWActive={isEWActive}
        isAllRed={isAllRed}
        slowMoPct={slowMoPct}
        slowMoSecTenth={slowMoSecTenth}
        bottomInset={insets.bottom}
        onActivateSlowMo={handleActivateSlowMo}
        onQuickAxis={handleQuickAxis}
      />

      <OverlayModal
        state={gameState}
        onStart={handleStart}
        onResume={handleTogglePause}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B4332',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 35,
  },
});
