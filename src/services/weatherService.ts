import type { WeatherData, TemperatureUnit, GeoLocation, DailyForecast } from '../types/weather';
import { capitalize, formatCityDateTime, formatWindDirection } from '../utils/formatWeather';
import { getWeatherTheme } from '../utils/getWeatherTheme';

export interface FetchWeatherOptions {
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  unit?: TemperatureUnit;
  userApiKey?: string;
}

export interface WeatherApiResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
  needsApiKey?: boolean;
}


function getNowFormatted(offsetSec: number) {
  const dt = Math.floor(Date.now() / 1000);
  const info = formatCityDateTime(dt, offsetSec);
  return {
    timestamp: dt,
    formattedTime: info.time,
    formattedDate: info.desktopFull,
  };
}

export const SAMPLE_CITIES_DATA: Record<string, WeatherData> = {
  'Simão Dias': {
    id: 3447953,
    city: 'Simão Dias',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.7381,
    lon: -37.8108,
    temp: 28,
    feelsLike: 30,
    tempMin: 22,
    tempMax: 31,
    humidity: 65,
    pressure: 1013,
    windSpeed: 14,
    windDeg: 100,
    windDirectionText: 'L 14 km/h',
    cloudiness: 30,
    visibility: 10,
    uvIndex: 8,
    condition: 'Parcialmente Nublado',
    conditionMain: 'Clouds',
    conditionId: 802,
    iconCode: '02d',
    timezoneOffset: -10800,
    ...getNowFormatted(-10800),
    themeKey: 'clear-day',
    isMockOrSample: true,
  },
  'Lagarto': {
    id: 3459146,
    city: 'Lagarto',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.9169,
    lon: -37.65,
    temp: 29,
    feelsLike: 31,
    tempMin: 23,
    tempMax: 32,
    humidity: 62,
    pressure: 1012,
    windSpeed: 13,
    windDeg: 120,
    windDirectionText: 'SE 13 km/h',
    cloudiness: 20,
    visibility: 10,
    uvIndex: 9,
    condition: 'Céu Limpo',
    conditionMain: 'Clear',
    conditionId: 800,
    iconCode: '01d',
    timezoneOffset: -10800,
    ...getNowFormatted(-10800),
    themeKey: 'clear-day',
    isMockOrSample: true,
  },
  'Poço Verde': {
    id: 3453733,
    city: 'Poço Verde',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.7078,
    lon: -38.1822,
    temp: 30,
    feelsLike: 32,
    tempMin: 23,
    tempMax: 33,
    humidity: 55,
    pressure: 1011,
    windSpeed: 16,
    windDeg: 90,
    windDirectionText: 'L 16 km/h',
    cloudiness: 15,
    visibility: 10,
    uvIndex: 9,
    condition: 'Ensolarado',
    conditionMain: 'Clear',
    conditionId: 800,
    iconCode: '01d',
    timezoneOffset: -10800,
    ...getNowFormatted(-10800),
    themeKey: 'clear-day',
    isMockOrSample: true,
  },
  'Aracaju': {
    id: 3471872,
    city: 'Aracaju',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.9111,
    lon: -37.0717,
    temp: 27,
    feelsLike: 29,
    tempMin: 24,
    tempMax: 29,
    humidity: 78,
    pressure: 1014,
    windSpeed: 19,
    windDeg: 130,
    windDirectionText: 'SE 19 km/h',
    cloudiness: 45,
    visibility: 10,
    uvIndex: 8,
    condition: 'Parcialmente Nublado',
    conditionMain: 'Clouds',
    conditionId: 802,
    iconCode: '02d',
    timezoneOffset: -10800,
    ...getNowFormatted(-10800),
    themeKey: 'clear-day',
    isMockOrSample: true,
  },
};

/**
 * Converte a resposta bruta do backend em uma estrutura WeatherData tipada
 */
export function transformApiResponse(json: any): WeatherData {
  const weatherItem = json.weather?.[0] || {
    id: 800,
    main: 'Clear',
    description: 'Céu limpo',
    icon: '01d',
  };

  const dt = json.dt || Math.floor(Date.now() / 1000);
  const timezone = json.timezone || 0;
  const dateTime = formatCityDateTime(dt, timezone);

  // OpenWeatherMap no modo metric retorna wind.speed em m/s -> converte para km/h (* 3.6)
  const rawWindSpeed = json.wind?.speed ?? 0;
  const windKmh = Math.round(rawWindSpeed * 3.6);
  const windDeg = json.wind?.deg ?? 0;
  const windDir = formatWindDirection(windDeg);

  // Visibilidade em metros -> converte para km
  const visibilityKm = json.visibility ? Math.round(json.visibility / 1000) : 10;

  const cityName = json.name || 'Local desconhecido';
  const theme = getWeatherTheme(weatherItem.id, weatherItem.icon, cityName);

  return {
    id: json.id || Date.now(),
    city: cityName,
    country: json.sys?.country || '',
    state: json.state || undefined,
    lat: json.coord?.lat,
    lon: json.coord?.lon,
    temp: Math.round(json.main?.temp ?? 0),
    feelsLike: Math.round(json.main?.feels_like ?? 0),
    tempMin: Math.round(json.main?.temp_min ?? 0),
    tempMax: Math.round(json.main?.temp_max ?? 0),
    humidity: json.main?.humidity ?? 0,
    pressure: json.main?.pressure ?? 1013,
    windSpeed: windKmh,
    windDeg,
    windDirectionText: `${windDir} ${windKmh} km/h`,
    cloudiness: json.clouds?.all ?? 0,
    visibility: visibilityKm,
    uvIndex: json.uvIndex,
    condition: capitalize(weatherItem.description || weatherItem.main),
    conditionMain: weatherItem.main,
    conditionId: weatherItem.id,
    iconCode: weatherItem.icon,
    timestamp: dt,
    timezoneOffset: timezone,
    formattedTime: dateTime.time,
    formattedDate: dateTime.desktopFull,
    themeKey: theme.key,
    isMockOrSample: json.isSample || false,
  };
}

