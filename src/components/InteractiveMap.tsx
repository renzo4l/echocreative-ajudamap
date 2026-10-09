import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationPoint, PointCategory } from '../types';
import { CARTO_VOYAGER_URL } from '../data/saoLuisData';
import { RefreshCw } from 'lucide-react';

interface InteractiveMapProps {
  points: LocationPoint[];
  selectedPoint: LocationPoint | null;
  onSelectPoint: (point: LocationPoint) => void;
  userCoords: [number, number] | null;
  onMapClickCoord?: (coords: [number, number]) => void;
  isPickingLocation?: boolean;
}

// User exact colors:
// Ecopontos - VERDES
// Bazares - VERMELHOS
// Doações - AMARELO
// Asilo - AZUL
// Reciclagens e Coperativas - PRETO
const CATEGORY_COLORS: Record<PointCategory, { pin: string; border: string; text: string; icon: string }> = {
  ecoponto: { pin: '#16a34a', border: '#ffffff', text: '#ffffff', icon: '♻️' },
  bazar: { pin: '#dc2626', border: '#ffffff', text: '#ffffff', icon: '🛍️' },
  doacao: { pin: '#eab308', border: '#ffffff', text: '#000000', icon: '🤝' },
  asilo: { pin: '#2563eb', border: '#ffffff', text: '#ffffff', icon: '👵' },
  reciclagem: { pin: '#171717', border: '#ffffff', text: '#ffffff', icon: '📦' },
};

// Center of São Luís
const SAO_LUIS_CENTER: [number, number] = [-2.5298, -44.2750];
const DEFAULT_ZOOM = 13;

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
  userCoords,
  onMapClickCoord,
  isPickingLocation = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map with CARTO Voyager URL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: SAO_LUIS_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(CARTO_VOYAGER_URL, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Clean top-right zoom controls
      L.control.zoom({ position: 'topright' }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickCoord) {
          onMapClickCoord([e.latlng.lat, e.latlng.lng]);
        }
      });

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Points / Markers with User Specified Color Scheme
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    points.forEach((point) => {
      const isSelected = selectedPoint?.id === point.id;
      const theme = CATEGORY_COLORS[point.category] || CATEGORY_COLORS.ecoponto;

      // Custom Color Pin Marker
      const customHtml = `
        <div class="custom-map-pin flex flex-col items-center cursor-pointer" style="transform-origin: bottom center;">
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full shadow-lg transition-all ${
            isSelected
              ? 'scale-125 ring-4 ring-emerald-400 shadow-2xl'
              : 'hover:scale-110'
          }" style="background-color: ${theme.pin}; border: 2px solid ${theme.border};">
            <span class="text-xs select-none leading-none">${theme.icon}</span>
            ${
              isSelected
                ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-xs">
                     <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                   </span>`
                : ''
            }
          </div>
          <div class="w-0.5 h-1.5" style="background-color: ${theme.pin};"></div>
          <div class="w-2.5 h-1 bg-black/40 rounded-full blur-[0.5px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'leaflet-custom-marker',
        iconSize: [28, 36],
        iconAnchor: [14, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });

      // Dark Mode Styled Popup
      const popupHtml = `
        <div class="p-3 max-w-[240px] text-white bg-neutral-900 border border-neutral-700/80 rounded-xl">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-xs" style="background-color: ${theme.pin}; color: ${theme.text}; border: 1px solid ${theme.border};">
              ${point.categoryLabel}
            </span>
          </div>
          <h4 class="font-bold text-xs text-white leading-snug mb-1">
            ${point.name}
          </h4>
          <p class="text-[11px] text-neutral-300 mb-2 leading-tight">
            📍 ${point.neighborhood} · São Luís
          </p>
          <div class="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Rota GPS ↗
            </a>
            <button 
              id="btn-details-${point.id}"
              class="text-[11px] px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              Detalhes
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-details-${point.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectPoint(point);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectPoint(point);
      });

      markersGroup.addLayer(marker);
    });
  }, [points, selectedPoint]);

  // Center on selected point
  useEffect(() => {
    if (!selectedPoint || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 15, {
      duration: 1.1,
    });
  }, [selectedPoint]);

  // Handle user coords
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 rounded-full bg-emerald-500/30 animate-ping"></span>
            <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md"></span>
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker(userCoords, { icon: userIcon }).addTo(map);
      userMarker.bindPopup('<strong class="text-xs text-white">Sua localização em São Luís</strong>');
      userMarkerRef.current = userMarker;

      map.flyTo(userCoords, 14, { duration: 1 });
    }
  }, [userCoords]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(SAO_LUIS_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
  };

  return (
    // Explicit low z-index (z-0) so modal forms with z-[99999] always open in front without layer collisions
    <div className="relative z-0 w-full h-[540px] lg:h-[660px] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full relative z-0" />

      {/* Picking Location Banner Mode */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-emerald-950 text-white px-4 py-2 rounded-xl shadow-lg border border-emerald-600 flex items-center gap-2 text-xs font-semibold">
          <span>📍 Clique no mapa para definir as coordenadas</span>
        </div>
      )}

      {/* Floating Map Controls with controlled z-index */}
      <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2">
        <button
          onClick={handleResetView}
          title="Ver toda a Ilha de São Luís"
          className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/90 backdrop-blur text-white text-xs font-semibold rounded-xl shadow-md border border-neutral-700 hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ilha Completa</span>
        </button>
      </div>

      {/* Legend Badge on Map */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-neutral-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-neutral-800 shadow-md text-[11px] text-neutral-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-semibold text-white">AjudaMap São Luís</span>
        <span className="text-neutral-500">·</span>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Ecopontos"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Bazares"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="Doações"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Asilos"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-100" title="Reciclagem"></span>
        </div>
      </div>
    </div>
  );
};
