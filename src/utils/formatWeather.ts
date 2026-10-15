import type { TemperatureUnit } from '../types/weather';

/**
 * Formata a temperatura de acordo com a unidade selecionada (°C ou °F).
 */
export function formatTemp(celsius: number, unit: TemperatureUnit = 'celsius'): string {
  if (unit === 'fahrenheit') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°`;
  }
  const rounded = Math.round(celsius);
  
  return `${rounded}°`;
}

/**
 * Formata temperatura com 2 dígitos ("05°")
 */
export function formatDisplayTemp(celsius: number, unit: TemperatureUnit = 'celsius', padZero = false): string {
  if (unit === 'fahrenheit') {
    const fahrenheit = Math.round((celsius * 9) / 5 + 32);
    return `${fahrenheit}°`;
  }
  const rounded = Math.round(celsius);
  if (padZero && rounded >= 0 && rounded < 10) {
    return `0${rounded}°`;
  }
  return `${rounded}°`;
}

/**
 * Converte graus de direção do vento (0-360) para sigla em português (N, NE, L, SE, S, SO, O, NO).
 */
export function formatWindDirection(deg: number | undefined): string {
  if (deg === undefined || isNaN(deg)) return 'Vento';
  const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

/**
 * Formata a velocidade do vento em km/h
 */
export function formatWindSpeed(speedKmh: number, deg?: number): string {
  const roundedSpeed = Math.round(speedKmh);
  const dir = deg !== undefined ? `${formatWindDirection(deg)} ` : '';
  return `${dir}${roundedSpeed} km/h`;
}

/**
 * Capitaliza a primeira letra de uma frase (ex: "céu limpo" -> "Céu limpo")
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formata data e hora baseada no fuso horário retornado pelo OpenWeatherMap
 */
export function formatCityDateTime(utcTimestampSec: number, timezoneOffsetSec: number) {
  // Cria data no timezone do local
  // utcTimestampSec é segundos desde Unix epoch
  const localTimeMs = (utcTimestampSec + timezoneOffsetSec) * 1000;
  const localDate = new Date(localTimeMs);

  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const daysOfWeekLong = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  const daysOfWeekShort = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  const monthsLong = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  const monthsShort = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  const dayIndex = localDate.getUTCDay();
  const dayOfMonth = localDate.getUTCDate();
  const monthIndex = localDate.getUTCMonth();
  const fullYear = localDate.getUTCFullYear();
  const shortYear = String(fullYear).slice(-2);

  // Estilo mobile "Monday, 10 september" -> "Segunda-feira, 10 de setembro"
  const dateLong = `${daysOfWeekLong[dayIndex]}, ${dayOfMonth} de ${monthsLong[monthIndex]}`;

  // Estilo desktop "10:52 Sunday 2 Aug '20" -> "10:52 Domingo, 2 Ago '${shortYear}'"
  const desktopFull = `${timeStr} ${daysOfWeekShort[dayIndex]}, ${dayOfMonth} ${monthsShort[monthIndex]} '${shortYear}`;

  return {
    time: timeStr,
    dateLong,
    dateShort: `${daysOfWeekShort[dayIndex]}, ${dayOfMonth} ${monthsShort[monthIndex]}`,
    desktopFull,
  };
}
