import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ROAD_MAX, ROAD_MIN } from '../game/constants';

interface Props {
  boardWidth: number;
  boardHeight: number;
  scale: number;
  originX: number;
  originY: number;
}

interface TreeProps {
  left: number;
  top: number;
  size: number;
  tint?: 'emerald' | 'lime' | 'teal';
}

const TREE_COLORS = {
  emerald: { outer: '#15803D', mid: '#16A34A', highlight: '#4ADE80' },
  lime: { outer: '#3F6212', mid: '#4D7C0F', highlight: '#84CC16' },
  teal: { outer: '#115E59', mid: '#0F766E', highlight: '#2DD4BF' },
};

const Tree: React.FC<TreeProps> = ({ left, top, size, tint = 'emerald' }) => {
  const colors = TREE_COLORS[tint];
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
      }}>
      {/* Ground shadow */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.14,
          top: size * 0.18,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(2, 6, 23, 0.38)',
        }}
      />
      {/* Outer canopy */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.outer,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Mid canopy */}
        <View
          style={{
            width: size * 0.76,
            height: size * 0.76,
            borderRadius: size * 0.38,
            backgroundColor: colors.mid,
            transform: [{ translateX: -size * 0.05 }, { translateY: -size * 0.05 }],
          }}
        />
        {/* Sunlit leaf highlight */}
        <View
          style={{
            position: 'absolute',
            left: size * 0.18,
            top: size * 0.16,
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: size * 0.17,
            backgroundColor: colors.highlight,
            opacity: 0.65,
          }}
        />
      </View>
    </View>
  );
};

interface StreetLampProps {
  left: number;
  top: number;
  scale: number;
}

const StreetLamp: React.FC<StreetLampProps> = ({ left, top, scale }) => {
  const glowSize = Math.max(44, 110 * scale);
  const poleSize = Math.max(7, 15 * scale);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: left - glowSize / 2,
        top: top - glowSize / 2,
        width: glowSize,
        height: glowSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
          backgroundColor: 'rgba(253, 224, 71, 0.11)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: glowSize * 0.5,
          height: glowSize * 0.5,
          borderRadius: glowSize * 0.25,
          backgroundColor: 'rgba(254, 240, 138, 0.14)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: poleSize,
          height: poleSize,
          borderRadius: poleSize / 2,
          backgroundColor: '#FEF08A',
          borderWidth: 2,
          borderColor: '#475569',
        }}
      />
    </View>
  );
};

