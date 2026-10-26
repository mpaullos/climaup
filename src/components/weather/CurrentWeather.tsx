import React, { useState, useEffect } from 'react';
import type { WeatherData, TemperatureUnit } from '../../types/weather';
import { formatDisplayTemp, formatCityDateTime } from '../../utils/formatWeather';
import { Clock3 } from "lucide-react";
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
  // Relógio vivo que atualiza em tempo real no fuso horário da cidade
  const [currentUtcSec, setCurrentUtcSec] = useState<number>(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    // Sincroniza imediatamente ao mudar de localidade
    setCurrentUtcSec(Math.floor(Date.now() / 1000));

    // Atualiza a cada segundo
    const timer = setInterval(() => {
      setCurrentUtcSec(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [data.city, data.timezoneOffset]);

  const timezoneOffset = typeof data.timezoneOffset === 'number' ? data.timezoneOffset : -10800;
  const liveDateTime = formatCityDateTime(currentUtcSec, timezoneOffset);

  const displayTemp = formatDisplayTemp(
    data.temp,
    unit,
    variant === 'mobile' // Exibe "05°" se for mobile
  );

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col items-start w-full px-1">
        {/* Temperatura Gigante isolada no centro */}
        <div className="w-full flex justify-center py-6">
          <span className="text-7xl sm:text-8xl font-light tracking-tighter text-white tabular-nums drop-shadow-md select-none">
            {displayTemp}
          </span>
        </div>

        {/* Linha com Horário/Cidade/Data à esquerda e Ícone/Condição à direita */}
        <div className="w-full flex items-end justify-between mt-2 pt-2">
          <div className="flex-1 min-w-0 pr-3">
            {/* Horário local minimalista sem com pílula logo acima do nome da cidade */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wider text-white/90 tabular-nums shadow-sm backdrop-blur-sm">
              <Clock3 className="h-3.5 w-3.5 text-amber-300" />
              {liveDateTime.time}
            </span>


            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white drop-shadow truncate">
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

            {/* Data Completa em Linha Única sem quebra */}
            <p className="text-xs font-light text-white/80 mt-0.5 tracking-wide drop-shadow-sm capitalize truncate">
              {liveDateTime.dateLong}
            </p>
          </div>

          <div className="flex flex-col items-center shrink-0 pl-2 text-right">
            <div className="p-1 mb-1">
              <WeatherIcon
                conditionId={data.conditionId}
                iconCode={data.iconCode}
                className="w-7 h-7 text-white drop-shadow"
              />
            </div>
            <span className="text-xs font-light text-white/85 tracking-wide capitalize text-center max-w-[120px] leading-tight">
              {data.condition}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Visual Desktop (estilo Screenshot 2: Pondicherry 20° com data e ícone)
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
              {liveDateTime.desktopFull}
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
