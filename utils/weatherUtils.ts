export const weatherToBackground = (main: string | undefined) => {
  if (!main) return 'default';
  const m = main.toLowerCase();
  if (m.includes('lluvia') || m.includes('drizzle') || m.includes('rain')) return 'rain';
  if (m.includes('nublado') || m.includes('cloud')) return 'clouds';
  if (m.includes('tormenta') || m.includes('thunderstorm') || m.includes('storm')) return 'storm';
  if (m.includes('nieve') || m.includes('snow')) return 'snow';
  if (m.includes('niebla') || m.includes('mist') || m.includes('fog') || m.includes('haze')) return 'mist';
  if (m.includes('despejado') || m.includes('clear')) return 'clear';
  return 'default';
};


export const formatTemp = (t: number | undefined) => t === undefined ? '--' : `${Math.round(t)}°C`;

export const formatHour = (dt: number) => {
  const date = new Date(dt * 1000);
  return date.getHours().toString().padStart(2, '0') + ':00';
};

export const formatDay = (dt: number) => {
  const date = new Date(dt * 1000);
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
};
