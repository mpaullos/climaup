import { useState, useEffect, useRef, useCallback } from 'react';
import type { WeatherData, TemperatureUnit, SavedLocation } from '../types/weather';
import { fetchWeatherData, fetchForecastData, SAMPLE_CITIES_DATA } from '../services/weatherService';

const SAVED_LOCATIONS_STORAGE_KEY = 'clima_saved_locations';
const UNIT_STORAGE_KEY = 'clima_temp_unit';
const USER_API_KEY_STORAGE = 'clima_user_api_key';

const DEFAULT_SAVED_LOCATIONS: SavedLocation[] = [
  { id: '1', name: 'Aracaju', state: 'Sergipe', country: 'BR', lat: -10.9111, lon: -37.0717, temp: 27, condition: 'Parcialmente Nublado' },
  { id: '2', name: 'Simão Dias', state: 'Sergipe', country: 'BR', lat: -10.7381, lon: -37.8108, temp: 28, condition: 'Parcialmente Nublado' },
  { id: '3', name: 'Lagarto', state: 'Sergipe', country: 'BR', lat: -10.9169, lon: -37.65, temp: 29, condition: 'Céu Limpo' },
  { id: '4', name: 'Poço Verde', state: 'Sergipe', country: 'BR', lat: -10.7078, lon: -38.1822, temp: 30, condition: 'Ensolarado' },
];

