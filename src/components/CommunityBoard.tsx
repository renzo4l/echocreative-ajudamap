import React, { useState } from 'react';
import { ACTIVE_CAMPAIGNS } from '../data/saoLuisData';
import { Calendar, Copy, Check } from 'lucide-react';

export const CommunityBoard: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyContact = (id: string, contact: string) => {
    navigator.clipboard.writeText(contact);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="py-12 bg-black text-white min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide mb-1.5">
            <span className="uppercase tracking-widest text-[11px] font-bold">Mural da Ilha</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Mobilização Ludovicense</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Campanhas & Voluntariado em São Luís
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Apoie iniciativas ativas na Grande Ilha com doações pontuais, chaves Pix oficiais ou atuando como voluntário na preservação das nossas praias e patrimônio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACTIVE_CAMPAIGNS.map((camp) => {
            const isCopied = copiedId === camp.id;
            return (
              <div
                key={camp.id}
                className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white">{camp.organizer}</span>
                    <span className="text-[11px] bg-neutral-800 text-emerald-300 border border-neutral-700 px-2 py-0.5 rounded-full font-medium">
                      📍 {camp.neighborhood}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-white mb-2 leading-snug">
                    {camp.title}
                  </h3>

                  <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-400">{camp.goal}</span>
                      <span className="text-emerald-400 font-bold tabular-nums">{camp.currentProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${camp.currentProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with contact & CTA */}
                <div className="pt-3.5 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-neutral-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{camp.dueDate}</span>
                  </div>

                  <button
                    onClick={() => handleCopyContact(camp.id, camp.contact)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors cursor-pointer text-xs shadow-md"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Contato / Pix Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white" />
                        <span>Copiar Contato / Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
