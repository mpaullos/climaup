import type { Request, Response } from 'express';


const DEMO_REFERENCE_DATA: Record<string, any> = {
  'simão dias': {
    id: 3447953,
    name: 'Simão Dias',
    state: 'Sergipe',
    sys: { country: 'BR' },
    coord: { lat: -10.7381, lon: -37.8108 },
    main: {
      temp: 28,
      feels_like: 30,
      temp_min: 22,
      temp_max: 31,
      pressure: 1013,
      humidity: 65,
    },
    wind: { speed: 3.89, deg: 100 },
    clouds: { all: 30 },
    visibility: 10000,
    weather: [
      {
        id: 802,
        main: 'Clouds',
        description: 'Parcialmente nublado',
        icon: '02d',
      },
    ],
    dt: Math.floor(Date.now() / 1000),
    timezone: -10800,
    cod: 200,
    isSample: true,
  },
  lagarto: {
    id: 3459146,
    name: 'Lagarto',
    state: 'Sergipe',
    sys: { country: 'BR' },
    coord: { lat: -10.9169, lon: -37.65 },
    main: {
      temp: 29,
      feels_like: 31,
      temp_min: 23,
      temp_max: 32,
      pressure: 1012,
      humidity: 62,
    },
    wind: { speed: 3.61, deg: 120 },
    clouds: { all: 20 },
    visibility: 10000,
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'Céu limpo',
        icon: '01d',
      },
    ],
    dt: Math.floor(Date.now() / 1000),
    timezone: -10800,
    cod: 200,
    isSample: true,
  },
  'poço verde': {
    id: 3453733,
    name: 'Poço Verde',
    state: 'Sergipe',
    sys: { country: 'BR' },
    coord: { lat: -10.7078, lon: -38.1822 },
    main: {
      temp: 30,
      feels_like: 32,
      temp_min: 23,
      temp_max: 33,
      pressure: 1011,
      humidity: 55,
    },
    wind: { speed: 4.44, deg: 90 },
    clouds: { all: 15 },
    visibility: 10000,
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'Ensolarado',
        icon: '01d',
      },
    ],
    dt: Math.floor(Date.now() / 1000),
    timezone: -10800,
    cod: 200,
    isSample: true,
  },
  aracaju: {
    id: 3471872,
    name: 'Aracaju',
    state: 'Sergipe',
    sys: { country: 'BR' },
    coord: { lat: -10.9111, lon: -37.0717 },
    main: {
      temp: 27,
      feels_like: 29,
      temp_min: 24,
      temp_max: 29,
      pressure: 1014,
      humidity: 78,
    },
    wind: { speed: 5.28, deg: 130 },
    clouds: { all: 45 },
    visibility: 10000,
    weather: [
      {
        id: 802,
        main: 'Clouds',
        description: 'Parcialmente nublado',
        icon: '02d',
      },
    ],
    dt: Math.floor(Date.now() / 1000),
    timezone: -10800,
    cod: 200,
    isSample: true,
  },
  salvador: {
    id: 3450554,
    name: 'Salvador',
    state: 'Bahia',
    sys: { country: 'BR' },
    coord: { lat: -12.9777, lon: -38.5016 },
    main: {
      temp: 28,
      feels_like: 30,
      temp_min: 24,
      temp_max: 30,
      pressure: 1013,
      humidity: 72,
    },
    wind: { speed: 4.17, deg: 110 },
    clouds: { all: 35 },
    visibility: 10000,
    weather: [
      {
        id: 802,
        main: 'Clouds',
        description: 'Parcialmente nublado',
        icon: '02d',
      },
    ],
    dt: Math.floor(Date.now() / 1000),
    timezone: -10800,
    cod: 200,
    isSample: true,
  },
  pondicherry: {
    id: 1259424,
    name: 'Pondicherry',
    sys: { country: 'IN' },
    main: {
      temp: 20,
      feels_like: 18,
      temp_min: 19,
      temp_max: 23,
      pressure: 1012,
      humidity: 78,
    },
    wind: { speed: 1.11, deg: 225 }, // 1.11 m/s ≈ 4 km/h
    clouds: { all: 70 },
    visibility: 3000,
    weather: [
      {
        id: 521,
        main: 'Rain',
        description: 'Chuvoso',
        icon: '10d',
      },
    ],
    dt: Math.floor(Date.now() / 1000),
    timezone: 19800,
    cod: 200,
    isSample: true,
  },
};

