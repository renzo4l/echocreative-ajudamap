import React from 'react';
import { Plus, Shield } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenAddModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pointsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  activeTab,
  setActiveTab,
  pointsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark with uploaded logo */}
        <button
          onClick={() => setActiveTab('mapa')}
          className="flex items-center text-left focus:outline-none group cursor-pointer"
        >
          <Logo size="sm" showSubtitle={true} />
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'mapa'
                ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Mapa da Ilha
          </button>

          <button
            onClick={() => setActiveTab('calculadora')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'calculadora'
                ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Calculadora
          </button>

          <button
            onClick={() => setActiveTab('mural')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'mural'
                ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Mural da Ilha
          </button>

          <button
            onClick={() => setActiveTab('guia')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'guia'
                ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Guia Cultural
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center text-xs text-neutral-300 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800">
            <span className="font-bold text-emerald-400 tabular-nums mr-1">{pointsCount}</span>
            <span>pontos na Ilha</span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 rounded-lg shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Ponto</span>
          </button>
        </div>
      </div>
    </header>
  );
};
