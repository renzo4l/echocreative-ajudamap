import React, { useState } from 'react';
import { Droplets, Leaf, Heart, Share2 } from 'lucide-react';

export const ImpactCalculator: React.FC = () => {
  const [clothesKg, setClothesKg] = useState<number>(5);
  const [cookingOilLiters, setCookingOilLiters] = useState<number>(2);
  const [foodKg, setFoodKg] = useState<number>(10);
  const [plasticKg, setPlasticKg] = useState<number>(4);
  const [diapers, setDiapers] = useState<number>(20);
  const [electronics, setElectronics] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  // Estimates for São Luís island
  const waterSavedLiters = (cookingOilLiters * 25000) + (clothesKg * 2700) + (plasticKg * 180);
  const co2AvoidedKg = (clothesKg * 3.6) + (plasticKg * 1.5) + (cookingOilLiters * 2.1) + (electronics * 8.5);
  const mealsProvided = Math.round(foodKg * 2.2);
  const elderlyHelped = Math.max(1, Math.round(diapers / 4));

  const handleShare = () => {
    const text = `Meu impacto na Ilha de São Luís com o AjudaMap (Echocreative): Preservei ${waterSavedLiters.toLocaleString()}L de água nos mangues, evitei ${co2AvoidedKg.toFixed(1)}kg de CO₂ e apoiei ${elderlyHelped} idoso(s) nos asilos da capital! Calcule o seu: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 bg-black text-white min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide mb-1.5">
            <span className="uppercase tracking-widest text-[11px] font-bold">Métricas de Preservação</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>São Luís — MA</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Calculadora de Impacto Socioambiental
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Estime como o descarte correto e as doações na capital maranhense poupam os manguezais da bacia do Bacanga e transformam vidas na Ilha.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Input Form */}
          <div className="lg:col-span-7 bg-neutral-900 rounded-2xl p-6 border border-neutral-800 shadow-xl space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 pb-2 border-b border-neutral-800">
              O que você destinou ou doou este mês em São Luís?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1 text-white">
                  <span>Roupas / Calçados p/ Bazar</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{clothesKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={clothesKg}
                  onChange={(e) => setClothesKg(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-white">
                  <span>Óleo de Cozinha em PET</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{cookingOilLiters} L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={cookingOilLiters}
                  onChange={(e) => setCookingOilLiters(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-white">
                  <span>Alimentos / Cestas Básicas</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{foodKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={foodKg}
                  onChange={(e) => setFoodKg(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-white">
                  <span>Plásticos & PET Reciclados</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{plasticKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={plasticKg}
                  onChange={(e) => setPlasticKg(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-white">
                  <span>Fraldas Geriátricas (Asilos)</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{diapers} un</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={diapers}
                  onChange={(e) => setDiapers(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-white">
                  <span>Aparelhos E-Lixo</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{electronics} un</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={electronics}
                  onChange={(e) => setElectronics(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
              * Estimativas baseadas em parâmetros socioambientais da Abrelpe, Instituto Akatu e da rede socioassistencial maranhense.
            </p>
          </div>

          {/* Results Showcase */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                  Impacto Calculado
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  São Luís · MA
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-lg shrink-0 border border-emerald-900/60">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Água Preservada nos Mangues</span>
                    <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums">
                      {waterSavedLiters.toLocaleString()} Litros
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-lg shrink-0 border border-emerald-900/60">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Emissões de CO₂ Evitadas</span>
                    <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums">
                      {co2AvoidedKg.toFixed(1)} kg CO₂e
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-lg shrink-0 border border-emerald-900/60">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Acolhimento Social</span>
                    <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums">
                      {mealsProvided} refeições & {elderlyHelped} idoso(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-800">
              <button
                onClick={handleShare}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>{copied ? 'Impacto Copiado!' : 'Compartilhar Meu Impacto'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
