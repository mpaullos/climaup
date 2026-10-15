import React, { useState } from 'react';
import type { DailyForecast, TemperatureUnit } from '../../types/weather';
import { formatTemp } from '../../utils/formatWeather';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, ChevronDown } from 'lucide-react';

interface ForecastListProps {
  forecast: DailyForecast[];
  unit: TemperatureUnit;
  variant?: 'mobile' | 'desktop';
}

export const ForecastList: React.FC<ForecastListProps> = ({
  forecast,
  unit,
  variant = 'desktop',
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!forecast || forecast.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-white/40">
        Carregando previsão de outros dias...
      </div>
    );
  }

  const toggleSelect = (date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date));
  };

  if (variant === 'mobile') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white/90 tracking-wide">
            Previsão para os Próximos 5 Dias
          </h3>
          <span className="text-[10px] text-white/40">Toque para detalhes</span>
        </div>

        <div className="space-y-1.5">
          {forecast.map((day) => {
            const isExpanded = selectedDate === day.date;
            return (
              <div
                key={day.date}
                className={`rounded-xl transition-all border ${
                  isExpanded
                    ? 'bg-white/10 border-white/20 p-2.5'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 p-2'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSelect(day.date)}
                  className="w-full flex items-center justify-between text-xs text-left"
                >
                  <div className="w-28 flex flex-col">
                    <span className="font-medium text-white/90">
                      {day.isTomorrow || day.dayName === 'Amanhã'
                        ? `Amanhã · ${day.dayShort}`
                        : day.dayLong || day.dayName}
                    </span>
                    <span className="text-[10px] text-white/50 capitalize truncate">
                      {day.condition}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <WeatherIcon
                      conditionId={day.conditionId}
                      iconCode={day.iconCode}
                      className="w-4 h-4 text-white"
                    />
                    {day.pop > 15 && (
                      <span className="text-[10px] text-sky-300 font-medium flex items-center">
                        <Droplets className="w-2.5 h-2.5 mr-0.5" />
                        {day.pop}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 tabular-nums font-medium text-right">
                    <span className="text-white/50 font-light text-[11px]">
                      {formatTemp(day.tempMin, unit)}
                    </span>
                    <span className="text-white/25 text-[10px]">/</span>
                    <span className="text-white text-xs">
                      {formatTemp(day.tempMax, unit)}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-white/40 transition-transform ${
                        isExpanded ? 'rotate-180 text-amber-300' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-white/70 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Umidade: <strong className="text-white">{day.humidity}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 text-center text-amber-300 font-bold">☂</span>
                      <span>Chuva: <strong className="text-white">{day.pop}%</strong></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Versão desktop
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/95 tracking-wide">
          Previsão para 5 Dias
        </h3>
        <span className="text-[11px] text-white/40">Clique no dia para detalhes</span>
      </div>

      <div className="space-y-2">
        {forecast.map((day) => {
          const isExpanded = selectedDate === day.date;
          return (
            <div
              key={day.date}
              className={`rounded-xl transition-all border ${
                isExpanded
                  ? 'bg-white/10 border-white/20 p-3 shadow-lg'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 p-2.5'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSelect(day.date)}
                className="w-full flex items-center justify-between text-sm text-left group cursor-pointer"
              >
                <div className="w-32 flex flex-col">
                  <span className="font-medium text-white/90 text-xs group-hover:text-amber-300 transition-colors">
                    {day.isTomorrow || day.dayName === 'Amanhã'
                      ? `Amanhã · ${day.dayShort}`
                      : day.dayLong || day.dayName}
                  </span>
                  <span className="text-[10px] text-white/45 capitalize truncate">
                    {day.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <WeatherIcon
                    conditionId={day.conditionId}
                    iconCode={day.iconCode}
                    className="w-4 h-4 text-white drop-shadow"
                  />
                  {day.pop > 15 && (
                    <span className="text-[11px] text-sky-300 font-medium flex items-center">
                      <Droplets className="w-3 h-3 mr-0.5 text-sky-300/80" />
                      {day.pop}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 tabular-nums text-right">
                  <span className="text-xs text-white/50 font-light">
                    {formatTemp(day.tempMin, unit)}
                  </span>
                  <div className="w-10 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(30, day.tempMax * 2.5))}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-medium">
                    {formatTemp(day.tempMax, unit)}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/30 transition-transform ${
                      isExpanded ? 'rotate-180 text-amber-300' : ''
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-white/80 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-white/40">Umidade Média</div>
                      <div className="font-semibold text-white">{day.humidity}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="w-4 text-center text-amber-300 font-bold text-sm">☂</div>
                    <div>
                      <div className="text-[10px] text-white/40">Probabilidade de Chuva</div>
                      <div className="font-semibold text-white">{day.pop}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