export const CityEnvironment: React.FC<Props> = React.memo(
  ({ boardWidth, boardHeight, scale, originX, originY }) => {
    const roadLeft = originX + ROAD_MIN * scale;
    const roadRight = originX + ROAD_MAX * scale;
    const roadTop = originY + ROAD_MIN * scale;
    const roadBottom = originY + ROAD_MAX * scale;

    const sidewalk = Math.max(10, 26 * scale);
    const tlW = Math.max(0, roadLeft - sidewalk);
    const tlH = Math.max(0, roadTop - sidewalk);
    const trLeft = roadRight + sidewalk;
    const trW = Math.max(0, boardWidth - trLeft);
    const blTop = roadBottom + sidewalk;
    const blH = Math.max(0, boardHeight - blTop);

    const treeMd = Math.max(18, 46 * scale);
    const treeSm = Math.max(14, 34 * scale);
    const treeLg = Math.max(22, 56 * scale);

    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Subtle lawn mowing stripes across the base grass */}
        <View style={styles.lawnStripe1} />
        <View style={styles.lawnStripe2} />

        {/* Sidewalk slabs bordering vertical and horizontal roads */}
        <View
          style={[
            styles.sidewalk,
            {
              left: roadLeft - sidewalk,
              top: 0,
              width: roadRight - roadLeft + sidewalk * 2,
              height: boardHeight,
            },
          ]}
        />
        <View
          style={[
            styles.sidewalk,
            {
              left: 0,
              top: roadTop - sidewalk,
              width: boardWidth,
              height: roadBottom - roadTop + sidewalk * 2,
            },
          ]}
        />

        {/* ============================================================
            QUADRANT 1 (TOP-LEFT): ŞEHİR PARKI (City Park & Fountain)
           ============================================================ */}
        <View
          style={[
            styles.quadrant,
            { left: 0, top: 0, width: tlW, height: tlH },
          ]}>
          {/* Inner manicured park lawn */}
          <View
            style={[
              styles.parkLawn,
              {
                left: 10,
                right: 10,
                top: Math.max(64, tlH * 0.24),
                bottom: 10,
              },
            ]}>
            {/* Cross stone footpaths */}
            <View style={styles.parkPathH} />
            <View style={styles.parkPathV} />

            {/* Central Circular Fountain Plaza */}
            <View
              style={[
                styles.fountainPlaza,
                {
                  width: Math.min(tlW * 0.56, 74),
                  height: Math.min(tlW * 0.56, 74),
                  borderRadius: 999,
                },
              ]}>
              <View style={styles.fountainWater}>
                <View style={styles.fountainRipple} />
                <View style={styles.fountainCenter} />
              </View>
            </View>

            {/* Park Benches */}
            <View style={[styles.benchH, { top: 10, left: '22%' }]} />
            <View style={[styles.benchH, { bottom: 10, left: '22%' }]} />
          </View>

          {/* Park Trees */}
          <Tree left={12} top={Math.max(70, tlH * 0.26)} size={treeLg} tint="emerald" />
          <Tree left={tlW * 0.45} top={Math.max(58, tlH * 0.2)} size={treeSm} tint="lime" />
          <Tree left={10} top={tlH - treeLg - 14} size={treeMd} tint="teal" />
          <Tree left={tlW * 0.28} top={tlH - treeSm - 10} size={treeSm} tint="emerald" />
          {tlH > 220 && (
            <>
              <Tree left={tlW * 0.65} top={tlH * 0.28} size={treeMd} tint="emerald" />
              <Tree left={16} top={tlH * 0.54} size={treeSm} tint="lime" />
            </>
          )}
        </View>

        {/* ============================================================
            QUADRANT 2 (TOP-RIGHT): KAFE MEYDANI & MODERN BİNA
           ============================================================ */}
        <View
          style={[
            styles.quadrant,
            { left: trLeft, top: 0, width: trW, height: tlH },
          ]}>
          {/* Paved Plaza Floor */}
          <View
            style={[
              styles.plazaFloor,
              {
                left: 8,
                right: 8,
                top: Math.max(64, tlH * 0.22),
                bottom: 8,
              },
            ]}>
            {/* Modern Commercial Building (top portion) */}
            <View
              style={[
                styles.buildingShadow,
                {
                  top: 12,
                  right: 10,
                  left: 16,
                  height: Math.min(tlH * 0.34, 88),
                },
              ]}
            />
            <View
              style={[
                styles.modernBuilding,
                {
                  top: 8,
                  right: 14,
                  left: 12,
                  height: Math.min(tlH * 0.34, 88),
                },
              ]}>
              <View style={styles.skylightRow}>
                <View style={styles.skylightGlass} />
                <View style={styles.skylightGlass} />
              </View>
              <View style={styles.hvacRow}>
                <View style={styles.hvacUnit} />
                <View style={styles.hvacUnit} />
              </View>
            </View>

            {/* Cafe Outdoor Terrace Umbrellas */}
            <View style={styles.cafePatio}>
              <View style={[styles.umbrella, { backgroundColor: '#EF4444' }]}>
                <View style={styles.umbrellaDot} />
              </View>
              <View style={[styles.umbrella, { backgroundColor: '#F59E0B' }]}>
                <View style={styles.umbrellaDot} />
              </View>
              <View style={[styles.umbrella, { backgroundColor: '#0EA5E9' }]}>
                <View style={styles.umbrellaDot} />
              </View>
            </View>
          </View>

          {/* Planter Trees */}
          <Tree left={trW - treeMd - 8} top={tlH - treeMd - 10} size={treeMd} tint="teal" />
          <Tree left={10} top={Math.max(68, tlH * 0.24)} size={treeSm} tint="emerald" />
        </View>

        {/* ============================================================
            QUADRANT 3 (BOTTOM-LEFT): MAHALLE & APARTMANLAR
           ============================================================ */}
        <View
          style={[
            styles.quadrant,
            { left: 0, top: blTop, width: tlW, height: blH },
          ]}>
          {/* Residential Apartment 1 (Terracotta Roof) */}
          <View
            style={[
              styles.buildingShadow,
              {
                left: 14,
                top: 16,
                width: Math.max(44, tlW * 0.44),
                height: Math.min(blH * 0.34, 84),
              },
            ]}
          />
          <View
            style={[
              styles.terracottaRoof,
              {
                left: 10,
                top: 12,
                width: Math.max(44, tlW * 0.44),
                height: Math.min(blH * 0.34, 84),
              },
            ]}>
            <View style={styles.roofRidge} />
            <View style={styles.chimney} />
          </View>

          {/* Residential Apartment 2 (Slate Roof with Solar Panels) */}
          {blH > 150 && (
            <>
              <View
                style={[
                  styles.buildingShadow,
                  {
                    left: 18,
                    top: Math.min(blH * 0.48, 120),
                    right: 14,
                    height: Math.min(blH * 0.26, 72),
                  },
                ]}
              />
              <View
                style={[
                  styles.slateRoof,
                  {
                    left: 14,
                    top: Math.min(blH * 0.48, 120) - 4,
                    right: 18,
                    height: Math.min(blH * 0.26, 72),
                  },
                ]}>
                <View style={styles.solarRow}>
                  <View style={styles.solarPanel} />
                  <View style={styles.solarPanel} />
                  <View style={styles.solarPanel} />
                </View>
              </View>
            </>
          )}

          {/* Courtyard Flowerbeds */}
          <View style={[styles.flowerBed, { left: tlW * 0.62, top: 22 }]}>
            <View style={[styles.flowerDot, { backgroundColor: '#F472B6' }]} />
            <View style={[styles.flowerDot, { backgroundColor: '#FACC15' }]} />
            <View style={[styles.flowerDot, { backgroundColor: '#C084FC' }]} />
          </View>

          {/* Neighborhood Trees */}
          <Tree left={tlW * 0.56} top={blH * 0.22} size={treeSm} tint="lime" />
          <Tree left={12} top={blH * 0.38} size={treeSm} tint="emerald" />
          <Tree left={tlW - treeMd - 12} top={blH * 0.68} size={treeMd} tint="emerald" />
        </View>

        {/* ============================================================
            QUADRANT 4 (BOTTOM-RIGHT): İŞ MERKEZİ, HELİPORT & OTOPARK
           ============================================================ */}
        <View
          style={[
            styles.quadrant,
            { left: trLeft, top: blTop, width: trW, height: blH },
          ]}>
          {/* Mini Parking Lot (upper part near sidewalk) */}
          <View
            style={[
              styles.parkingLot,
              {
                left: 12,
                right: 10,
                top: 14,
                height: Math.min(blH * 0.26, 62),
              },
            ]}>
            <View style={styles.parkingBay}>
              <View style={[styles.parkedCar, { backgroundColor: '#3B82F6' }]} />
            </View>
            <View style={styles.parkingBay}>
              <View style={[styles.parkedCar, { backgroundColor: '#E2E8F0' }]} />
            </View>
            <View style={styles.parkingBay} />
            <View style={styles.parkingBay}>
              <View style={[styles.parkedCar, { backgroundColor: '#EF4444' }]} />
            </View>
          </View>

          {/* Downtown Office Tower with Helipad */}
          {blH > 140 && (
            <>
              <View
                style={[
                  styles.buildingShadow,
                  {
                    left: 18,
                    right: 10,
                    top: Math.min(blH * 0.36, 92),
                    height: Math.min(blH * 0.36, 96),
                  },
                ]}
              />
              <View
                style={[
                  styles.officeTower,
                  {
                    left: 14,
                    right: 14,
                    top: Math.min(blH * 0.36, 92) - 4,
                    height: Math.min(blH * 0.36, 96),
                  },
                ]}>
                <View style={styles.helipadRing}>
                  <Text style={styles.helipadH}>H</Text>
                </View>
              </View>
            </>
          )}

          {/* Sidewalk Bus Stop Canopy */}
          <View
            style={[
              styles.busStop,
              {
                left: -sidewalk * 0.72,
                top: Math.min(blH * 0.45, 110),
                width: Math.max(8, sidewalk * 0.6),
                height: Math.max(24, 56 * scale),
              },
            ]}
          />

          <Tree left={trW - treeSm - 10} top={blH * 0.76} size={treeSm} tint="teal" />
          <Tree left={10} top={blH * 0.74} size={treeMd} tint="emerald" />
        </View>

        {/* 4 Corner Streetlamps with soft warm light glow */}
        <StreetLamp left={roadLeft - sidewalk * 0.45} top={roadTop - sidewalk * 0.45} scale={scale} />
        <StreetLamp left={roadRight + sidewalk * 0.45} top={roadTop - sidewalk * 0.45} scale={scale} />
        <StreetLamp left={roadLeft - sidewalk * 0.45} top={roadBottom + sidewalk * 0.45} scale={scale} />
        <StreetLamp left={roadRight + sidewalk * 0.45} top={roadBottom + sidewalk * 0.45} scale={scale} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  lawnStripe1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '18%',
    height: '12%',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  lawnStripe2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '68%',
    height: '12%',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  sidewalk: {
    position: 'absolute',
    backgroundColor: '#475569',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  quadrant: {
    position: 'absolute',
    overflow: 'hidden',
  },
  // Park (TL)
  parkLawn: {
    position: 'absolute',
    backgroundColor: '#1E4D38',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  parkPathH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#64748B',
    opacity: 0.42,
  },
  parkPathV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#64748B',
    opacity: 0.42,
  },
  fountainPlaza: {
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  fountainWater: {
    width: '74%',
    height: '74%',
    borderRadius: 999,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
  },
  fountainRipple: {
    width: '56%',
    height: '56%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(224, 242, 254, 0.7)',
  },
  fountainCenter: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E0F2FE',
  },
  benchH: {
    position: 'absolute',
    width: 22,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#92400E',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  // Cafe Plaza (TR)
  plazaFloor: {
    position: 'absolute',
    backgroundColor: '#293548',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
  },
  buildingShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    borderRadius: 10,
  },
  modernBuilding: {
    position: 'absolute',
    backgroundColor: '#334155',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B',
    padding: 8,
    justifyContent: 'space-between',
  },
  skylightRow: {
    flexDirection: 'row',
    gap: 6,
    height: '46%',
  },
  skylightGlass: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.32)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.45)',
  },
  hvacRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
  },
  hvacUnit: {
    width: 12,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cafePatio: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  umbrella: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  umbrellaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  // Residential (BL)
  terracottaRoof: {
    position: 'absolute',
    backgroundColor: '#9A3412',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roofRidge: {
    width: '82%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#EA580C',
    opacity: 0.75,
  },
  chimney: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 2,
    backgroundColor: '#475569',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  slateRoof: {
    position: 'absolute',
    backgroundColor: '#334155',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#475569',
    padding: 8,
    justifyContent: 'center',
  },
  solarRow: {
    flexDirection: 'row',
    gap: 5,
    height: 22,
  },
  solarPanel: {
    flex: 1,
    backgroundColor: '#1D4ED8',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#60A5FA',
    opacity: 0.85,
  },
  flowerBed: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(20, 83, 45, 0.85)',
  },
  flowerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Downtown (BR)
  parkingLot: {
    position: 'absolute',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    flexDirection: 'row',
    padding: 4,
    gap: 3,
  },
  parkingBay: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(248, 250, 252, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkedCar: {
    width: '62%',
    height: '66%',
    borderRadius: 3,
    opacity: 0.88,
  },
  officeTower: {
    position: 'absolute',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helipadRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: '#FACC15',
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helipadH: {
    color: '#FACC15',
    fontSize: 20,
    fontWeight: '900',
  },
  busStop: {
    position: 'absolute',
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
});
