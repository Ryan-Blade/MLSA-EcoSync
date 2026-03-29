import { useState, useCallback, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '4d8fb5b93d4af21d66a2948710284366';

// Mapping OpenWeatherMap conditions to EcoSync Grid Events
// 'OVERCAST', 'STORM', 'HEAT_WAVE', 'BLIZZARD', 'CLEAR'
export function mapWeatherCondition(description: string, temp: number): string {
  const lower = description.toLowerCase();
  if (temp > 35) return 'HEAT_WAVE';
  if (lower.includes('snow') || lower.includes('blizzard')) return 'BLIZZARD';
  if (lower.includes('storm') || lower.includes('thunder')) return 'STORM';
  if (lower.includes('rain') || lower.includes('drizzle')) return 'OVERCAST'; 
  if (lower.includes('cloud') && !lower.includes('few')) return 'OVERCAST';
  return 'CLEAR';
}

export interface WeatherData {
  temp: number;
  clouds: number;
  wind_speed: number;
  city: string;
  description: string;
  humidity: number;
  gridCondition: string; // The translated string for backend
}

const MOCK_DATA: WeatherData = { 
  temp: 28, 
  clouds: 40, 
  wind_speed: 5, 
  city: 'Demo City', 
  description: 'partly cloudy', 
  humidity: 65,
  gridCondition: 'CLEAR'
};

export function useWeather(initialQuery: string) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchWeather = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    hasFetched.current = true;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`);
      const data = await res.json();
      
      if (data.cod !== 200) throw new Error(data.message);
      
      const description = data.weather[0]?.description || 'clear';
      const temp = Math.round(data.main.temp);
      
      const formatted = {
        temp,
        clouds: data.clouds.all,
        wind_speed: data.wind.speed,
        city: data.name,
        description,
        humidity: data.main.humidity,
        gridCondition: mapWeatherCondition(description, temp)
      };
      
      console.log('[Weather] Loaded Live OpenWeather Data:', formatted);
      setWeatherData(formatted);
    } catch (err: any) {
      console.log('[Weather] API failed, using fallback mock data:', err.message);
      setWeatherData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery && !hasFetched.current) {
      fetchWeather(initialQuery);
    }
  }, [initialQuery, fetchWeather]);

  return { fetchWeather, weatherData, loading };
}
