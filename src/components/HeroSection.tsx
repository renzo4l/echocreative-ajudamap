import React from 'react';
import { Search, Compass } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNearMe: () => void;
  isLocating: boolean;
  pointsTotal: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onNearMe,
  isLocating,
  pointsTotal,
}) => {
  return (
    <section className="relative overflow-hidden bg-black text-white pt-8 pb-8 border-b border-neutral-900">
      {/* Subtle Azulejo ambient pattern on dark */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-azulejo-pattern" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Cultural Kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide mb-2">
            <span className="uppercase tracking-widest text-[11px] font-bold">Echocreative</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Ilha do Amor</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>São Luís, Maranhão</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Mapa de sustentabilidade e solidariedade da <span className="text-emerald-400">Grande Ilha</span>.
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-neutral-300 leading-relaxed">
            Localize ecopontos oficiais, bazares solidários, pontos de doação e asilos históricos na capital dos azulejos.
          </p>

          {/* Minimalist Search Bar & GPS */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por bairro, material (óleo, roupas, entulho) ou local..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            <button
              onClick={onNearMe}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap disabled:opacity-75"
            >
              <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Localizando...' : 'Perto de Mim'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
