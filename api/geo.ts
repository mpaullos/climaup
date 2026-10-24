import type { Request, Response } from 'express';

// Mapeamento de códigos de países para nomes em português e bandeiras
export const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  BR: { name: 'Brasil', flag: '🇧🇷' },
  FR: { name: 'França', flag: '🇫🇷' },
  PT: { name: 'Portugal', flag: '🇵🇹' },
  US: { name: 'Estados Unidos', flag: '🇺🇸' },
  ES: { name: 'Espanha', flag: '🇪🇸' },
  IT: { name: 'Itália', flag: '🇮🇹' },
  DE: { name: 'Alemanha', flag: '🇩🇪' },
  GB: { name: 'Reino Unido', flag: '🇬🇧' },
  IN: { name: 'Índia', flag: '🇮🇳' },
  LV: { name: 'Letônia', flag: '🇱🇻' },
  AR: { name: 'Argentina', flag: '🇦🇷' },
  UY: { name: 'Uruguai', flag: '🇺🇾' },
  CL: { name: 'Chile', flag: '🇨🇱' },
  CO: { name: 'Colômbia', flag: '🇨🇴' },
  MX: { name: 'México', flag: '🇲🇽' },
  CA: { name: 'Canadá', flag: '🇨🇦' },
  JP: { name: 'Japão', flag: '🇯🇵' },
  AU: { name: 'Austrália', flag: '🇦🇺' },
};

// Siglas e nomes de estados do Brasil para normalização de buscas
export const BRAZIL_STATES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

// Base de dados para sugestões imediatas e autocompletar de alta precisão
const DEMO_GEO_SUGGESTIONS = [
  {
    name: 'Aracaju',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.9111,
    lon: -37.0717,
  },
  {
    name: 'Simão Dias',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.7381,
    lon: -37.8108,
  },
  {
    name: 'Lagarto',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.9169,
    lon: -37.65,
  },
  {
    name: 'Poço Verde',
    state: 'Sergipe',
    country: 'BR',
    lat: -10.7078,
    lon: -38.1822,
  },
  {
    name: 'Salvador',
    state: 'Bahia',
    country: 'BR',
    lat: -12.9777,
    lon: -38.5016,
  },
  {
    name: 'São Paulo',
    state: 'São Paulo',
    country: 'BR',
    lat: -23.5505,
    lon: -46.6333,
  },
  {
    name: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    country: 'BR',
    lat: -22.9068,
    lon: -43.1729,
  },
  {
    name: 'Belo Horizonte',
    state: 'Minas Gerais',
    country: 'BR',
    lat: -19.9167,
    lon: -43.9345,
  },
  {
    name: 'Curitiba',
    state: 'Paraná',
    country: 'BR',
    lat: -25.4284,
    lon: -49.2733,
  },
  {
    name: 'Pondicherry',
    state: 'Puducherry',
    country: 'IN',
    lat: 11.9416,
    lon: 79.8083,
  },
];

// Helper para normalizar strings (remover acentos e minúsculas)
function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extrai nome da cidade e estado caso o usuário digite "Aracaju SE", "Aracaju, SE", "Aracaju Sergipe"
 */
