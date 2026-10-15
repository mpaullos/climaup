import React from 'react';
import type { WeatherData, TemperatureUnit } from '../../types/weather';
import { formatDisplayTemp } from '../../utils/formatWeather';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: TemperatureUnit;
  variant?: 'mobile' | 'desktop';
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  data,
  unit,
  variant = 'desktop',
}) => {
  const displayTemp = formatDisplayTemp(
    data.temp,
    unit,
    variant === 'mobile' // Exibe "05°" se for mobile
  );

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col items-start w-full px-1">
        {/* Temperatura Gigante no topo */}
        <div className="w-full flex justify-center py-6">
          <span className="text-7xl sm:text-8xl font-light tracking-tighter text-white tabular-nums drop-shadow-md select-none">
            {displayTemp}
          </span>
        </div>

        {/* Linha com Cidade à esquerda e Ícone/Descrição à direita */}
        <div className="w-full flex items-end justify-between mt-2 pt-2">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white drop-shadow">
              {data.city}
              {data.state && (
                <span className="text-xs font-normal text-amber-300 ml-1.5">
                  ({data.state})
                </span>
              )}
              {data.country ? (
                <span className="text-xs font-light text-white/60 ml-2 tracking-normal uppercase">
                  {data.country}
                </span>
              ) : null}
            </h1>
            <p className="text-xs font-light text-white/75 mt-0.5 tracking-wide drop-shadow-sm">
              {data.formattedDate.includes(' ') && !data.formattedDate.includes(':')
                ? data.formattedDate
                : data.formattedDate.replace(/^\d{2}:\d{2}\s*/, '')}
            </p>
          </div>

          <div className="flex flex-col items-center shrink-0 pl-3">
            <div className="p-1 mb-1">
              <WeatherIcon
                conditionId={data.conditionId}
                iconCode={data.iconCode}
                className="w-7 h-7 text-white drop-shadow"
              />
            </div>
            <span className="text-xs font-light text-white/85 tracking-wide capitalize">
              {data.condition}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Visual Desktop 
  return (
    <div className="flex flex-col justify-end">
      <div className="flex items-baseline gap-5">
        {/* Temperatura Gigante */}
        <span className="text-7xl lg:text-8xl font-light tracking-tighter text-white tabular-nums select-none drop-shadow-lg leading-none">
          {displayTemp}
        </span>

        {/* Bloco de Cidade, Data e Ícone */}
        <div className="flex flex-col pb-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white drop-shadow-md">
              {data.city}
            </h1>
            {data.state && (
              <span className="text-xs text-amber-300 font-medium tracking-wide px-2 py-0.5 rounded-full border border-amber-300/30 bg-amber-400/10 backdrop-blur-sm">
                {data.state}
              </span>
            )}
            {data.country && (
              <span className="text-[11px] text-white/60 uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                {data.country}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-xs lg:text-sm font-light text-white/80 drop-shadow">
              {data.formattedDate}
            </p>

            <span className="text-white/40">|</span>

            <div className="flex items-center gap-1.5">
              <WeatherIcon
                conditionId={data.conditionId}
                iconCode={data.iconCode}
                className="w-4 h-4 lg:w-5 lg:h-5 text-white drop-shadow"
              />
              <span className="text-xs lg:text-sm font-normal text-white/90 drop-shadow capitalize">
                {data.condition}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
