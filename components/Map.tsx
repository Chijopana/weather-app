/**
 * Map Component
 * Displays interactive map with user location marker
 * Uses Leaflet for mapping functionality
 */

import React, { memo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';
import { motion } from 'framer-motion';

interface MapProps {
  lat: number;
  lon: number;
}

/**
 * Map component showing current location
 */
const Map = memo(function Map({ lat, lon }: MapProps) {
  const center: LatLngTuple = [lat, lon];

  // Fix Leaflet default icons in Next.js
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: '/leaflet/marker-icon.png',
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      shadowUrl: '/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.setIcon(DefaultIcon);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20"
    >
      <h3 className="text-white text-lg font-medium mb-3">Mapa (tu ubicación actual)</h3>
      <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-inner" style={{ height: '300px' }}>
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full"
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>
              <div className="text-sm">
                <strong>Tu ubicación</strong>
                <p>{lat.toFixed(4)}, {lon.toFixed(4)}</p>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} permanent={false}>
              Tu ubicación
            </Tooltip>
          </Marker>
        </MapContainer>
      </div>
    </motion.div>
  );
});

Map.displayName = 'Map';

export default Map;
