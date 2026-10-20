export type WeatherThemeKey =
  | 'rain'
  | 'rain-foliage'
  | 'thunderstorm'
  | 'drizzle'
  | 'snow'
  | 'clear-day'
  | 'clear-night'
  | 'clouds-day'
  | 'clouds-night'
  | 'clouds-sunset'
  | 'mist';

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  id: number;
  city: string;
  country: string;
  state?: string;
  lat?: number;
  lon?: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number; // in km/h
  windDeg: number;
  windDirectionText: string;
  cloudiness: number; // %
  visibility: number; // in km
  uvIndex?: number;
  condition: string;
  conditionMain: string;
  conditionId: number;
  iconCode: string;
  timestamp: number;
  timezoneOffset: number; // in seconds
  formattedTime: string;
  formattedDate: string;
  themeKey: WeatherThemeKey;
  isMockOrSample?: boolean;
  forecast?: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  dayName: string;
  dayShort: string;
  dayLong?: string;
  isTomorrow?: boolean;
  tempMin: number;
  tempMax: number;
  condition: string;
  conditionMain: string;
  conditionId: number;
  iconCode: string;
  pop: number; // probabilidade de chuva %
  humidity: number;
}

export interface GeoLocation {
  name: string;
  localNames?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  countryName?: string;
  flag?: string;
  displayName: string;
}

export interface OpenWeatherRawResponse {
  coord?: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base?: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility?: number;
  wind?: {
    speed: number;
    deg?: number;
    gust?: number;
  };
  clouds?: {
    all: number;
  };
  dt: number;
  sys?: {
    type?: number;
    id?: number;
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
  message?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat?: number;
  lon?: number;
  temp?: number;
  condition?: string;
  conditionId?: number;
  iconCode?: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  needsApiKey: boolean;
  unit: TemperatureUnit;
  savedLocations: SavedLocation[];
  activeLocationIndex: number;
}
