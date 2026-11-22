import { Linking, Share } from 'react-native';
import { getLevelConfig } from '../game/constants';
import { GameState } from '../game/types';

export type SharePlatform = 'native' | 'whatsapp' | 'x';

export function buildShareMessage(
  state: GameState,
  mode: 'gameover' | 'best' = 'gameover',
): string {
  if (mode === 'best') {
    const levelCfg = getLevelConfig(state.bestScore);
    return (
      `🚦 Kavşak Kaosu'nda rekorum: ${state.bestScore} puan! ` +
      `(${levelCfg.label})\n` +
      `Trafiği kilitlemeden benim rekorumu geçebilir misin? 🚗💨 #KavşakKaosu`
    );
  }

  const levelCfg = getLevelConfig(state.score);
  const nearMissPart =
    state.nearMisses > 0 ? `, ⚡ ${state.nearMisses} kıl payı geçiş` : '';
  const recordTag =
    state.score > 0 && state.score >= state.bestScore ? ' 🏆 YENİ REKOR!' : '';

  return (
    `🚦 Kavşak Kaosu'nda ${state.score} puan yaptım!${recordTag}\n` +
    `📊 Seviye ${levelCfg.level}: ${levelCfg.label}\n` +
    `🚗 ${state.carsCleared} araç geçirdim${nearMissPart}!\n` +
    `Bakalım benim skorumu geçebilecek misin? #KavşakKaosu`
  );
}

export async function shareScore(
  state: GameState,
  platform: SharePlatform = 'native',
  mode: 'gameover' | 'best' = 'gameover',
): Promise<void> {
  const message = buildShareMessage(state, mode);
  const encoded = encodeURIComponent(message);

  try {
    if (platform === 'whatsapp') {
      const appUrl = `whatsapp://send?text=${encoded}`;
      const canOpenApp = await Linking.canOpenURL(appUrl);
      if (canOpenApp) {
        await Linking.openURL(appUrl);
        return;
      }
      const webUrl = `https://wa.me/?text=${encoded}`;
      await Linking.openURL(webUrl);
      return;
    }

    if (platform === 'x') {
      const xUrl = `https://twitter.com/intent/tweet?text=${encoded}`;
      await Linking.openURL(xUrl);
      return;
    }

    await Share.share({
      title: 'Kavşak Kaosu Skorum!',
      message,
    });
  } catch {
    // Fallback to native share sheet if deep link fails
    try {
      await Share.share({
        title: 'Kavşak Kaosu Skorum!',
        message,
      });
    } catch {
      // User dismissed or share unavailable
    }
  }
}