function parseCityAndState(query: string): { cityName: string; stateUF?: string; stateName?: string } {
  const trimmed = query.trim();

  // Caso com vírgula: "Aracaju, SE" ou "Aracaju, Sergipe"
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    const city = parts[0];
    const rest = normalizeText(parts[1]);

    for (const [uf, name] of Object.entries(BRAZIL_STATES)) {
      if (normalizeText(uf) === rest || normalizeText(name) === rest) {
        return { cityName: city, stateUF: uf, stateName: name };
      }
    }
    return { cityName: city };
  }

  // Caso sem vírgula mas com espaço no final: "Aracaju SE", "Aracaju Sergipe"
  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 2) {
    const lastToken = normalizeText(tokens[tokens.length - 1]);
    const secondLastToken = tokens.length >= 3 ? normalizeText(tokens[tokens.length - 2]) : '';

    // Checa estados compostos como "Rio de Janeiro", "Mato Grosso"
    if (secondLastToken && (secondLastToken === 'rio' || secondLastToken === 'mato' || secondLastToken === 'santa' || secondLastToken === 'espirito' || secondLastToken === 'distrito')) {
      const compositeState = `${secondLastToken} ${lastToken}`;
      for (const [uf, name] of Object.entries(BRAZIL_STATES)) {
        if (normalizeText(name).includes(compositeState)) {
          const city = tokens.slice(0, tokens.length - 2).join(' ');
          return { cityName: city, stateUF: uf, stateName: name };
        }
      }
    }

    // Checa estado no último token
    for (const [uf, name] of Object.entries(BRAZIL_STATES)) {
      if (normalizeText(uf) === lastToken || normalizeText(name) === lastToken) {
        const city = tokens.slice(0, tokens.length - 1).join(' ');
        return { cityName: city, stateUF: uf, stateName: name };
      }
    }
  }

  return { cityName: trimmed };
}

