import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';
import { motion } from 'framer-motion';

// Corregir iconos por defecto de Leaflet en Next
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

type MapProps = {
  lat: number;
  lon: number;
};

export default function Map({ lat, lon }: MapProps) {
  const center: LatLngTuple = [lat, lon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20"
    >
      <h3 className="text-white text-lg font-medium mb-3">Mapa (tu ubicación actual)</h3>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-64 rounded-xl border border-white/10 shadow-inner"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup className="text-black font-medium">
            Estás aquí — {lat.toFixed(3)}, {lon.toFixed(3)}
          </Popup>
          <Tooltip
            direction="top"
            offset={[0, -10]}
            opacity={0.9}
            className="bg-white/90 text-black rounded px-2 py-1 shadow-md"
          >
            Tu ubicación
          </Tooltip>
        </Marker>
      </MapContainer>
    </motion.div>
  );
}
