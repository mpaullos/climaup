import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2, Trash2, Compass } from 'lucide-react';
import type { SavedLocation, GeoLocation } from '../../types/weather';
import { searchCityGeo } from '../../services/weatherService';

interface CitySearchProps {
  onSearch: (city: string, coords?: { lat: number; lon: number }, state?: string, country?: string) => void;
  onGeolocation: () => void;
  savedLocations: SavedLocation[];
  onSelectSaved: (loc: SavedLocation) => void;
  onRemoveSaved?: (city: string) => void;
  isLoading: boolean;
  activeCity?: string;
  activeState?: string;
  userApiKey?: string;
}

function filterDuplicateLocations(list: GeoLocation[]): GeoLocation[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const output: GeoLocation[] = [];

  for (const item of list) {
    const normName = (item.name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    const normState = (item.state || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    const normCountry = (item.country || '').trim().toUpperCase();

    const key = `${normName}|${normState}|${normCountry}`;
    const isNearby = output.some(
      (o) =>
        (o.name || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase() === normName &&
        o.country.toUpperCase() === normCountry &&
        Math.abs(o.lat - item.lat) < 0.2 &&
        Math.abs(o.lon - item.lon) < 0.2
    );

    if (!seen.has(key) && !isNearby) {
      seen.add(key);
      output.push(item);
    }
  }
  return output;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onSearch,
  onGeolocation,
  savedLocations,
  onSelectSaved,
  onRemoveSaved,
  isLoading,
  activeCity = '',
  activeState = '',
  userApiKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [disambiguationList, setDisambiguationList] = useState<GeoLocation[] | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Busca sugestões em tempo real com debounce de 250ms conforme o usuário digita
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearchingGeo(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearchingGeo(true);
      try {
        const results = await searchCityGeo(trimmed, userApiKey, controller.signal);
        setSuggestions(filterDuplicateLocations(results));
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingGeo(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, userApiKey]);

  const handleSelectLocation = (loc: GeoLocation) => {
    // Busca pelas coordenadas exatas da cidade selecionada
    onSearch(loc.name, { lat: loc.lat, lon: loc.lon }, loc.state, loc.country);
    setSearchTerm('');
    setSuggestions([]);
    setDisambiguationList(null);
    setIsSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    // Se já existem sugestões carregadas e o usuário apertou Enter
    if (suggestions.length === 1) {
      handleSelectLocation(suggestions[0]);
      return;
    }

    if (suggestions.length > 1) {
      // Se a consulta do usuário já contém a sigla ou nome do estado (ex: "Aracaju SE" ou "Aracaju, SE")
      const lowerQuery = query.toLowerCase();
      const directStateMatch = suggestions.find((s) => {
        const sState = (s.state || '').toLowerCase();
        if (!sState) return false;
        return (
          (lowerQuery.includes('se') && (sState === 'sergipe' || sState === 'se')) ||
          (lowerQuery.includes('ba') && (sState === 'bahia' || sState === 'ba')) ||
          (lowerQuery.includes('rj') && (sState.includes('rio') || sState === 'rj')) ||
          (lowerQuery.includes('sp') && (sState.includes('são paulo') || sState === 'sp')) ||
          (lowerQuery.includes('mg') && (sState.includes('minas') || sState === 'mg')) ||
          lowerQuery.includes(sState)
        );
      });

      if (directStateMatch) {
        handleSelectLocation(directStateMatch);
        return;
      }

      // Exibe painel de desambiguação para escolher qual local específico
      setDisambiguationList(filterDuplicateLocations(suggestions));
      return;
    }

    // Busca rápida de geocoding para checar homônimos
    setIsSearchingGeo(true);
    try {
      const geoResults = await searchCityGeo(query, userApiKey);
      const uniqueGeo = filterDuplicateLocations(geoResults);
      if (uniqueGeo.length > 1) {
        // Encontrou múltiplos locais homônimos
        setDisambiguationList(uniqueGeo);
        setIsSearchingGeo(false);
        return;
      } else if (uniqueGeo.length === 1) {
        handleSelectLocation(uniqueGeo[0]);
        setIsSearchingGeo(false);
        return;
      }
    } catch {
      // fallback
    } finally {
      setIsSearchingGeo(false);
    }

    // Caso não encontre múltiplos ou a consulta já seja específica (ex: "Aracaju, SE")
    onSearch(query);
    setSearchTerm('');
    setSuggestions([]);
    setDisambiguationList(null);
    setIsSearchOpen(false);
  };

  return (
    <div className="w-full flex flex-col relative">
      {/* Barra de Busca e Ações Rápidas */}
      <div className="relative flex items-center justify-between gap-2 mb-4">
        <form
          onSubmit={handleSubmit}
          className={`flex-1 transition-all duration-300 ease-out flex items-center relative ${
            isSearchOpen
              ? 'bg-white/10 border border-white/20 rounded-full px-4 py-2'
              : 'bg-transparent'
          }`}
        >
          {isSearchOpen ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: Aracaju, SE ou Paris..."
                className="w-full bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
                aria-label="Buscar cidade por nome"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSuggestions([]);
                    setDisambiguationList(null);
                  }}
                  className="p-1 text-white/60 hover:text-white transition-colors"
                  aria-label="Limpar texto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || isSearchingGeo || !searchTerm.trim()}
                className="ml-2 text-white/80 hover:text-white disabled:opacity-40 transition-colors"
                aria-label="Confirmar busca"
              >
                {isLoading || isSearchingGeo ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </>
          ) : (
            <span className="text-xs font-light text-white/60">
              Digite uma cidade ou escolha abaixo
            </span>
          )}
        </form>

        <div className="flex items-center gap-2">
          {/* Botão de Localização do Usuário */}
          <button
            type="button"
            onClick={onGeolocation}
            title="Usar minha localização atual (GPS)"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
            aria-label="Obter clima da localização atual"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Botão de Lupa 2 */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) {
                setSuggestions([]);
                setDisambiguationList(null);
              }
            }}
            title={isSearchOpen ? 'Fechar busca' : 'Abrir busca de cidades'}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all active:scale-95 shadow-sm"
            aria-label="Alternar campo de busca"
          >
            {isSearchOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown de Autocompletar / Sugestões em Tempo Real */}
      {isSearchOpen && suggestions.length > 0 && !disambiguationList && (
        <div className="absolute top-14 left-0 right-12 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-white/5 animate-in fade-in duration-200">
          <div className="px-3 py-1.5 text-[11px] font-medium text-white/50 uppercase tracking-wider flex items-center justify-between">
            <span>Sugestões Encontradas</span>
            <span className="text-white/40">Selecione o local exato</span>
          </div>

          {suggestions.map((loc, idx) => (
            <button
              key={`${loc.name}-${loc.lat}-${loc.lon}-${idx}`}
              type="button"
              onClick={() => handleSelectLocation(loc)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                    {loc.name}
                  </span>
                  {loc.state && (
                    <span className="text-xs text-white/75 font-normal">
                      • {loc.state}
                    </span>
                  )}
                  {loc.flag && <span className="text-xs">{loc.flag}</span>}
                </div>
                <span className="text-[11px] text-white/50">
                  {loc.countryName || loc.country}
                </span>
              </div>
              <Compass className="w-3.5 h-3.5 text-white/30 group-hover:text-amber-300 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Painel de Desambiguação (Caso o usuário digite uma cidade com múltiplos homônimos) */}
      {disambiguationList && disambiguationList.length > 1 && (
        <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-2xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-200">
              Múltiplos locais encontrados para "{searchTerm || 'sua busca'}":
            </span>
            <button
              type="button"
              onClick={() => setDisambiguationList(null)}
              className="text-white/50 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-white/70 mb-2.5">
            Selecione qual cidade você deseja consultar para evitar confusão entre cidades homônimas:
          </p>
          <div className="space-y-1.5">
            {disambiguationList.map((loc, idx) => (
              <button
                key={`disambig-${loc.name}-${loc.lat}-${idx}`}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className="w-full text-left px-3 py-2 rounded-lg bg-black/30 hover:bg-white/15 border border-white/10 hover:border-amber-300/40 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">
                    {loc.name}
                  </span>
                  {loc.state && (
                    <span className="text-amber-300 ml-1.5 font-medium">
                      ({loc.state})
                    </span>
                  )}
                  <span className="text-white/60 ml-1.5">
                    — {loc.countryName || loc.country} {loc.flag}
                  </span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dica de busca para cidades brasileiras */}
      {isSearchOpen && (
        <p className="text-[11px] text-white/45 mb-4 px-1 leading-relaxed">
          💡 <span className="font-medium text-white/60">Dica:</span> Você pode digitar a sigla do estado para cidades brasileiras (ex: <span className="text-amber-300 font-mono">Aracaju, SE</span> ou <span className="text-amber-300 font-mono">Simão Dias, SE</span>).
        </p>
      )}

      {/* Seção Cidades Salvas  */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-light text-white/60 tracking-wider">
            Locais salvos
          </span>
          <span className="text-[11px] text-white/40">
            {savedLocations.length} cidades
          </span>
        </div>

        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {savedLocations.map((loc) => {
            const isNameMatch =
              loc.name.toLowerCase() === activeCity.toLowerCase();
            const isStateMatch =
              !loc.state ||
              !activeState ||
              loc.state.toLowerCase() === activeState.toLowerCase();
            const isActive = isNameMatch && isStateMatch;

            return (
              <div
                key={loc.id || `${loc.name}-${loc.state}`}
                className={`group flex items-center justify-between py-2 px-2.5 rounded-lg transition-all text-sm cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => onSelectSaved(loc)}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate">{loc.name}</span>
                  {loc.state && (
                    <span className="text-[11px] text-amber-300/80 shrink-0">
                      • {loc.state}
                    </span>
                  )}
                  {loc.country && (
                    <span className="text-[10px] text-white/50 uppercase shrink-0">
                      {loc.country}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {loc.temp !== undefined && (
                    <span className="text-xs tabular-nums text-white/80">
                      {loc.temp}°
                    </span>
                  )}
                  {onRemoveSaved && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSaved(loc.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-300 transition-opacity"
                      aria-label={`Remover ${loc.name} dos favoritos`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
