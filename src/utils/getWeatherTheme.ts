import type { WeatherThemeKey } from '../types/weather';

export interface WeatherThemeConfig {
  key: WeatherThemeKey;
  imageSrc: string;
  overlayGradient: string;
  fallbackGradient: string;
  accentColor: string;
  description: string;
}

export function getWeatherTheme(
  conditionId: number,
  iconCode = '01d',
  cityName = ''
): WeatherThemeConfig {
  const isNight = iconCode.endsWith('n');

  // 1. Trovoada (Thunderstorm) 200 - 232
  if (conditionId >= 200 && conditionId < 300) {
    return {
      key: 'thunderstorm',
      imageSrc: '/images/weather/clouds_sunset.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(12, 10, 20, 0.4) 0%, rgba(18, 12, 28, 0.6) 50%, rgba(8, 6, 15, 0.92) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #181124 0%, #2e1a47 50%, #090514 100%)',
      accentColor: '#a855f7',
      description: 'Tempestade com Raios',
    };
  }

  // 2. Garoa / Chuvisco (Drizzle) 300 - 321
  if (conditionId >= 300 && conditionId < 400) {
    return {
      key: 'drizzle',
      imageSrc: '/images/weather/rain_bokeh.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(8, 15, 25, 0.3) 0%, rgba(10, 18, 30, 0.55) 50%, rgba(5, 10, 18, 0.9) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #0b1a29 0%, #17324d 50%, #060e17 100%)',
      accentColor: '#38bdf8',
      description: 'Garoa / Chuvisco',
    };
  }

  // 3. Chuva (Rain) 500 - 531
  if (conditionId >= 500 && conditionId < 600) {
    const useFoliage = conditionId === 500 || conditionId === 520 || conditionId === 521;
    return {
      key: useFoliage ? 'rain-foliage' : 'rain',
      imageSrc: useFoliage
        ? '/images/weather/wet_foliage.jpg'
        : '/images/weather/rain_bokeh.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(10, 18, 28, 0.25) 0%, rgba(8, 15, 25, 0.5) 50%, rgba(4, 9, 16, 0.9) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #091524 0%, #142a42 50%, #050b12 100%)',
      accentColor: '#60a5fa',
      description: 'Chuva',
    };
  }

  // 4. Neve (Snow) 600 - 622
  if (conditionId >= 600 && conditionId < 700) {
    return {
      key: 'snow',
      imageSrc: '/images/weather/snow_frost.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(15, 23, 35, 0.25) 0%, rgba(20, 30, 45, 0.45) 50%, rgba(10, 15, 25, 0.9) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
      accentColor: '#e2e8f0',
      description: 'Neve',
    };
  }

  // 5. Neblina / Névoa / Atmosfera (Mist, Fog, Haze) 700 - 781
  if (conditionId >= 700 && conditionId < 800) {
    return {
      key: 'mist',
      imageSrc: '/images/weather/snow_frost.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(20, 24, 30, 0.35) 0%, rgba(22, 28, 36, 0.6) 50%, rgba(12, 16, 22, 0.92) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #1f2937 0%, #374151 50%, #111827 100%)',
      accentColor: '#94a3b8',
      description: 'Névoa / Neblina',
    };
  }

  // 6. Céu limpo (Clear Sky) 800 e Poucas Nuvens (Few Clouds / Sol com Nuvens) 801-802
  if (conditionId === 800 || conditionId === 801 || conditionId === 802) {
    if (isNight) {
      return {
        key: 'clear-night',
        imageSrc: '/images/weather/clear_night.jpg',
        overlayGradient:
          'linear-gradient(180deg, rgba(4, 7, 18, 0.3) 0%, rgba(5, 9, 24, 0.55) 50%, rgba(2, 4, 12, 0.9) 100%)',
        fallbackGradient:
          'linear-gradient(135deg, #050b18 0%, #0e1b38 50%, #020409 100%)',
        accentColor: '#818cf8',
        description: conditionId === 800 ? 'Noite Limpa Estrelada' : 'Noite Parcialmente Limpa',
      };
    }
    return {
      key: 'clear-day',
      imageSrc: '/images/weather/clear_sunny.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(15, 25, 45, 0.15) 0%, rgba(20, 30, 50, 0.35) 50%, rgba(10, 16, 28, 0.88) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #0f172a 100%)',
      accentColor: '#fbbf24',
      description: conditionId === 800 ? 'Ensolarado / Céu Limpo' : 'Sol Entre Nuvens',
    };
  }

  // 7. Nuvens Carregadas / Nublado (Broken / Overcast Clouds) 803 - 804
  if (conditionId === 803 || conditionId === 804) {
    if (isNight) {
      return {
        key: 'clouds-night',
        imageSrc: '/images/weather/clear_night.jpg',
        overlayGradient:
          'linear-gradient(180deg, rgba(8, 12, 22, 0.35) 0%, rgba(10, 16, 28, 0.6) 50%, rgba(4, 8, 16, 0.92) 100%)',
        fallbackGradient:
          'linear-gradient(135deg, #0a1120 0%, #152238 50%, #040812 100%)',
        accentColor: '#93c5fd',
        description: 'Nuvens à Noite',
      };
    }
    return {
      key: 'clouds-sunset',
      imageSrc: '/images/weather/clouds_sunset.jpg',
      overlayGradient:
        'linear-gradient(180deg, rgba(18, 12, 10, 0.25) 0%, rgba(22, 14, 10, 0.5) 50%, rgba(12, 8, 6, 0.9) 100%)',
      fallbackGradient:
        'linear-gradient(135deg, #291811 0%, #452313 50%, #130a06 100%)',
      accentColor: '#fb923c',
      description: 'Nublado / Encoberto',
    };
  }

  // Padrão / Fallback
  return {
    key: 'clear-day',
    imageSrc: '/images/weather/clear_sunny.jpg',
    overlayGradient:
      'linear-gradient(180deg, rgba(10, 15, 25, 0.2) 0%, rgba(12, 18, 30, 0.45) 50%, rgba(6, 10, 18, 0.9) 100%)',
    fallbackGradient:
      'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)',
    accentColor: '#38bdf8',
    description: 'Condição Normal',
  };
}