// Aliases para Sergipe e Bahia
DEMO_REFERENCE_DATA['aracaju, se'] = DEMO_REFERENCE_DATA['aracaju'];
DEMO_REFERENCE_DATA['aracaju se'] = DEMO_REFERENCE_DATA['aracaju'];
DEMO_REFERENCE_DATA['aracaju, sergipe'] = DEMO_REFERENCE_DATA['aracaju'];
DEMO_REFERENCE_DATA['aracaju sergipe'] = DEMO_REFERENCE_DATA['aracaju'];
DEMO_REFERENCE_DATA['sergipe'] = DEMO_REFERENCE_DATA['aracaju'];
DEMO_REFERENCE_DATA['bahia'] = DEMO_REFERENCE_DATA['salvador'];
DEMO_REFERENCE_DATA['salvador, ba'] = DEMO_REFERENCE_DATA['salvador'];
DEMO_REFERENCE_DATA['salvador ba'] = DEMO_REFERENCE_DATA['salvador'];
DEMO_REFERENCE_DATA['salvador, bahia'] = DEMO_REFERENCE_DATA['salvador'];
DEMO_REFERENCE_DATA['simao dias'] = DEMO_REFERENCE_DATA['simão dias'];
DEMO_REFERENCE_DATA['simao dias, se'] = DEMO_REFERENCE_DATA['simão dias'];
DEMO_REFERENCE_DATA['simão dias, se'] = DEMO_REFERENCE_DATA['simão dias'];
DEMO_REFERENCE_DATA['poco verde'] = DEMO_REFERENCE_DATA['poço verde'];
DEMO_REFERENCE_DATA['poco verde, se'] = DEMO_REFERENCE_DATA['poço verde'];
DEMO_REFERENCE_DATA['poço verde, se'] = DEMO_REFERENCE_DATA['poço verde'];
DEMO_REFERENCE_DATA['lagarto, se'] = DEMO_REFERENCE_DATA['lagarto'];
DEMO_REFERENCE_DATA['lagarto se'] = DEMO_REFERENCE_DATA['lagarto'];

function normalizeQueryCity(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return '';

  // Caso com vírgula: "Aracaju, SE" -> "Aracaju,SE,BR"
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    if (parts.length === 2) {
      const stateLower = parts[1].toLowerCase();
      if (stateLower === 'se' || stateLower === 'sergipe') return `${parts[0]},SE,BR`;
      if (stateLower === 'ba' || stateLower === 'bahia') return `${parts[0]},BA,BR`;
      if (stateLower === 'rj' || stateLower === 'rio de janeiro') return `${parts[0]},RJ,BR`;
      if (stateLower === 'sp' || stateLower === 'são paulo' || stateLower === 'sao paulo') return `${parts[0]},SP,BR`;
      if (stateLower === 'mg' || stateLower === 'minas gerais') return `${parts[0]},MG,BR`;
      if (stateLower === 'pr' || stateLower === 'paraná' || stateLower === 'parana') return `${parts[0]},PR,BR`;
      if (stateLower === 'rs' || stateLower === 'rio grande do sul') return `${parts[0]},RS,BR`;
      if (stateLower === 'brasil' || stateLower === 'brazil' || stateLower === 'br') return `${parts[0]},BR`;
    }
    return trimmed;
  }

  // Caso sem vírgula: "Aracaju SE", "Aracaju Sergipe"
  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 2) {
    const last = tokens[tokens.length - 1].toLowerCase();
    const city = tokens.slice(0, tokens.length - 1).join(' ');
    if (last === 'se' || last === 'sergipe') return `${city},SE,BR`;
    if (last === 'ba' || last === 'bahia') return `${city},BA,BR`;
    if (last === 'rj' || last === 'rio') return `${city},RJ,BR`;
    if (last === 'sp' || last === 'são' || last === 'sao') return `${city},SP,BR`;
    if (last === 'mg' || last === 'minas') return `${city},MG,BR`;
  }

  return trimmed;
}

