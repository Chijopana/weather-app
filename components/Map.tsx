/**
 * Map
 *
 * Mapa de la ubicación mostrada, sea la del usuario o la ciudad buscada.
 *
 * Antes el mapa solo se renderizaba cuando había coordenadas de geolocalización
 * y el título decía siempre "tu ubicación actual": al buscar una ciudad el mapa
 * simplemente desaparecía de la página. Ahora recibe las coordenadas que la
 * propia API devuelve para la ubicación consultada y se recentra al cambiar.
 */
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { memo, useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { MAP_CONFIG } from '../constants/config';

interface MapProps {
  lat: number;
  lon: number;
  label: string;
}

// Leaflet resuelve los iconos por defecto contra rutas relativas al CSS, que en
// Next.js no existen. Se apunta a los assets copiados en /public/leaflet.
const markerIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Recentra el mapa cuando cambian las coordenadas sin remontar el contenedor. */
function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
}

const Map = memo(function Map({ lat, lon, label }: MapProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      aria-label="Mapa de la ubicación"
    >
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">Ubicación</h2>
      <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-md">
        <div className="h-[280px] w-full">
          <MapContainer
            center={[lat, lon]}
            zoom={MAP_CONFIG.ZOOM}
            scrollWheelZoom={false}
            className="h-full w-full"
            zoomControl
          >
            <TileLayer
              attribution='&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <Marker position={[lat, lon]} icon={markerIcon}>
              <Popup>
                <strong>{label}</strong>
                <br />
                {lat.toFixed(3)}, {lon.toFixed(3)}
              </Popup>
            </Marker>
            <Recenter lat={lat} lon={lon} />
          </MapContainer>
        </div>
      </div>
      <p className="mt-2 text-xs text-white/45">
        Rueda del ratón desactivada en el mapa para no secuestrar el scroll de la página.
      </p>
    </motion.section>
  );
});

export default Map;
