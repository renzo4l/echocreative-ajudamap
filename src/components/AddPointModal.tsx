import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationPoint, PointCategory } from '../types';
import { CATEGORIES_CONFIG, SÃO_LUIS_NEIGHBORHOODS, CARTO_VOYAGER_URL } from '../data/saoLuisData';
import { X, CheckCircle2, MapPin, Compass } from 'lucide-react';

interface AddPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPoint: (point: LocationPoint) => void;
  userCoords: [number, number] | null;
}

export const AddPointModal: React.FC<AddPointModalProps> = ({
  isOpen,
  onClose,
  onAddPoint,
  userCoords,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PointCategory>('ecoponto');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [hours, setHours] = useState('Seg a Sex: 08h às 17h');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [acceptedItemsText, setAcceptedItemsText] = useState('Roupas, Alimentos, Recicláveis');
  const [tips, setTips] = useState('');
  const [lat, setLat] = useState<number>(-2.5298);
  const [lng, setLng] = useState<number>(-44.2750);
  const [success, setSuccess] = useState(false);

  // Mini-map references
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);

  // Initialize and handle Mini-map inside modal
  useEffect(() => {
    if (!isOpen) {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      if (!miniMapInstanceRef.current) {
        const miniMap = L.map(miniMapContainerRef.current, {
          center: [lat, lng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer(CARTO_VOYAGER_URL, {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(miniMap);

        // Custom green pin for mini-map
        const pinIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 bg-emerald-600 rounded-full border-2 border-white shadow-lg animate-pulse">
              <span class="text-xs text-white">📍</span>
            </div>
          `,
          className: 'mini-map-picker-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(miniMap);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setLat(Number(pos.lat.toFixed(5)));
          setLng(Number(pos.lng.toFixed(5)));
        });

        // Click on map moves pin and updates coordinates
        miniMap.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          setLat(Number(e.latlng.lat.toFixed(5)));
          setLng(Number(e.latlng.lng.toFixed(5)));
        });

        miniMarkerRef.current = marker;
        miniMapInstanceRef.current = miniMap;
        miniMap.invalidateSize();
      } else {
        miniMapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Sync marker position when lat/lng change from external actions
  useEffect(() => {
    if (miniMarkerRef.current && miniMapInstanceRef.current) {
      miniMarkerRef.current.setLatLng([lat, lng]);
      miniMapInstanceRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  if (!isOpen) return null;

  const handleUseMyCoords = () => {
    if (userCoords) {
      setLat(Number(userCoords[0].toFixed(5)));
      setLng(Number(userCoords[1].toFixed(5)));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(Number(pos.coords.latitude.toFixed(5)));
        setLng(Number(pos.coords.longitude.toFixed(5)));
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !neighborhood.trim()) return;

    const catConfig = CATEGORIES_CONFIG.find((c) => c.id === category);

    const newPoint: LocationPoint = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      categoryLabel: catConfig?.label.split(' ')[0] || 'Ponto Comunitário',
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      city: 'São Luís',
      lat,
      lng,
      hours: hours.trim() || 'Horário comercial',
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      description: description.trim() || 'Ponto solidário adicionado pela comunidade de São Luís.',
      acceptedItems: acceptedItemsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tips: tips.trim() || undefined,
      verified: false,
      isCommunityAdded: true,
    };

    onAddPoint(newPoint);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-neutral-900 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden max-h-[92vh] flex flex-col text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-emerald-500" />

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Colaboração Cidadã
              </span>
              <h2 className="font-display font-bold text-lg text-white mt-0.5">
                Cadastrar Ponto em São Luís
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h3 className="font-bold text-base text-white">
                Ponto Cadastrado com Sucesso!
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                O local já está disponível no mapa de São Luís.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-200 mb-1">
                  Nome do Local *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ecoponto Central, Bazar Solidário da Esperança..."
                  className="w-full px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PointCategory)}
                    className="w-full px-2.5 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ecoponto">Ecoponto (Verde)</option>
                    <option value="bazar">Bazar (Vermelho)</option>
                    <option value="doacao">Doação (Amarelo)</option>
                    <option value="asilo">Asilo (Azul)</option>
                    <option value="reciclagem">Reciclagem & Coop (Preto)</option>
                  </select>
                </div>

                {/* Free Text Input for Neighborhood as requested */}
                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    Bairro de São Luís (Digite o bairro) *
                  </label>
                  <input
                    type="text"
                    required
                    list="sao-luis-bairros-sugestoes"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Centro Histórico, Calhau, Turu, Maiobão..."
                    className="w-full px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <datalist id="sao-luis-bairros-sugestoes">
                    {SÃO_LUIS_NEIGHBORHOODS.filter((b) => b !== 'Todos os Bairros').map((bairro) => (
                      <option key={bairro} value={bairro} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-200 mb-1">
                  Endereço ou Ponto de Referência *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua Grande c/ Rua do Passeio, próximo à Igreja..."
                  className="w-full px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Seg a Sex: 08h às 17h"
                    className="w-full px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    WhatsApp para Contato
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(98) 98888-0000"
                    className="w-full px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-200 mb-1">
                  Itens aceitos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={acceptedItemsText}
                  onChange={(e) => setAcceptedItemsText(e.target.value)}
                  placeholder="Roupas, Livros, Óleo, Alimentos, Fraldas"
                  className="w-full px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white text-xs placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Interactive Mini-Map for Coordinate Selection as requested */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-200 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Selecione a Posição no Mini Mapa Interativo:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleUseMyCoords}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Usar Meu GPS</span>
                  </button>
                </div>

                <div 
                  ref={miniMapContainerRef} 
                  className="w-full h-44 rounded-xl border border-neutral-700 overflow-hidden relative z-0 bg-neutral-950" 
                />

                <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400 px-1">
                  <span>💡 Clique ou arraste o pino no mini mapa para marcar o local exato</span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 border border-neutral-700 rounded-lg text-neutral-300 font-semibold hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer shadow-md transition-all"
                >
                  Publicar Ponto
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
