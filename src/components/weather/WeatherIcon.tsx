import React from 'react';
import {
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
} from 'lucide-react';

interface WeatherIconProps {
  conditionId: number;
  iconCode?: string;
  className?: string;
  strokeWidth?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  conditionId,
  iconCode = '01d',
  className = 'w-7 h-7 text-white',
  strokeWidth = 1.5,
}) => {
  const isNight = iconCode.endsWith('n');

  // Thunderstorm 2xx
  if (conditionId >= 200 && conditionId < 300) {
    return <CloudLightning className={className} strokeWidth={strokeWidth} />;
  }

  // Drizzle 3xx
  if (conditionId >= 300 && conditionId < 400) {
    return <CloudDrizzle className={className} strokeWidth={strokeWidth} />;
  }

  // Rain 5xx
  if (conditionId >= 500 && conditionId < 600) {
    return <CloudRain className={className} strokeWidth={strokeWidth} />;
  }

  // Snow 6xx
  if (conditionId >= 600 && conditionId < 700) {
    return <CloudSnow className={className} strokeWidth={strokeWidth} />;
  }

  // Atmosphere (Mist, Smoke, Haze, Fog) 7xx
  if (conditionId >= 700 && conditionId < 800) {
    return <CloudFog className={className} strokeWidth={strokeWidth} />;
  }

  // Clear 800
  if (conditionId === 800) {
    return isNight ? (
      <Moon className={className} strokeWidth={strokeWidth} />
    ) : (
      <Sun className={className} strokeWidth={strokeWidth} />
    );
  }

  // Few clouds 801 - 802
  if (conditionId === 801 || conditionId === 802) {
    return isNight ? (
      <CloudMoon className={className} strokeWidth={strokeWidth} />
    ) : (
      <CloudSun className={className} strokeWidth={strokeWidth} />
    );
  }

  // Clouds 803 - 804
  return <Cloud className={className} strokeWidth={strokeWidth} />;
};
