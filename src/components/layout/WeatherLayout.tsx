import React, { useState } from 'react';
import { Menu, RefreshCw, AlertTriangle, Star, Calendar, SlidersHorizontal, Droplets } from 'lucide-react';
import type { WeatherData, TemperatureUnit, SavedLocation } from '../../types/weather';
import { getWeatherTheme } from '../../utils/getWeatherTheme';
import { formatTemp } from '../../utils/formatWeather';
import { CurrentWeather } from '../weather/CurrentWeather';
import { WeatherDetails } from '../weather/WeatherDetails';
import { ForecastList } from '../weather/ForecastList';
import { WeatherIcon } from '../weather/WeatherIcon';
import { CitySearch } from '../search/CitySearch';
import { Drawer } from '../ui/Drawer';

interface WeatherLayoutProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  unit: TemperatureUnit;
  savedLocations: SavedLocation[];
  activeLocationIndex: number;
  isSaved: boolean;
  userApiKey?: string;
  onSearch: (city: string, coords?: { lat: number; lon: number }, state?: string, country?: string) => void;
  onGeolocation: () => void;
  onRefresh: () => void;
  onToggleUnit: () => void;
  onToggleSave: () => void;
  onSelectSavedIndex: (index: number) => void;
  onSelectSavedCity: (loc: SavedLocation) => void;
  onRemoveSavedCity: (city: string) => void;
}

