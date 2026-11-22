import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CENTER,
  LANE_POS,
  ROAD_MAX,
  ROAD_MIN,
  ROAD_WIDTH,
  STOP_LINE,
} from '../game/constants';
import { CityEnvironment } from './CityEnvironment';

interface Props {
  boardWidth: number;
  boardHeight: number;
  scale: number;
  originX: number;
  originY: number;
}

const CROSSWALK_INDICES = [0, 1, 2, 3, 4];

/**
 * Renders the entire static city environment, roads, dashes, crosswalks, and lane arrows.
 * Memoized + cached as a single hardware texture on Android so it never re-renders or
 * re-rasterizes during the 60fps game loop.
 */
export const StaticBoardLayer: React.FC<Props> = React.memo(
  ({ boardWidth, boardHeight, scale, originX, originY }) => {
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

    const dashes = useMemo(() => {
      const north = Math.max(4, Math.floor((stopNorthPx - 14) / 26));
      const south = Math.max(
        4,
        Math.floor((boardHeight - stopSouthPx - 14) / 26),
      );
      const west = Math.max(4, Math.floor((stopWestPx - 14) / 26));
      const east = Math.max(
        4,
        Math.floor((boardWidth - stopEastPx - 14) / 26),
      );
      return {
        north: Array.from({ length: north }, (_, i) => i),
        south: Array.from({ length: south }, (_, i) => i),
        west: Array.from({ length: west }, (_, i) => i),
        east: Array.from({ length: east }, (_, i) => i),
      };
    }, [
      boardHeight,
      boardWidth,
      stopEastPx,
      stopNorthPx,
      stopSouthPx,
      stopWestPx,
    ]);

    return (
      <View
        pointerEvents="none"
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={StyleSheet.absoluteFill}>
        {/* Rich City Environment */}
        <CityEnvironment
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          scale={scale}
          originX={originX}
          originY={originY}
        />

        {/* Vertical Road */}
        <View
          style={[
            styles.road,
            {
              left: roadLeft,
              top: 0,
              width: roadWidthPx,
              height: boardHeight,
              borderLeftWidth: 2.5,
              borderRightWidth: 2.5,
            },
          ]}
        />

        {/* Horizontal Road */}
        <View
          style={[
            styles.road,
            {
              top: roadTop,
              left: 0,
              width: boardWidth,
              height: roadWidthPx,
              borderTopWidth: 2.5,
              borderBottomWidth: 2.5,
            },
          ]}
        />

        {/* Intersection Box */}
        <View
          style={[
            styles.intersectionBox,
            {
              left: roadLeft + 2,
              top: roadTop + 2,
              width: roadWidthPx - 4,
              height: roadWidthPx - 4,
            },
          ]}>
          <View style={styles.intersectionInnerGuide} />
        </View>

        {/* Center Dashed Lane Dividers */}
        <View
          style={[
            styles.dashCol,
            {
              left: centerX - 1.5,
              top: 6,
              height: Math.max(0, stopNorthPx - 14),
            },
          ]}>
          {dashes.north.map(i => (
            <View key={`nd-${i}`} style={styles.dashV} />
          ))}
        </View>
        <View
          style={[
            styles.dashCol,
            {
              left: centerX - 1.5,
              top: stopSouthPx + 10,
              height: Math.max(0, boardHeight - stopSouthPx - 16),
            },
          ]}>
          {dashes.south.map(i => (
            <View key={`sd-${i}`} style={styles.dashV} />
          ))}
        </View>
        <View
          style={[
            styles.dashRow,
            {
              top: centerY - 1.5,
              left: 6,
              width: Math.max(0, stopWestPx - 14),
            },
          ]}>
          {dashes.west.map(i => (
            <View key={`wd-${i}`} style={styles.dashH} />
          ))}
        </View>
        <View
          style={[
            styles.dashRow,
            {
              top: centerY - 1.5,
              left: stopEastPx + 10,
              width: Math.max(0, boardWidth - stopEastPx - 16),
            },
          ]}>
          {dashes.east.map(i => (
            <View key={`ed-${i}`} style={styles.dashH} />
          ))}
        </View>

        {/* Painted Asphalt Lane Direction Arrows */}
        <Text
          style={[
            styles.laneArrow,
            {
              left: originX + LANE_POS.N * scale - 10,
              top: stopNorthPx - 36 * scale - 10,
            },
          ]}>
          ↓
        </Text>
        <Text
          style={[
            styles.laneArrow,
            {
              left: originX + LANE_POS.S * scale - 10,
              top: stopSouthPx + 18 * scale,
            },
          ]}>
          ↑
        </Text>
        <Text
          style={[
            styles.laneArrow,
            {
              left: stopWestPx - 38 * scale - 8,
              top: originY + LANE_POS.W * scale - 11,
            },
          ]}>
          →
        </Text>
        <Text
          style={[
            styles.laneArrow,
            {
              left: stopEastPx + 18 * scale,
              top: originY + LANE_POS.E * scale - 11,
            },
          ]}>
          ←
        </Text>

        {/* Crosswalks */}
        <View
          style={[
            styles.crosswalkH,
            {
              left: roadLeft + 8,
              top: roadTop - 13,
              width: roadWidthPx - 16,
            },
          ]}>
          {CROSSWALK_INDICES.map(i => (
            <View key={`cn-${i}`} style={styles.zebraV} />
          ))}
        </View>
        <View
          style={[
            styles.crosswalkH,
            {
              left: roadLeft + 8,
              top: roadBottom + 3,
              width: roadWidthPx - 16,
            },
          ]}>
          {CROSSWALK_INDICES.map(i => (
            <View key={`cs-${i}`} style={styles.zebraV} />
          ))}
        </View>
        <View
          style={[
            styles.crosswalkV,
            {
              top: roadTop + 8,
              left: roadLeft - 13,
              height: roadWidthPx - 16,
            },
          ]}>
          {CROSSWALK_INDICES.map(i => (
            <View key={`cw-${i}`} style={styles.zebraH} />
          ))}
        </View>
        <View
          style={[
            styles.crosswalkV,
            {
              top: roadTop + 8,
              left: roadRight + 3,
              height: roadWidthPx - 16,
            },
          ]}>
          {CROSSWALK_INDICES.map(i => (
            <View key={`ce-${i}`} style={styles.zebraH} />
          ))}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  road: {
    position: 'absolute',
    backgroundColor: '#1E293B',
    borderColor: '#64748B',
  },
  intersectionBox: {
    position: 'absolute',
    backgroundColor: '#253349',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intersectionInnerGuide: {
    width: '62%',
    height: '62%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.14)',
    borderStyle: 'dashed',
  },
  dashCol: {
    position: 'absolute',
    width: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashRow: {
    position: 'absolute',
    height: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashV: {
    width: 2.5,
    height: 11,
    backgroundColor: '#F59E0B',
    opacity: 0.72,
    borderRadius: 1,
  },
  dashH: {
    width: 11,
    height: 2.5,
    backgroundColor: '#F59E0B',
    opacity: 0.72,
    borderRadius: 1,
  },
  laneArrow: {
    position: 'absolute',
    width: 20,
    textAlign: 'center',
    color: 'rgba(248, 250, 252, 0.22)',
    fontSize: 16,
    fontWeight: '900',
  },
  crosswalkH: {
    position: 'absolute',
    height: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crosswalkV: {
    position: 'absolute',
    width: 10,
    justifyContent: 'space-between',
  },
  zebraV: {
    width: 8,
    height: '100%',
    backgroundColor: 'rgba(248,250,252,0.28)',
    borderRadius: 1.5,
  },
  zebraH: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(248,250,252,0.28)',
    borderRadius: 1.5,
  },
});