export async function weatherHandler(req: Request, res: Response) {
  try {
    const q = (req.query.q as string)?.trim();
    const lat = req.query.lat as string;
    const lon = req.query.lon as string;
    const units = (req.query.units as string) || 'metric';
    const lang = (req.query.lang as string) || 'pt_br';

    // Prioriza variável de ambiente protegida no servidor
    const apiKey =
      process.env.OPENWEATHER_API_KEY ||
      (req.headers['x-api-key'] as string) ||
      '';

    if (!q && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Informe o nome de uma cidade (parâmetro q) ou coordenadas (lat, lon).',
      });
    }

    // Se nenhuma chave de API foi fornecida pelo servidor nem pelo cliente:
    if (!apiKey || apiKey === 'SUA_CHAVE_OPENWEATHERMAP') {
      // Suporte a coordenadas para cidades de demonstração em Sergipe
      if (lat && lon) {
        const numLat = parseFloat(lat);
        const numLon = parseFloat(lon);
        for (const cityKey of ['aracaju', 'simão dias', 'lagarto', 'poço verde']) {
          const item = DEMO_REFERENCE_DATA[cityKey];
          if (
            item &&
            item.coord &&
            Math.abs(numLat - item.coord.lat) < 0.3 &&
            Math.abs(numLon - item.coord.lon) < 0.3
          ) {
            return res.status(200).json({
              ...item,
              dt: Math.floor(Date.now() / 1000),
              needsApiKey: true,
            });
          }
        }
      }

      // Se a consulta corresponder a uma das cidades dos screenshots ou demonstração:
      if (q) {
        const lowerQ = q.toLowerCase();
        const demoCity = Object.keys(DEMO_REFERENCE_DATA).find(
          (k) => lowerQ === k || lowerQ.includes(k)
        );

        if (demoCity) {
          return res.status(200).json({
            ...DEMO_REFERENCE_DATA[demoCity],
            dt: Math.floor(Date.now() / 1000),
            needsApiKey: true,
          });
        }
      }

      return res.status(503).json({
        error:
          'Chave OPENWEATHER_API_KEY não configurada no servidor. Configure sua chave no arquivo .env para buscar dados ao vivo de qualquer cidade.',
        needsApiKey: true,
      });
    }

    // Normaliza query
    const finalQ = q ? normalizeQueryCity(q) : '';

    // Monta a URL para o OpenWeatherMap
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    if (lat && lon) {
      url.searchParams.set('lat', lat);
      url.searchParams.set('lon', lon);
    } else if (finalQ) {
      url.searchParams.set('q', finalQ);
    }
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', units);
    url.searchParams.set('lang', lang);

    const apiResponse = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      if (apiResponse.status === 404) {
        return res.status(404).json({
          error: `Cidade "${q || 'solicitada'}" não encontrada. Verifique o nome e tente novamente.`,
        });
      }
      if (apiResponse.status === 401) {
        return res.status(401).json({
          error:
            'Chave da API OpenWeatherMap inválida ou ainda em processo de ativação (chaves recém-criadas podem levar até 30 minutos).',
        });
      }
      if (apiResponse.status === 429) {
        return res.status(429).json({
          error: 'Limite de requisições do OpenWeatherMap atingido. Aguarde alguns instantes.',
        });
      }
      return res.status(apiResponse.status).json({
        error: data.message || 'Erro ao consultar a API do OpenWeatherMap.',
      });
    }

    // Preserva o estado e nome de cidade passados pela seleção explícita
    if (req.query.state && typeof req.query.state === 'string') {
      data.state = req.query.state;
    }
    if (req.query.city && typeof req.query.city === 'string') {
      data.name = req.query.city;
    }
    if (req.query.country && typeof req.query.country === 'string') {
      data.sys = data.sys || {};
      data.sys.country = req.query.country;
    }

    // Retorna os dados sanitizados
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Erro no endpoint de clima:', err);
    return res.status(500).json({
      error: 'Erro interno ao processar a requisição de clima.',
    });
  }
}

// Export default para compatibilidade direta com rotas de API do Vercel Serverless
export default weatherHandler;
