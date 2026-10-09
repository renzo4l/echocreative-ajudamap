import React from 'react';
import { Phone, ShieldCheck } from 'lucide-react';

export const CulturalFooter: React.FC = () => {
  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-900">
      {/* Colonial Azulejo Green Accent */}
      <div className="h-1 w-full bg-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                AJUDAMAP
              </span>
              <span className="text-[10px] bg-neutral-900 text-emerald-400 px-2 py-0.5 rounded font-mono border border-neutral-800">
                São Luís · MA
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Plataforma desenvolvida pela <strong className="text-white">Echocreative</strong> para conectar a Grande Ilha de São Luís aos circuitos de solidariedade, reciclagem e conservação ecológica.
            </p>
          </div>

          {/* Cultural Heritage of São Luís */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Patrimônio Ludovicense
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              São Luís do Maranhão — Ilha do Amor, capital dos azulejos e berço do Bumba Meu Boi e Tambor de Crioula. Preservar nossa terra é honrar nossa história secular.
            </p>
          </div>

          {/* Civic Emergency Contacts */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Canais Úteis em São Luís
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Limpeza Urbana SLZ: (98) 3212-8400</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Batalhão de Polícia Ambiental: (98) 3214-8650</span>
              </li>
              <li className="text-[11px] text-emerald-400/90 pt-1">
                Hospital Aldenora Bello: (98) 3089-3000
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Slogan Section */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} AJUDAMAP · Echocreative.</p>
          {/* Exactly as requested: Slogan da Echocreative no bottom, and removed 'desenvolvido com carinho na ilha magnética' */}
          <p className="text-emerald-400 font-semibold tracking-wide">
            "Mapeando hábitos verdes, guiando um futuro sustentável"
          </p>
        </div>
      </div>
    </footer>
  );
};