export async function geoHandler(req: Request, res: Response) {
  try {
    const rawQuery = (req.query.q as string)?.trim() || '';
    const limit = Math.min(parseInt((req.query.limit as string) || '6', 10), 10);

    if (!rawQuery || rawQuery.length < 2) {
      return res.json([]);
    }

    const apiKey =
      process.env.OPENWEATHER_API_KEY ||
      (req.headers['x-api-key'] as string) ||
      '';

    const parsed = parseCityAndState(rawQuery);
    const normRawQuery = normalizeText(rawQuery);
    const normCityName = normalizeText(parsed.cityName);

    // Se nenhuma chave estiver configurada ou for de exemplo
    if (!apiKey || apiKey === 'SUA_CHAVE_OPENWEATHERMAP') {
      const matched = DEMO_GEO_SUGGESTIONS.filter((item) => {
        const itemNormName = normalizeText(item.name);
        const itemNormState = normalizeText(item.state || '');

        // Se o usuário especificou estado (ex: "Simão Dias SE", "Aracaju Sergipe")
        if (parsed.stateUF) {
          const stateMatches =
            itemNormState === normalizeText(parsed.stateName || '') ||
            itemNormState === normalizeText(parsed.stateUF);
          const nameMatches = itemNormName.includes(normCityName);
          return nameMatches && stateMatches;
        }

        // Se buscou pelo nome da cidade
        const nameMatch = itemNormName.startsWith(normRawQuery) || itemNormName.includes(normRawQuery);
        if (nameMatch) return true;

        // Se a busca inteira for o nome/sigla de um estado brasileiro (ex: "Sergipe", "SE", "Bahia", "BA")
        const isPureStateQuery = Object.entries(BRAZIL_STATES).some(
          ([uf, name]) => normalizeText(uf) === normRawQuery || normalizeText(name) === normRawQuery
        );
        if (isPureStateQuery && itemNormState === normRawQuery) {
          return true;
        }

        return false;
      });

      // Ordena com prioridade para cidades brasileiras quando a consulta for em português
      const sorted = sortLocationsByRelevance(matched, rawQuery, parsed);
      const formatted = sorted.map((loc) => formatSingleLocation(loc));
      return res.json(deduplicateLocations(formatted).slice(0, limit));
    }

    // Consulta à API oficial de Geocoding do OpenWeatherMap
    let queryToApi = rawQuery;
    if (parsed.stateUF && parsed.cityName) {
      queryToApi = `${parsed.cityName},${parsed.stateUF},BR`;
    }

    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.set('q', queryToApi);
    url.searchParams.set('limit', String(limit * 3));
    url.searchParams.set('appid', apiKey);

    const apiRes = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    let items: any[] = [];
    if (apiRes.ok) {
      items = await apiRes.json();
    }

    // Se a busca normalizada não retornar nada e for diferente da original, faz fallback
    if ((!items || items.length === 0) && queryToApi !== rawQuery) {
      url.searchParams.set('q', parsed.cityName || rawQuery);
      const fallbackRes = await fetch(url.toString());
      if (fallbackRes.ok) {
        items = await fallbackRes.json();
      }
    }

    // FILTRO ANTI-FALSOS POSITIVOS E HOMÔNIMOS INDEVIDOS:
    // 1. Simão Dias é exclusivamente um município em Sergipe (rejeita povoados ribeirinhos homônimos, ex: no Amazonas)
    // 2. Lagarto, Poço Verde e Aracaju pertencem exclusivamente a Sergipe
    // 3. Rejeita localidades cujo nome seja um estado brasileiro fora do estado correto
    items = items.filter((item) => {
      const itemCityNorm = normalizeText(item.local_names?.pt || item.name || '');
      const itemStateNorm = normalizeText(item.state || '');
      const itemCountry = (item.country || '').toUpperCase();

      if (itemCityNorm === 'simao dias' && itemStateNorm !== 'sergipe') {
        return false;
      }
      if (itemCityNorm === 'lagarto' && itemStateNorm !== 'sergipe') {
        return false;
      }
      if (itemCityNorm === 'poco verde' && itemStateNorm !== 'sergipe') {
        return false;
      }
      if (itemCityNorm === 'aracaju' && itemStateNorm !== 'sergipe') {
        return false;
      }

      // Rejeita localidades com nome de estado brasileiro em outro estado/país
      for (const [uf, stateName] of Object.entries(BRAZIL_STATES)) {
        const stateNorm = normalizeText(stateName);
        if (stateNorm === 'sao paulo' || stateNorm === 'rio de janeiro') continue;
        if (itemCityNorm === stateNorm && (itemCountry !== 'BR' || itemStateNorm !== stateNorm)) {
          return false;
        }
      }

      return true;
    });

    // Se ainda vazio ou consulta local, mescla também sugestões conhecidas de demonstração
    if (normCityName) {
      const localMatches = DEMO_GEO_SUGGESTIONS.filter((loc) =>
        normalizeText(loc.name).startsWith(normCityName)
      );
      items = [...items, ...localMatches];
    }

    const formattedResults = formatGeoResults(items);
    const sortedResults = sortLocationsByRelevance(formattedResults, rawQuery, parsed);
    const deduplicated = deduplicateLocations(sortedResults);

    return res.json(deduplicated.slice(0, limit));
  } catch (err: any) {
    console.error('Erro na rota de geocoding:', err);
    return res.status(500).json({ error: 'Erro ao buscar sugestões de cidades.' });
  }
}

function formatSingleLocation(loc: any) {
  const country = loc.country || '';
  const countryInfo = COUNTRY_NAMES[country] || {
    name: country,
    flag: '📍',
  };

  let state = loc.state || '';
  if (country === 'BR' && BRAZIL_STATES[state.toUpperCase()]) {
    state = BRAZIL_STATES[state.toUpperCase()];
  }

  const stateDisplay = state ? `${state} • ` : '';
  const cityName = loc.name;

  return {
    name: cityName,
    state: state || undefined,
    country,
    countryName: countryInfo.name,
    flag: countryInfo.flag,
    lat: loc.lat,
    lon: loc.lon,
    displayName: `${cityName}, ${stateDisplay}${countryInfo.name}`,
  };
}

/**
 * Ordena resultados priorizando:
 * 1. Correspondência exata de estado (ex: Sergipe quando digitou Aracaju SE)
 * 2. Correspondência exata do nome da cidade
 * 3. Cidades do Brasil (BR) para usuários de língua portuguesa
 * 4. Demais cidades estrangeiras
 */
