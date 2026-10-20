import type { Request, Response } from 'express';

const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_LONG = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface ForecastTemplate {
  tempMin: number;
  tempMax: number;
  condition: string;
  conditionMain: string;
  conditionId: number;
  iconCode: string;
  pop: number;
  humidity: number;
}

const TEMPLATES_BY_CITY: Record<string, ForecastTemplate[]> = {
  riga: [
    { tempMin: 3, tempMax: 7, condition: 'Chuva Leve', conditionMain: 'Rain', conditionId: 500, iconCode: '10d', pop: 70, humidity: 85 },
    { tempMin: 2, tempMax: 6, condition: 'Nublado', conditionMain: 'Clouds', conditionId: 804, iconCode: '04d', pop: 30, humidity: 75 },
    { tempMin: 1, tempMax: 5, condition: 'Chuva e Neve', conditionMain: 'Snow', conditionId: 615, iconCode: '13d', pop: 85, humidity: 88 },
    { tempMin: 0, tempMax: 4, condition: 'Nublado', conditionMain: 'Clouds', conditionId: 803, iconCode: '03d', pop: 20, humidity: 70 },
    { tempMin: 2, tempMax: 6, condition: 'Chuvoso', conditionMain: 'Rain', conditionId: 501, iconCode: '10d', pop: 60, humidity: 80 },
  ],
  liepaja: [
    { tempMin: 4, tempMax: 8, condition: 'Nublado', conditionMain: 'Clouds', conditionId: 804, iconCode: '04d', pop: 25, humidity: 70 },
    { tempMin: 3, tempMax: 7, condition: 'Céu Limpo', conditionMain: 'Clear', conditionId: 800, iconCode: '01d', pop: 10, humidity: 65 },
    { tempMin: 2, tempMax: 6, condition: 'Parcialmente Nublado', conditionMain: 'Clouds', conditionId: 802, iconCode: '02d', pop: 15, humidity: 68 },
    { tempMin: 4, tempMax: 9, condition: 'Chuva Leve', conditionMain: 'Rain', conditionId: 500, iconCode: '10d', pop: 50, humidity: 75 },
    { tempMin: 5, tempMax: 8, condition: 'Chuvoso', conditionMain: 'Rain', conditionId: 501, iconCode: '10d', pop: 75, humidity: 82 },
  ],
  default: [
    // Clima tropical para Sergipe / Brasil
    { tempMin: 23, tempMax: 29, condition: 'Parcialmente Nublado', conditionMain: 'Clouds', conditionId: 802, iconCode: '02d', pop: 25, humidity: 72 },
    { tempMin: 22, tempMax: 28, condition: 'Sol com Nuvens', conditionMain: 'Clouds', conditionId: 801, iconCode: '02d', pop: 20, humidity: 70 },
    { tempMin: 21, tempMax: 27, condition: 'Chuva Passageira', conditionMain: 'Rain', conditionId: 500, iconCode: '10d', pop: 55, humidity: 78 },
    { tempMin: 22, tempMax: 29, condition: 'Céu Limpo', conditionMain: 'Clear', conditionId: 800, iconCode: '01d', pop: 10, humidity: 65 },
    { tempMin: 23, tempMax: 30, condition: 'Ensolarado', conditionMain: 'Clear', conditionId: 800, iconCode: '01d', pop: 5, humidity: 62 },
  ],
};

/**
 * Gera previsão de 5 dias dinamicamente a partir do dia de amanhã relativo ao momento atual.
 * Garante que os dias sejam estritamente sequenciais (ex: se hoje é Segunda -> Terça (Amanhã), Quarta, Quinta, Sexta, Sábado).
 */
