import React, { useState } from 'react';
import { LocationPoint, PointCategory } from '../types';
import { X, MapPin, Clock, Phone, Navigation, Share2, Sparkles, Trash2, AlertTriangle } from 'lucide-react';

interface PointDetailModalProps {
  point: LocationPoint | null;
  onClose: () => void;
  onDeletePoint?: (pointId: string) => void;
  isAdmin?: boolean;
}

const CATEGORY_COLORS: Record<PointCategory, { pin: string; text: string }> = {
  ecoponto: { pin: '#16a34a', text: '#ffffff' },
  bazar: { pin: '#dc2626', text: '#ffffff' },
  doacao: { pin: '#eab308', text: '#000000' },
  asilo: { pin: '#2563eb', text: '#ffffff' },
  reciclagem: { pin: '#171717', text: '#ffffff' },
};

export const PointDetailModal: React.FC<PointDetailModalProps> = ({
  point,
  onClose,
  onDeletePoint,
  isAdmin = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!point) return null;

  const colorTheme = CATEGORY_COLORS[point.category] || CATEGORY_COLORS.ecoponto;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${point.name} - ${point.address}, ${point.neighborhood}, São Luís - MA`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `AjudaMap São Luís: ${point.name} (${point.categoryLabel}) em ${point.neighborhood}. Aceita: ${point.acceptedItems.slice(0, 3).join(', ')}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AjudaMap São Luís - ${point.name}`,
          text,
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleDelete = () => {
    if (onDeletePoint) {
      onDeletePoint(point.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden max-h-[90vh] flex flex-col text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar with category color */}
        <div className="h-2 w-full" style={{ backgroundColor: colorTheme.pin }} />

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                <span className="px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: colorTheme.pin, color: colorTheme.text }}>
                  {point.categoryLabel}
                </span>
                <span aria-hidden="true" className="text-neutral-500">·</span>
                <span className="text-neutral-300">{point.neighborhood}</span>
                {point.isCommunityAdded && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Comunidade
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-xl text-white leading-tight">
                {point.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {point.description}
          </p>

          {/* Key Information */}
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 bg-neutral-800/80 rounded-xl border border-neutral-700/70">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-white block">Endereço</span>
                <span className="text-neutral-300">{point.address} — {point.neighborhood}, São Luís</span>
              </div>
              <button
                onClick={handleCopyAddress}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded-md cursor-pointer"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-neutral-800/80 rounded-xl border border-neutral-700/70">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Funcionamento</span>
                <span className="text-neutral-300">{point.hours}</span>
              </div>
            </div>

            {point.phone && (
              <div className="flex items-start gap-2.5 p-2.5 bg-neutral-800/80 rounded-xl border border-neutral-700/70">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Telefone</span>
                  <span className="text-neutral-300">{point.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Accepted Materials */}
          <div className="mt-4">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
              Itens & Resíduos Aceitos
            </h4>
            <div className="flex flex-wrap gap-1">
              {point.acceptedItems.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-neutral-800 text-neutral-200 border border-neutral-700 px-2.5 py-1 rounded-md font-medium"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Tips / Ludovicense Note */}
          {point.tips && (
            <div className="mt-4 p-3 bg-neutral-800/90 border border-emerald-500/30 rounded-xl flex items-start gap-2 text-xs text-neutral-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-400 block">Dica para a Ilha:</span>
                <p className="mt-0.5 leading-relaxed text-neutral-300">{point.tips}</p>
              </div>
            </div>
          )}

          {/* Confirmation Box for Remove Point */}
          {confirmDelete && (
            <div className="mt-4 p-3 bg-red-950/70 border border-red-500/40 rounded-xl animate-in fade-in">
              <div className="flex items-start gap-2 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-red-100">Deseja remover este ponto do AjudaMap?</span>
                  <p className="mt-0.5 text-[11px] text-red-300">
                    O ponto "{point.name}" será removido do mapa e do banco de locais.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Sim, Confirmar Exclusão
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action footer with Remove Point & Routes */}
        <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shared ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            {/* Remove Point Button as requested */}
            {onDeletePoint && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Remover este ponto"
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg hover:bg-red-900/40 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {point.whatsapp && (
              <a
                href={`https://wa.me/55${point.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20encontrei%20no%20AjudaMap%20S%C3%A3o%20Lu%C3%ADs!`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-bold text-emerald-400 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700"
              >
                WhatsApp
              </a>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Rota GPS</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
