import React from 'react';
import { MapPin, Calculator, Sparkles, BookOpen, Shield } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'mapa',
      label: 'Mapa',
      icon: MapPin,
    },
    {
      id: 'calculadora',
      label: 'Impacto',
      icon: Calculator,
    },
    {
      id: 'mural',
      label: 'Mural',
      icon: Sparkles,
    },
    {
      id: 'guia',
      label: 'Guia',
      icon: BookOpen,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
    },
  ];

  return (
    <nav 
      aria-label="Navegação entre Categorias" 
      className="sticky bottom-0 z-40 w-full bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800 shadow-2xl py-1.5 px-2"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/40 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-neutral-400'}`} />
              <span className="text-[10px] whitespace-nowrap leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
