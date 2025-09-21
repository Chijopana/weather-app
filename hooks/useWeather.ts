import { useEffect, useState, useRef } from 'react';

type WeatherResult = {
  current: any | null;
  hourly: any[] | null;
  daily: any[] | null;
  timezone?: string;
  locationName?: string;
};

const WEATHERAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
const REFRESH_MINUTES = Number(process.env.NEXT_PUBLIC_REFRESH_MINUTES || '5');

export function useWeather(lat?: number, lon?: number, city?: string) {
  const [data, setData] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const fetchWeather = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=no&alerts=no&lang=es`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.error) throw new Error(json.error.message);

      // Normalizamos hourly y daily para que dt sea timestamp UNIX en segundos
      const hourly = json.forecast.forecastday.flatMap((day: any) =>
        day.hour.map((h: any) => ({
          ...h,
          dt: new Date(h.time).getTime() / 1000,
        }))
      );

      const daily = json.forecast.forecastday.map((d: any) => ({
        ...d,
        dt: new Date(d.date).getTime() / 1000,
        temp: { day: d.day.avgtemp_c },
        weather: [{ main: d.day.condition.text, description: d.day.condition.text }],
      }));

      setData({
        current: json.current,
        hourly,
        daily,
        timezone: json.location.tz_id,
        locationName: `${json.location.name}, ${json.location.country}`,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching weather');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    const doFetch = async () => {
      if (city) await fetchWeather(city);
      else if (lat !== undefined && lon !== undefined) await fetchWeather(`${lat},${lon}`);
    };

    doFetch();
    timer.current = setInterval(doFetch, REFRESH_MINUTES * 60 * 1000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [lat, lon, city]);

  return {
    data,
    loading,
    error,
    refresh: async () => {
      if (city) await fetchWeather(city);
      else if (lat !== undefined && lon !== undefined) await fetchWeather(`${lat},${lon}`);
    },
  };
}