export function useWeather(initialCity = 'Aracaju, Sergipe') {
  const [data, setData] = useState<WeatherData | null>(() => {
    return SAMPLE_CITIES_DATA['Aracaju'] || SAMPLE_CITIES_DATA['Simão Dias'] || Object.values(SAMPLE_CITIES_DATA)[0];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);

  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    const saved = localStorage.getItem(UNIT_STORAGE_KEY);
    return saved === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  });

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_SAVED_LOCATIONS;
  });

  const [activeLocationIndex, setActiveLocationIndex] = useState<number>(0);
  const [userApiKey, setUserApiKeyState] = useState<string>(() => {
    return localStorage.getItem(USER_API_KEY_STORAGE) || '';
  });

  // Checa se a chave já existe no ambiente (.env) do servidor
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg?.hasServerKey) {
          setHasServerKey(true);
          setNeedsApiKey(false);
        }
      })
      .catch(() => {
        // ignora se falhar
      });
  }, []);

  // AbortController para prevenir race conditions de requisições anteriores
  const abortControllerRef = useRef<AbortController | null>(null);

  const setUserApiKey = useCallback((key: string) => {
    setUserApiKeyState(key);
    if (key) {
      localStorage.setItem(USER_API_KEY_STORAGE, key);
      setNeedsApiKey(false);
    } else {
      localStorage.removeItem(USER_API_KEY_STORAGE);
    }
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit((prev) => {
      const next = prev === 'celsius' ? 'fahrenheit' : 'celsius';
      localStorage.setItem(UNIT_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const executeSearch = useCallback(
    async (query: { city?: string; lat?: number; lon?: number; state?: string; country?: string }) => {
      // Cancela requisição anterior pendente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const [response, forecastList] = await Promise.all([
          fetchWeatherData(
            {
              city: query.city,
              lat: query.lat,
              lon: query.lon,
              state: query.state,
              country: query.country,
              unit,
              userApiKey,
            },
            controller.signal
          ),
          fetchForecastData(
            {
              city: query.city,
              lat: query.lat,
              lon: query.lon,
              unit,
              userApiKey,
            },
            controller.signal
          ),
        ]);

        if (response.needsApiKey && !hasServerKey) {
          setNeedsApiKey(true);
        } else if (hasServerKey) {
          setNeedsApiKey(false);
        }

        if (response.success && response.data) {
          const enrichedData = {
            ...response.data,
            forecast: forecastList.length > 0 ? forecastList : response.data.forecast,
          };
          setData(enrichedData);
          setError(null);

          // Atualiza dados na lista de salvos caso a cidade esteja lá
          const currentCityName = response.data.city;
          const currentCityState = response.data.state;
          setSavedLocations((prev) =>
            prev.map((loc) => {
              const nameMatch = loc.name.toLowerCase() === currentCityName.toLowerCase();
              const stateMatch = !loc.state || !currentCityState || loc.state.toLowerCase() === currentCityState.toLowerCase();
              return nameMatch && stateMatch
                ? {
                    ...loc,
                    temp: response.data!.temp,
                    condition: response.data!.condition,
                    conditionId: response.data!.conditionId,
                    iconCode: response.data!.iconCode,
                  }
                : loc;
            })
          );
        } else {
          setError(response.error || 'Não foi possível encontrar a cidade.');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Ocorreu um erro inesperado ao buscar o clima.');
        }
      } finally {
        setLoading(false);
      }
    },
    [unit, userApiKey]
  );

  const searchCity = useCallback(
    (cityName: string, coords?: { lat: number; lon: number }, state?: string, country?: string) => {
      if (!cityName.trim()) return;
      if (coords) {
        executeSearch({
          city: cityName.trim(),
          lat: coords.lat,
          lon: coords.lon,
          state,
          country,
        });
      } else {
        executeSearch({ city: cityName.trim() });
      }
    },
    [executeSearch]
  );

  const fetchByCoordinates = useCallback(
    (lat: number, lon: number) => {
      executeSearch({ lat, lon });
    },
    [executeSearch]
  );

  const refreshWeather = useCallback(() => {
    if (data?.lat && data?.lon) {
      executeSearch({ city: data.city, lat: data.lat, lon: data.lon });
    } else if (data?.city) {
      executeSearch({ city: data.city });
    }
  }, [data, executeSearch]);

  const selectSavedLocation = useCallback(
    (index: number) => {
      if (index >= 0 && index < savedLocations.length) {
        setActiveLocationIndex(index);
        const loc = savedLocations[index];
        if (loc.lat !== undefined && loc.lon !== undefined) {
          executeSearch({ city: loc.name, lat: loc.lat, lon: loc.lon });
        } else {
          searchCity(loc.name);
        }
      }
    },
    [savedLocations, executeSearch, searchCity]
  );

  const toggleSaveLocation = useCallback(
    (cityName: string, country = '', state?: string, lat?: number, lon?: number) => {
      setSavedLocations((prev) => {
        const exists = prev.some(
          (loc) =>
            loc.name.toLowerCase() === cityName.toLowerCase() &&
            (loc.state || '').toLowerCase() === (state || '').toLowerCase()
        );
        let updated: SavedLocation[];
        if (exists) {
          updated = prev.filter(
            (loc) =>
              !(
                loc.name.toLowerCase() === cityName.toLowerCase() &&
                (loc.state || '').toLowerCase() === (state || '').toLowerCase()
              )
          );
        } else {
          updated = [
            {
              id: String(Date.now()),
              name: cityName,
              country,
              state: state || data?.state,
              lat: lat ?? data?.lat,
              lon: lon ?? data?.lon,
              temp: data?.temp,
              condition: data?.condition,
              conditionId: data?.conditionId,
              iconCode: data?.iconCode,
            },
            ...prev,
          ];
        }
        localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [data]
  );

  const removeSavedLocation = useCallback((cityName: string) => {
    setSavedLocations((prev) => {
      const updated = prev.filter(
        (loc) => loc.name.toLowerCase() !== cityName.toLowerCase()
      );
      localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Busca inicial
  useEffect(() => {
    executeSearch({ city: initialCity });
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const isCurrentSaved = !!data && savedLocations.some(
    (loc) => loc.name.toLowerCase() === data.city.toLowerCase()
  );

  return {
    data,
    loading,
    error,
    needsApiKey: !hasServerKey && !userApiKey && needsApiKey,
    hasServerKey,
    unit,
    savedLocations,
    activeLocationIndex,
    isCurrentSaved,
    searchCity,
    fetchByCoordinates,
    refreshWeather,
    toggleUnit,
    toggleSaveLocation,
    removeSavedLocation,
    selectSavedLocation,
    userApiKey,
    setUserApiKey,
  };
}