export const WeatherLayout: React.FC<WeatherLayoutProps> = ({
  weather,
  loading,
  error,
  unit,
  savedLocations,
  activeLocationIndex: _activeLocationIndex,
  isSaved,
  userApiKey,
  onSearch,
  onGeolocation,
  onRefresh,
  onToggleUnit,
  onToggleSave,
  onSelectSavedIndex,
  onSelectSavedCity,
  onRemoveSavedCity,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'details' | 'forecast'>('details');
  const [mobileTab, setMobileTab] = useState<'details' | 'forecast'>('details');

  // Calcula o tema visual com base nos dados do clima
  const theme = weather
    ? getWeatherTheme(weather.conditionId, weather.iconCode, weather.city)
    : getWeatherTheme(800, '01d', 'Pondicherry');

  return (
    <div className="relative min-h-screen md:h-screen md:max-h-screen md:overflow-hidden w-full flex flex-col justify-between select-none">
      {/* 1. Camada de Imagem de Fundo Dinâmica */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-105"
        style={{
          backgroundImage: `url(${theme.imageSrc})`,
          backgroundPosition: 'center center',
        }}
      />

      {/* 2. Camada Gradiente / Scrim para Contraste Superior */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{
          background: theme.overlayGradient,
        }}
      />

      {/* 3. Camada sutil de vinheta e textura */}
      <div className="fixed inset-0 z-0 bg-black/25 pointer-events-none" />

      {/* ============================================================== */}
      {/* VISTA DESKTOP  */}
      {/* ============================================================== */}
      <div className="relative z-10 hidden md:flex flex-1 h-full max-h-screen overflow-hidden">
        {/* Lado Esquerdo: Área Hero Fotográfica com Clima Principal */}
        <div className="flex-1 flex flex-col justify-between p-6 lg:p-8 xl:p-10 h-full overflow-hidden">
          {/* Marca Clima. no canto superior esquerdo */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight text-white drop-shadow">
                Clima.
              </span>
              {weather?.isMockOrSample && (
                <span className="text-[10px] uppercase tracking-wider text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Demonstração
                </span>
              )}
            </div>

            {/* Ações auxiliares do topo */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSave}
                title={isSaved ? 'Remover dos favoritos' : 'Salvar cidade nos favoritos'}
                className={`p-2 rounded-full border transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/10 border-white/15 text-white/70 hover:text-white hover:bg-white/20'
                }`}
                aria-label="Favoritar cidade"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={onToggleUnit}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition-all"
                aria-label="Alternar unidade de temperatura"
              >
                {unit === 'celsius' ? '°C' : '°F'}
              </button>

              <button
                onClick={onRefresh}
                disabled={loading}
                title="Atualizar clima"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition-all disabled:opacity-50"
                aria-label="Atualizar dados"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </header>

          {/* Mensagem de Erro se houver */}
          {error && (
            <div className="my-auto max-w-md bg-red-950/80 border border-red-500/30 backdrop-blur-md text-red-200 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Atenção</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Clima Atual e Faixa Compacta de Previsão no Rodapé Esquerdo */}
          {weather && !error && (
            <div className="mt-auto flex flex-col gap-3 pt-4">
              <CurrentWeather
                data={weather}
                unit={unit}
                variant="desktop"
              />

              {/* Faixa Minimalista de Previsão dos Próximos 5 Dias */}
              {weather.forecast && weather.forecast.length > 0 && (
                <div className="w-full pt-3 mt-1 border-t border-white/10 max-w-3xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 tracking-wide">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>Previsão para 5 dias</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-light">
                      Clique no dia para detalhes
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 lg:gap-2.5 w-full">
                    {weather.forecast.slice(0, 5).map((day) => {
                      const isTomorrow = day.isTomorrow || day.dayName === 'Amanhã';
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSidebarTab('forecast')}
                          className="flex flex-col items-center justify-between py-2 px-1.5 rounded-xl bg-black/35 hover:bg-black/55 border border-white/10 hover:border-amber-300/40 backdrop-blur-md transition-all text-xs group cursor-pointer active:scale-95 shadow-sm text-center"
                          title={`${day.dayLong || day.dayName}: ${day.condition}`}
                        >
                          {/* Dia da semana */}
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-xs font-semibold text-white/95 group-hover:text-amber-300 transition-colors">
                              {day.dayShort}
                            </span>
                            {isTomorrow ? (
                              <span className="text-[9px] uppercase tracking-wider text-amber-300 font-medium">
                                Amanhã
                              </span>
                            ) : (
                              <span className="text-[9px] text-white/40 capitalize truncate max-w-[64px]">
                                {day.condition.split(' ')[0]}
                              </span>
                            )}
                          </div>

                          {/* Ícone do Clima */}
                          <div className="my-1">
                            <WeatherIcon
                              conditionId={day.conditionId}
                              iconCode={day.iconCode}
                              className="w-4 h-4 lg:w-5 lg:h-5 text-white group-hover:scale-110 transition-transform drop-shadow"
                            />
                          </div>

                          {/* Temperaturas Máx / Mín */}
                          <div className="flex items-center gap-1 font-medium tabular-nums text-xs">
                            <span className="text-white font-semibold">
                              {formatTemp(day.tempMax, unit)}
                            </span>
                            <span className="text-white/30 text-[10px]">/</span>
                            <span className="text-white/50 text-[11px] font-normal">
                              {formatTemp(day.tempMin, unit)}
                            </span>
                          </div>

                          {/* Probabilidade de chuva discreta se houver */}
                          {day.pop > 15 ? (
                            <span className="text-[9px] text-sky-300 font-medium flex items-center mt-0.5">
                              <Droplets className="w-2.5 h-2.5 mr-0.5 text-sky-300/90" />
                              {day.pop}%
                            </span>
                          ) : (
                            <span className="h-3.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lado Direito: Barra Lateral Translúcida (Search + Saved + Details) */}
        <aside
          aria-label="Painel de Busca e Detalhes"
          className="w-80 lg:w-96 xl:w-[420px] h-full max-h-screen bg-black/45 backdrop-blur-2xl border-l border-white/10 p-6 lg:p-7 flex flex-col justify-between overflow-y-auto shadow-2xl shrink-0 z-20"
        >
          <div className="space-y-5">
            {/* Campo de Busca de Cidades */}
            <CitySearch
              onSearch={onSearch}
              onGeolocation={onGeolocation}
              savedLocations={savedLocations}
              onSelectSaved={onSelectSavedCity}
              onRemoveSaved={onRemoveSavedCity}
              isLoading={loading}
              activeCity={weather?.city}
              activeState={weather?.state}
              userApiKey={userApiKey}
            />

            {/* Linha Divisória Sutil */}
            <div className="h-px w-full bg-white/10" />

            {/* Alternador de Visualização: Detalhes de Hoje vs Previsão 5 Dias */}
            {weather && (
              <div>
                <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl mb-4 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSidebarTab('details')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      sidebarTab === 'details'
                        ? 'bg-white/20 text-white shadow-sm font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Detalhes Hoje</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab('forecast')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      sidebarTab === 'forecast'
                        ? 'bg-white/20 text-white shadow-sm font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>Previsão 5 Dias</span>
                  </button>
                </div>

                {sidebarTab === 'details' ? (
                  <WeatherDetails
                    data={weather}
                    unit={unit}
                    variant="desktop"
                  />
                ) : (
                  <ForecastList
                    forecast={weather.forecast || []}
                    unit={unit}
                    variant="desktop"
                  />
                )}
              </div>
            )}
          </div>

          {/* Rodapé da Barra Lateral */}
          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>OpenWeatherMap API</span>
            <span className="capitalize">{theme.description}</span>
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* VISTA MOBILE */}
      {/* ============================================================== */}
      <div className="relative z-10 flex flex-col md:hidden min-h-screen justify-between p-5 sm:p-8 max-w-md mx-auto w-full">
        {/* Topo: Hambúrguer, Indicadores de Paginação de Cidades e Ações */}
        <header className="flex items-center justify-between w-full pt-1">
          {/* Botão Hambúrguer (Abre Drawer de Busca & Cidades) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-white/90 hover:text-white transition-colors"
            aria-label="Abrir menu de locais"
          >
            <Menu className="w-6 h-6 drop-shadow" />
          </button>

          {/* Indicador de Carrossel de Cidades Salvas  */}
          <div className="flex items-center gap-2">
            {savedLocations.slice(0, 3).map((loc, idx) => {
              const isActive =
                weather?.city.toLowerCase() === loc.name.toLowerCase();
              return (
                <button
                  key={loc.id || loc.name}
                  onClick={() => onSelectSavedIndex(idx)}
                  className={`transition-all rounded-full ${
                    isActive
                      ? 'w-2 h-2 bg-white shadow-sm'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para ${loc.name}`}
                />
              );
            })}
          </div>

          {/* Ações Rápidas: Alternar Unidade (°C / °F) e Atualizar */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleUnit}
              className="text-xs px-2 py-1 rounded bg-white/10 border border-white/15 text-white/90"
              aria-label="Alternar unidade"
            >
              {unit === 'celsius' ? '°C' : '°F'}
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-white/80 hover:text-white"
              aria-label="Atualizar dados"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </header>

        {/* Mensagem de Erro se houver */}
        {error && (
          <div className="my-4 bg-red-950/80 border border-red-500/30 backdrop-blur-md text-red-200 p-3 rounded-xl flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Conteúdo Central: Temperatura Gigante e Informações da Cidade */}
        {weather && (
          <div className="my-auto py-4">
            <CurrentWeather
              data={weather}
              unit={unit}
              variant="mobile"
            />
          </div>
        )}

        {/* Painel Inferior: Weather details e Previsão com Glassmorphism  */}
        {weather && (
          <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl mb-2">
            <div className="flex items-center gap-1 p-0.5 bg-white/10 rounded-xl mb-3 border border-white/10">
              <button
                type="button"
                onClick={() => setMobileTab('details')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === 'details'
                    ? 'bg-white/20 text-white shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Hoje</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('forecast')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === 'forecast'
                    ? 'bg-white/20 text-white shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>Previsão 5 Dias</span>
              </button>
            </div>

            {mobileTab === 'details' ? (
              <WeatherDetails
                data={weather}
                unit={unit}
                variant="mobile"
              />
            ) : (
              <ForecastList
                forecast={weather.forecast || []}
                unit={unit}
                variant="mobile"
              />
            )}
          </div>
        )}
      </div>

      {/* Drawer Mobile para Busca e Locais */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="ClimaDot"
      >
        <CitySearch
          onSearch={(city, coords, state, country) => {
            onSearch(city, coords, state, country);
            setIsMobileMenuOpen(false);
          }}
          onGeolocation={() => {
            onGeolocation();
            setIsMobileMenuOpen(false);
          }}
          savedLocations={savedLocations}
          onSelectSaved={(loc) => {
            onSelectSavedCity(loc);
            setIsMobileMenuOpen(false);
          }}
          onRemoveSaved={onRemoveSavedCity}
          isLoading={loading}
          activeCity={weather?.city}
          activeState={weather?.state}
          userApiKey={userApiKey}
        />
      </Drawer>
    </div>
  );
};
