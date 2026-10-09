import React, { useMemo } from 'react';
import { LocationPoint, PointCategory } from '../types';
import { CATEGORIES_CONFIG, POPULAR_MATERIALS_FILTER } from '../data/saoLuisData';
import { Clock, Navigation, ChevronRight, X } from 'lucide-react';

interface DirectoryListProps {
  points: LocationPoint[];
  selectedPoint: LocationPoint | null;
  onSelectPoint: (point: LocationPoint) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (bairro: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (mat: string) => void;
  userCoords: [number, number] | null;
}

const CATEGORY_STYLES: Record<PointCategory, { badge: string; text: string }> = {
  ecoponto: { badge: 'bg-green-600/20 text-green-400 border-green-500/40', text: 'text-green-400' },
  bazar: { badge: 'bg-red-600/20 text-red-400 border-red-500/40', text: 'text-red-400' },
  doacao: { badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', text: 'text-yellow-400' },
  asilo: { badge: 'bg-blue-600/20 text-blue-400 border-blue-500/40', text: 'text-blue-400' },
  reciclagem: { badge: 'bg-neutral-800 text-neutral-200 border-neutral-600', text: 'text-neutral-300' },
};

export const DirectoryList: React.FC<DirectoryListProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
  selectedCategory,
  setSelectedCategory,
  selectedNeighborhood,
  setSelectedNeighborhood,
  selectedMaterial,
  setSelectedMaterial,
  userCoords,
}) => {
  // Extract all existing unique neighborhoods dynamically from points
  const existingNeighborhoods = useMemo(() => {
    const set = new Set<string>();
    points.forEach((p) => {
      if (p.neighborhood) set.add(p.neighborhood.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [points]);

  const calculateDistance = (lat: number, lng: number): string | null => {
    if (!userCoords) return null;
    const [uLat, uLng] = userCoords;
    const R = 6371;
    const dLat = ((lat - uLat) * Math.PI) / 180;
    const dLon = ((lng - uLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((uLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  const isFiltered = selectedCategory !== 'all' || selectedNeighborhood.trim() !== '' || selectedMaterial !== 'all';

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden text-neutral-100">
      {/* Dark Filter Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-bold text-sm text-white">
              Pontos na Ilha
            </h3>
            <span className="text-xs font-semibold text-emerald-400 tabular-nums">
              ({points.length})
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedNeighborhood('');
                setSelectedMaterial('all');
              }}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          {CATEGORIES_CONFIG.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/80 hover:bg-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Neighborhood Free-Text & Material Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {/* Free-text Neighborhood Filter as requested */}
          <div className="relative">
            <input
              type="text"
              list="bairros-filtro-datalist"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              placeholder="Digite o bairro (ex: Calhau)..."
              className="w-full text-[11px] py-1.5 pl-2.5 pr-6 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {selectedNeighborhood && (
              <button
                onClick={() => setSelectedNeighborhood('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <datalist id="bairros-filtro-datalist">
              {existingNeighborhoods.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full text-[11px] py-1.5 px-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {POPULAR_MATERIALS_FILTER.map((mat) => (
              <option key={mat.id} value={mat.id} className="bg-neutral-900 text-white">
                {mat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Points List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 p-2 max-h-[560px]">
        {points.length === 0 ? (
          <div className="p-8 text-center text-neutral-400">
            <p className="font-semibold text-xs text-white mb-1">
              Nenhum ponto encontrado
            </p>
            <p className="text-[11px]">
              Tente digitar outro bairro ou limpar os filtros.
            </p>
          </div>
        ) : (
          points.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const dist = calculateDistance(point.lat, point.lng);
            const style = CATEGORY_STYLES[point.category] || CATEGORY_STYLES.ecoponto;

            return (
              <div
                key={point.id}
                onClick={() => onSelectPoint(point)}
                className={`p-3 rounded-xl transition-all cursor-pointer group mb-1 ${
                  isSelected
                    ? 'bg-neutral-800/90 border border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}>
                        {point.categoryLabel}
                      </span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span className="text-neutral-400">{point.neighborhood}</span>
                      {dist && (
                        <>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <span className="font-semibold text-emerald-400 tabular-nums">
                            {dist}
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {point.name}
                    </h4>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-transform ${isSelected ? 'rotate-90 text-emerald-400' : ''}`} />
                </div>

                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                  📍 {point.address}
                </p>

                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-neutral-400">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{point.hours}</span>
                </div>

                {/* Direct quick action buttons */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-800 text-[11px]">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Como chegar</span>
                  </a>

                  {point.whatsapp && (
                    <a
                      href={`https://wa.me/55${point.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20vi%20no%20AjudaMap%20S%C3%A3o%20Lu%C3%ADs!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-300 hover:text-white font-semibold"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