function sortLocationsByRelevance(
  items: any[],
  rawQuery: string,
  parsed: { cityName: string; stateUF?: string; stateName?: string }
): any[] {
  const normQuery = normalizeText(rawQuery);
  const normCity = normalizeText(parsed.cityName);

  return [...items].sort((a, b) => {
    const aNormName = normalizeText(a.name || '');
    const bNormName = normalizeText(b.name || '');
    const aNormState = normalizeText(a.state || '');
    const bNormState = normalizeText(b.state || '');
    const aCountry = (a.country || '').toUpperCase();
    const bCountry = (b.country || '').toUpperCase();

    // Se o usuário especificou estado (ex: Sergipe / SE)
    if (parsed.stateUF || parsed.stateName) {
      const targetState = normalizeText(parsed.stateName || parsed.stateUF || '');
      const aStateMatch = aNormState === targetState || aNormState.includes(targetState);
      const bStateMatch = bNormState === targetState || bNormState.includes(targetState);
      if (aStateMatch && !bStateMatch) return -1;
      if (!aStateMatch && bStateMatch) return 1;
    }

    // Correspondência exata do nome
    const aExactName = aNormName === normCity || (a.name || '').toLowerCase() === rawQuery.toLowerCase();
    const bExactName = bNormName === normCity || (b.name || '').toLowerCase() === rawQuery.toLowerCase();
    if (aExactName && !bExactName) return -1;
    if (!aExactName && bExactName) return 1;

    // Prioridade para Brasil (BR) em termos gerais em língua portuguesa
    if (aCountry === 'BR' && bCountry !== 'BR') return -1;
    if (aCountry !== 'BR' && bCountry === 'BR') return 1;

    // Se ambas são do Brasil e uma é Sergipe (estado em foco no aplicativo):
    if (aCountry === 'BR' && bCountry === 'BR') {
      if (aNormState === 'sergipe' && bNormState !== 'sergipe') return -1;
      if (aNormState !== 'sergipe' && bNormState === 'sergipe') return 1;
    }

    return 0;
  });
}

function deduplicateLocations(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  const seenKeys = new Set<string>();
  const result: any[] = [];

  for (const item of items) {
    const normName = normalizeText(item.name || '');
    const normState = normalizeText(item.state || '');
    const normCountry = (item.country || '').trim().toUpperCase();

    // Chave composta limpa
    const key = `${normName}|${normState}|${normCountry}`;

    // Verificação de coordenadas idênticas (menos de 20 km)
    const isNearbyDuplicate = result.some(
      (existing) =>
        normalizeText(existing.name) === normName &&
        existing.country.toUpperCase() === normCountry &&
        Math.abs(existing.lat - item.lat) < 0.2 &&
        Math.abs(existing.lon - item.lon) < 0.2
    );

    if (!seenKeys.has(key) && !isNearbyDuplicate) {
      seenKeys.add(key);
      result.push(item);
    }
  }

  return result;
}

function formatGeoResults(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const country = item.country || '';
    const countryInfo = COUNTRY_NAMES[country] || {
      name: country,
      flag: '📍',
    };

    let state = item.state || '';
    // Normaliza estado do Brasil se estiver em sigla
    if (country === 'BR' && BRAZIL_STATES[state.toUpperCase()]) {
      state = BRAZIL_STATES[state.toUpperCase()];
    }

    const stateDisplay = state ? `${state} • ` : '';

    // Para cidades do Brasil usa o nome em português; para estrangeiras usa o nome local da cidade
    const cityName =
      country === 'BR' ? item.local_names?.pt || item.name : item.name;

    return {
      name: cityName,
      localNames: item.local_names,
      state: state || undefined,
      country,
      countryName: countryInfo.name,
      flag: countryInfo.flag,
      lat: item.lat,
      lon: item.lon,
      displayName: `${cityName}, ${stateDisplay}${countryInfo.name}`,
    };
  });
}

export default geoHandler;
