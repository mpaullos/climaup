import React from 'react';
import type { WeatherData, TemperatureUnit } from '../../types/weather';
import { formatTemp } from '../../utils/formatWeather';

interface WeatherDetailsProps {
  data: WeatherData;
  unit: TemperatureUnit;
  variant?: 'mobile' | 'desktop';
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  data,
  unit,
  variant = 'desktop',
}) => {
  const items = [
    {
      label: 'Nebulosidade',
      value: `${data.cloudiness}%`,
    },
    {
      label: 'Vento',
      value: data.windDirectionText,
    },
    {
      label: 'Sensação térmica',
      value: formatTemp(data.feelsLike, unit),
    },
    {
      label: 'Visibilidade',
      value: `${data.visibility} km`,
    },
    {
      label: 'Umidade',
      value: `${data.humidity}%`,
    },
    {
      label: 'Pressão',
      value: `${data.pressure} hPa`,
    },
  ];

  if (variant === 'mobile') {
   
    const mobileItems = [
      {
        label: 'Umidade',
        value: `${data.humidity}%`,
      },
      {
        label: 'Sensação',
        value: formatTemp(data.feelsLike, unit),
      },
      {
        label: 'Nebulosidade',
        value: `${data.cloudiness}%`,
      },
      {
        label: 'Vento',
        value: `${data.windSpeed} km/h`,
      },
    ];

    return (
      <div className="w-full">
        <h3 className="text-xs font-semibold text-white/90 tracking-wide mb-3">
          Detalhes do clima
        </h3>
        <div className="space-y-2.5">
          {mobileItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs text-white/80"
            >
              <span className="font-light text-white/70">{item.label}</span>
              <span className="font-normal tabular-nums text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Versão desktop 
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-white/95 tracking-wide mb-4">
        Detalhes do Clima
      </h3>
      <div className="space-y-3.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm py-0.5 border-b border-white/[0.04] last:border-0"
          >
            <span className="font-light text-white/70">{item.label}</span>
            <span className="font-medium tabular-nums text-white text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
