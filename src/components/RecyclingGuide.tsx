import React from 'react';
import { Trash2, Droplets, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { CULTURAL_SLZ_SNIPPETS } from '../data/saoLuisData';

export const RecyclingGuide: React.FC = () => {
  return (
    <section className="py-12 bg-black text-white min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cultural Header */}
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide mb-1.5">
            <span className="uppercase tracking-widest text-[11px] font-bold">Cultura & Sustentabilidade</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>São Luís — MA</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Guia Cultural & Descarte Consciente
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Pequenos gestos de descarte e doação protegem os manguezais, rios e enriquecem o patrimônio histórico de São Luís.
          </p>
        </div>

        {/* Cultural Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {CULTURAL_SLZ_SNIPPETS.map((snip, idx) => (
            <div
              key={idx}
              className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-md"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{snip.title}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {snip.text}
              </p>
            </div>
          ))}
        </div>

        {/* 4-Pillar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-md">
            <div className="w-8 h-8 rounded-lg bg-green-950/80 border border-green-800/60 flex items-center justify-center text-green-400 mb-3">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              Ecopontos Municipais (Verdes)
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Até 2m³ diários de entulhos de reforma, podas de árvore e móveis desmontados. Destinação gratuita autorizada pela prefeitura.
            </p>
          </div>

          <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-md">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 mb-3">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              Bazares Solidários (Vermelhos)
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Roupas, calçados e livros em bom estado ganham novo ciclo de uso e financiam atendimentos sociais da APAE e Cáritas.
            </p>
          </div>

          <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-md">
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-3">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              Asilos de Idosos (Azul)
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Fraldas geriátricas G/GG e leite integral são a maior necessidade diária no histórico Asilo de Mendicidade e Solar do Outono.
            </p>
          </div>

          <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-md">
            <div className="w-8 h-8 rounded-lg bg-yellow-950/80 border border-yellow-800/60 flex items-center justify-center text-yellow-400 mb-3">
              <Droplets className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              Óleo Vegetal em Garrafa PET
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Armazene o óleo frio em PET e leve ao Mercado das Tulhas. Evita que o óleo atinja os manguezais da bacia do Bacanga.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