export function generateDynamicDemoForecast(cityName = '', timezoneOffsetSec = -10800) {
  const lowerCity = (cityName || '').toLowerCase();
  let templates = TEMPLATES_BY_CITY.default;
  if (lowerCity.includes('riga')) {
    templates = TEMPLATES_BY_CITY.riga;
  } else if (lowerCity.includes('liepaja')) {
    templates = TEMPLATES_BY_CITY.liepaja;
  }

  // Data e hora local na cidade hoje
  const nowMs = Date.now() + timezoneOffsetSec * 1000;
  const nowLocal = new Date(nowMs);

  const forecastDays = [];
  // Gera os próximos 5 dias a partir de amanhã (offset de 1 a 5 dias)
  for (let i = 1; i <= 5; i++) {
    const futureDate = new Date(nowLocal.getTime() + i * 24 * 60 * 60 * 1000);
    const y = futureDate.getUTCFullYear();
    const m = String(futureDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(futureDate.getUTCDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;
    const dayOfWeek = futureDate.getUTCDay();

    const isTomorrow = i === 1;
    const dayShort = DAY_NAMES_SHORT[dayOfWeek];
    const dayLong = DAY_NAMES_LONG[dayOfWeek];
    const dayName = isTomorrow ? 'Amanhã' : dayLong;

    const tpl = templates[(i - 1) % templates.length];

    forecastDays.push({
      date: dateKey,
      dayName,
      dayShort,
      dayLong,
      isTomorrow,
      tempMin: tpl.tempMin,
      tempMax: tpl.tempMax,
      condition: tpl.condition,
      conditionMain: tpl.conditionMain,
      conditionId: tpl.conditionId,
      iconCode: tpl.iconCode,
      pop: tpl.pop,
      humidity: tpl.humidity,
    });
  }

  return forecastDays;
}

/**
 * Agrupa os blocos de 3 horas do OpenWeatherMap em previsões diárias consolidadas (5 dias).
 * Leva em consideração o timezone exato do município para nunca pular dias nem confundir "hoje" com "amanhã".
 */
export function aggregateForecastToDays(rawList: any[], timezoneOffsetSec = 0) {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return generateDynamicDemoForecast('default', timezoneOffsetSec);
  }

  // Determina a data local de "hoje" no fuso da cidade
  const nowUtcSec = Math.floor(Date.now() / 1000);
  const cityNowMs = (nowUtcSec + timezoneOffsetSec) * 1000;
  const cityNowDate = new Date(cityNowMs);
  const todayYear = cityNowDate.getUTCFullYear();
  const todayMonth = String(cityNowDate.getUTCMonth() + 1).padStart(2, '0');
  const todayDay = String(cityNowDate.getUTCDate()).padStart(2, '0');
  const todayKey = `${todayYear}-${todayMonth}-${todayDay}`;

  // Agrupa os itens por data local
  const daysMap = new Map<string, any[]>();
  for (const item of rawList) {
    if (!item || !item.dt) continue;
    const itemLocalMs = (item.dt + timezoneOffsetSec) * 1000;
    const itemLocalDate = new Date(itemLocalMs);
    const y = itemLocalDate.getUTCFullYear();
    const m = String(itemLocalDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(itemLocalDate.getUTCDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, []);
    }
    daysMap.get(dateKey)!.push({
      ...item,
      localHour: itemLocalDate.getUTCHours(),
    });
  }

  // Filtra as datas estritamente posteriores a "hoje" (futuras)
  const allDateKeys = Array.from(daysMap.keys()).sort();
  let futureDateKeys = allDateKeys.filter((k) => k > todayKey);

  // Se por acaso a API não tiver datas > todayKey (ex: chamada no último dia do pacote), pega as datas seguintes
  if (futureDateKeys.length === 0 && allDateKeys.length > 1) {
    futureDateKeys = allDateKeys.slice(1);
  }

  const result: any[] = [];
  let dayIndex = 0;

  for (const dateStr of futureDateKeys.slice(0, 5)) {
    const items = daysMap.get(dateStr) || [];
    if (items.length === 0) continue;

    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let maxPop = 0;
    let totalHumidity = 0;

    // Prioriza o bloco por volta das 12h-15h local para ícone e condição representativa
    const middayItem =
      items.find((it) => it.localHour >= 11 && it.localHour <= 16) ||
      items[Math.floor(items.length / 2)] ||
      items[0];

    for (const it of items) {
      if (it.main) {
        if (typeof it.main.temp_min === 'number' && it.main.temp_min < minTemp) {
          minTemp = it.main.temp_min;
        }
        if (typeof it.main.temp_max === 'number' && it.main.temp_max > maxTemp) {
          maxTemp = it.main.temp_max;
        }
        if (typeof it.main.humidity === 'number') {
          totalHumidity += it.main.humidity;
        }
      }
      if (typeof it.pop === 'number' && it.pop > maxPop) {
        maxPop = it.pop;
      }
    }

    if (minTemp === Infinity) minTemp = middayItem.main?.temp ?? 20;
    if (maxTemp === -Infinity) maxTemp = middayItem.main?.temp ?? 25;

    // Calcula dia da semana baseado na data exata local
    const [yStr, mStr, dStr] = dateStr.split('-');
    const dateObj = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr), 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay();

    const isTomorrow = dayIndex === 0;
    const dayShort = DAY_NAMES_SHORT[dayOfWeek];
    const dayLong = DAY_NAMES_LONG[dayOfWeek];
    const dayName = isTomorrow ? 'Amanhã' : dayLong;

    const weatherCond = middayItem.weather?.[0] || {
      id: 800,
      main: 'Clear',
      description: 'Céu limpo',
      icon: '01d',
    };

    result.push({
      date: dateStr,
      dayName,
      dayShort,
      dayLong,
      isTomorrow,
      tempMin: Math.round(minTemp),
      tempMax: Math.round(maxTemp),
      condition: weatherCond.description || weatherCond.main,
      conditionMain: weatherCond.main,
      conditionId: weatherCond.id,
      iconCode: weatherCond.icon,
      pop: Math.round(maxPop * 100),
      humidity: Math.round(totalHumidity / (items.length || 1)),
    });

    dayIndex++;
  }

  // Se a API retornou menos de 5 dias futuros (ex: 4 dias), completa o 5º dia de forma suave e consistente
  while (result.length < 5 && result.length > 0) {
    const lastDay: any = result[result.length - 1];
    const parts: string[] = String(lastDay.date).split('-');
    const lastY = Number(parts[0]);
    const lastM = Number(parts[1]);
    const lastD = Number(parts[2]);
    const nextDateObj = new Date(Date.UTC(lastY, lastM - 1, lastD + 1, 12, 0, 0));
    const nextY = nextDateObj.getUTCFullYear();
    const nextM = String(nextDateObj.getUTCMonth() + 1).padStart(2, '0');
    const nextD = String(nextDateObj.getUTCDate()).padStart(2, '0');
    const nextDateKey = `${nextY}-${nextM}-${nextD}`;
    const nextDayOfWeek = nextDateObj.getUTCDay();

    result.push({
      date: nextDateKey,
      dayName: DAY_NAMES_LONG[nextDayOfWeek],
      dayShort: DAY_NAMES_SHORT[nextDayOfWeek],
      dayLong: DAY_NAMES_LONG[nextDayOfWeek],
      isTomorrow: false,
      tempMin: lastDay.tempMin,
      tempMax: lastDay.tempMax,
      condition: lastDay.condition,
      conditionMain: lastDay.conditionMain,
      conditionId: lastDay.conditionId,
      iconCode: lastDay.iconCode,
      pop: Math.max(0, lastDay.pop - 10),
      humidity: lastDay.humidity,
    });
  }

  return result.length > 0 ? result : generateDynamicDemoForecast('default', timezoneOffsetSec);
}

