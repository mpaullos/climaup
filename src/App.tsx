import { useWeather } from './hooks/useWeather';
import { WeatherLayout } from './components/layout/WeatherLayout';
import { ApiKeyBanner } from './components/ui/ApiKeyBanner';

export default function App() {
  const {
    data,
    loading,
    error,
    needsApiKey,
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
  } = useWeather('Aracaju, Sergipe');

  // Manipulador de geolocalização do navegador
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchByCoordinates(latitude, longitude);
      },
      (geoError) => {
        let msg = 'Não foi possível obter sua localização.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Permissão de localização negada pelo usuário.';
        }
        console.warn('Geolocation error:', geoError.message);
        alert(msg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <main className="relative min-h-screen bg-slate-950 font-sans">
      <WeatherLayout
        weather={data}
        loading={loading}
        error={error}
        unit={unit}
        savedLocations={savedLocations}
        activeLocationIndex={activeLocationIndex}
        isSaved={isCurrentSaved}
        userApiKey={userApiKey}
        onSearch={searchCity}
        onGeolocation={handleGeolocation}
        onRefresh={refreshWeather}
        onToggleUnit={toggleUnit}
        onToggleSave={() =>
          data &&
          toggleSaveLocation(
            data.city,
            data.country,
            data.state,
            data.lat,
            data.lon
          )
        }
        onSelectSavedIndex={selectSavedLocation}
        onSelectSavedCity={(loc) => {
          if (loc.lat !== undefined && loc.lon !== undefined) {
            searchCity(loc.name, { lat: loc.lat, lon: loc.lon }, loc.state, loc.country);
          } else {
            searchCity(loc.name, undefined, loc.state, loc.country);
          }
        }}
        onRemoveSavedCity={removeSavedLocation}
      />

      <ApiKeyBanner
        needsApiKey={needsApiKey}
        hasServerKey={hasServerKey}
        onSaveKey={setUserApiKey}
      />
    </main>
  );
}