/**
 * Busca sugestões de cidades com estado e país via API de Geocoding
 */
export async function searchCityGeo(
  query: string,
  userApiKey?: string,
  signal?: AbortSignal
): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams();
  params.set('q', query.trim());
  params.set('limit', '5');

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (userApiKey) {
    headers['x-api-key'] = userApiKey.trim();
  }

  try {
    const res = await fetch(`/api/geo?${params.toString()}`, {
      headers,
      signal,
    });
    if (!res.ok) return [];
    const items = await res.json();
    return items;
  } catch (err: any) {
    if (err.name === 'AbortError') return [];
    console.warn('Erro ao autocompletar cidades:', err);
    return [];
  }
}

/**
 * Busca a previsão para os próximos 5 dias
 */
export async function fetchForecastData(
  options: FetchWeatherOptions,
  signal?: AbortSignal
): Promise<DailyForecast[]> {
  const { city, lat, lon, userApiKey } = options;

  const params = new URLSearchParams();
  if (lat !== undefined && lon !== undefined) {
    params.set('lat', String(lat));
    params.set('lon', String(lon));
  } else if (city) {
    params.set('q', city.trim());
  }
  params.set('units', 'metric');
  params.set('lang', 'pt_br');

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (userApiKey) {
    headers['x-api-key'] = userApiKey.trim();
  }

  try {
    const res = await fetch(`/api/forecast?${params.toString()}`, {
      headers,
      signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.list || [];
  } catch (err: any) {
    if (err.name === 'AbortError') return [];
    console.warn('Erro ao carregar previsão de 5 dias:', err);
    return [];
  }
}

/**
 * Busca dados meteorológicos chamando a rota de backend /api/weather
 */
export async function fetchWeatherData(
  options: FetchWeatherOptions,
  signal?: AbortSignal
): Promise<WeatherApiResponse> {
  const { city, state, country, lat, lon, userApiKey } = options;

  const params = new URLSearchParams();
  if (lat !== undefined && lon !== undefined) {
    params.set('lat', String(lat));
    params.set('lon', String(lon));
    if (city) params.set('city', city.trim());
    if (state) params.set('state', state);
    if (country) params.set('country', country);
  } else if (city) {
    params.set('q', city.trim());
  }
  params.set('units', 'metric');
  params.set('lang', 'pt_br');

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (userApiKey) {
    headers['x-api-key'] = userApiKey.trim();
  }

  try {
    const response = await fetch(`/api/weather?${params.toString()}`, {
      method: 'GET',
      headers,
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      // Se a chave não estiver configurada no servidor e temos coordenadas ou cidade de referência
      if (data.needsApiKey) {
        if (lat !== undefined && lon !== undefined) {
          if (Math.abs(lat - (-10.7381)) < 0.5) {
            return {
              success: true,
              data: SAMPLE_CITIES_DATA['Simão Dias'],
              needsApiKey: true,
            };
          }
          if (Math.abs(lat - (-10.9169)) < 0.5) {
            return {
              success: true,
              data: SAMPLE_CITIES_DATA['Lagarto'],
              needsApiKey: true,
            };
          }
          if (Math.abs(lat - (-10.7078)) < 0.5) {
            return {
              success: true,
              data: SAMPLE_CITIES_DATA['Poço Verde'],
              needsApiKey: true,
            };
          }
          if (Math.abs(lat - (-10.9111)) < 0.5) {
            return {
              success: true,
              data: SAMPLE_CITIES_DATA['Aracaju'],
              needsApiKey: true,
            };
          }
        }

        if (city) {
          const sampleMatch = Object.keys(SAMPLE_CITIES_DATA).find(
            (k) => k.toLowerCase() === city.toLowerCase()
          );
          if (sampleMatch) {
            return {
              success: true,
              data: SAMPLE_CITIES_DATA[sampleMatch],
              needsApiKey: true,
            };
          }
        }
      }

      return {
        success: false,
        error:
          data.error ||
          'Não foi possível obter os dados meteorológicos. Verifique o nome da cidade.',
        needsApiKey: !!data.needsApiKey,
      };
    }

    const weatherData = transformApiResponse(data);
    // Se o backend não tinha o estado mas passamos explicitamente, preserve
    if (state && !weatherData.state) {
      weatherData.state = state;
    }
    return {
      success: true,
      data: weatherData,
      needsApiKey: !!data.needsApiKey,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }

    // Caso o backend esteja offline e seja uma das cidades de referência
    if (lat !== undefined && Math.abs(lat - (-10.9111)) < 0.5) {
      return {
        success: true,
        data: SAMPLE_CITIES_DATA['Aracaju'],
        needsApiKey: true,
      };
    }

    if (city) {
      const sampleMatch = Object.keys(SAMPLE_CITIES_DATA).find(
        (k) => k.toLowerCase() === city.toLowerCase()
      );
      if (sampleMatch) {
        return {
          success: true,
          data: SAMPLE_CITIES_DATA[sampleMatch],
          needsApiKey: true,
        };
      }
    }

    return {
      success: false,
      error: 'Erro de conexão com o servidor. Verifique sua conexão e tente novamente.',
    };
  }
}