export default async function forecastHandler(req: Request, res: Response) {
  try {
    const q = (req.query.q as string)?.trim();
    const lat = req.query.lat as string;
    const lon = req.query.lon as string;
    const units = (req.query.units as string) || 'metric';
    const lang = (req.query.lang as string) || 'pt_br';

    const apiKey =
      process.env.OPENWEATHER_API_KEY ||
      (req.headers['x-api-key'] as string) ||
      '';

    if (!q && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Informe o nome de uma cidade (parâmetro q) ou coordenadas (lat, lon).',
      });
    }

    // Estima timezone padrão com base na cidade / coordenadas conhecidas caso offline
    let defaultTimezoneSec = -10800; // Sergipe / Brasil UTC-3
    const lowerQ = (q || '').toLowerCase();
    if (lowerQ.includes('riga') || lowerQ.includes('liepaja')) {
      defaultTimezoneSec = 10800; // Letônia UTC+3
    }

    // Se nenhuma chave configurada: retorna demonstração correspondente DINÂMICA
    if (!apiKey || apiKey === 'SUA_CHAVE_OPENWEATHERMAP') {
      const demoList = generateDynamicDemoForecast(q || '', defaultTimezoneSec);
      return res.json({ list: demoList, needsApiKey: true });
    }

    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    if (lat && lon) {
      url.searchParams.set('lat', lat);
      url.searchParams.set('lon', lon);
    } else if (q) {
      url.searchParams.set('q', q);
    }
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', units);
    url.searchParams.set('lang', lang);

    const apiRes = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!apiRes.ok) {
      const demoList = generateDynamicDemoForecast(q || '', defaultTimezoneSec);
      return res.json({ list: demoList });
    }

    const data = await apiRes.json();
    const timezoneOffset = typeof data.city?.timezone === 'number' ? data.city.timezone : defaultTimezoneSec;
    const dailyList = aggregateForecastToDays(data.list || [], timezoneOffset);
    return res.json({ list: dailyList });
  } catch (err: any) {
    console.error('Erro no endpoint de previsão:', err);
    const demoList = generateDynamicDemoForecast('', -10800);
    return res.json({ list: demoList });
  }
}
