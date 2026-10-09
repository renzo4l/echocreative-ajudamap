import React, { useState, useMemo } from 'react';
import { LocationPoint, PointCategory } from '../types';
import { CATEGORIES_CONFIG, SÃO_LUIS_NEIGHBORHOODS } from '../data/saoLuisData';
import { Logo } from './Logo';
import {
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  RotateCcw,
  Download,
  Edit3,
  ExternalLink,
  Database,
  Lock,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
  Check,
  X,
  MapPin
} from 'lucide-react';

interface AdminPanelProps {
  points: LocationPoint[];
  onDeletePoint: (pointId: string) => Promise<void> | void;
  onToggleVerifyPoint: (pointId: string) => Promise<void> | void;
  onUpdatePoint?: (point: LocationPoint) => Promise<void> | void;
  onResetDefaultPoints: () => Promise<void> | void;
  onOpenAddModal: () => void;
  onSelectPoint: (point: LocationPoint) => void;
  onGoToPublicMap: () => void;
  dbStatus?: { connected: boolean; provider: string };
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  points,
  onDeletePoint,
  onToggleVerifyPoint,
  onUpdatePoint,
  onResetDefaultPoints,
  onOpenAddModal,
  onSelectPoint,
  onGoToPublicMap,
  dbStatus = { connected: true, provider: 'PostgreSQL Supabase' },
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ajudamap_admin_auth') === 'true';
  });
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'community'>('all');

  // Modals inside admin
  const [pointToDelete, setPointToDelete] = useState<LocationPoint | null>(null);
  const [editingPoint, setEditingPoint] = useState<LocationPoint | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<PointCategory>('ecoponto');
  const [editAddress, setEditAddress] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editItems, setEditItems] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey.trim() === 'echoadmin2026' || passkey.trim() === 'admin' || passkey.trim() === 'Maumau1612!@') {
      setIsAuthenticated(true);
      localStorage.setItem('ajudamap_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Senha de administrador incorreta. Tente "echoadmin2026" ou a senha do banco.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ajudamap_admin_auth');
  };

  // Open Edit Modal
  const openEditModal = (point: LocationPoint) => {
    setEditingPoint(point);
    setEditName(point.name);
    setEditCategory(point.category);
    setEditAddress(point.address);
    setEditNeighborhood(point.neighborhood);
    setEditHours(point.hours);
    setEditPhone(point.phone || '');
    setEditWhatsapp(point.whatsapp || '');
    setEditDescription(point.description);
    setEditItems(point.acceptedItems.join(', '));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    const catConfig = CATEGORIES_CONFIG.find((c) => c.id === editCategory);
    const updated: LocationPoint = {
      ...editingPoint,
      name: editName.trim(),
      category: editCategory,
      categoryLabel: catConfig?.label.split(' ')[0] || editingPoint.categoryLabel,
      address: editAddress.trim(),
      neighborhood: editNeighborhood.trim(),
      hours: editHours.trim(),
      phone: editPhone.trim() || undefined,
      whatsapp: editWhatsapp.trim() || undefined,
      description: editDescription.trim(),
      acceptedItems: editItems.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (onUpdatePoint) {
      await onUpdatePoint(updated);
    }
    setEditingPoint(null);
  };

  // Filtered Points
  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesNeigh = p.neighborhood.toLowerCase().includes(q);
        const matchesAddr = p.address.toLowerCase().includes(q);
        if (!matchesName && !matchesNeigh && !matchesAddr) return false;
      }
      if (selectedFilterCategory !== 'all' && p.category !== selectedFilterCategory) {
        return false;
      }
      if (selectedStatusFilter === 'verified' && !p.verified) return false;
      if (selectedStatusFilter === 'unverified' && p.verified) return false;
      if (selectedStatusFilter === 'community' && !p.isCommunityAdded) return false;
      return true;
    });
  }, [points, search, selectedFilterCategory, selectedStatusFilter]);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(points, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ajudamap_pontos_saoluis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Categoria', 'Bairro', 'Endereço', 'Horário', 'Telefone', 'WhatsApp', 'Verificado', 'Comunidade'];
    const rows = points.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      `"${p.neighborhood}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.hours}"`,
      p.phone || '',
      p.whatsapp || '',
      p.verified ? 'SIM' : 'NÃO',
      p.isCommunityAdded ? 'SIM' : 'NÃO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `ajudamap_saoluis_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Count metrics
  const communityCount = points.filter((p) => p.isCommunityAdded).length;
  const verifiedCount = points.filter((p) => p.verified).length;
  const categoryCounts: Record<string, number> = {};
  points.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // --- LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="h-1.5 w-full bg-emerald-500 absolute top-0 left-0" />

          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="md" showSubtitle={false} className="mb-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700 mb-1">
              Painel Restrito
            </span>
            <h1 className="font-display font-extrabold text-2xl text-white">
              Administração AjudaMap
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Acesso exclusivo para gestão de dados e moderação da plataforma em São Luís.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Chave de Acesso Admin
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Digite a chave (ex: echoadmin2026)"
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {authError && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Entrar no Painel Admin
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
            <button
              onClick={onGoToPublicMap}
              className="text-xs text-neutral-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>← Voltar ao Mapa Público de São Luís</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="py-8 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header with Logo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <Logo size="md" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="uppercase tracking-widest text-[11px] font-bold">Painel de Controle Admin</span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400 font-normal">URL: /admin</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Gestão da Base de Dados · São Luís
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onGoToPublicMap}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Mapa Público</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Ponto</span>
            </button>

            <button
              onClick={handleLogout}
              title="Sair do painel"
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 rounded-xl cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Database Connection Status Banner */}
        <div className="my-5 p-3.5 bg-neutral-900/90 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-neutral-300 font-medium">Banco de Dados Ativo: </span>
              <strong className="text-emerald-400">{dbStatus.provider}</strong>
              <span className="text-neutral-500 ml-2">({points.length} registros persistidos)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-medium border border-neutral-700 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-medium border border-neutral-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-400 block">Total de Locais</span>
            <span className="text-2xl font-bold text-white tabular-nums">{points.length}</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Em toda a ilha de São Luís</span>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-400 block">Submissões Cidadãs</span>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{communityCount}</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Cadastrados pela comunidade</span>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-400 block">Selo Verificado</span>
            <span className="text-2xl font-bold text-blue-400 tabular-nums">{verifiedCount}</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Auditados pela moderação</span>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-medium text-neutral-400 block">Manutenção da Base</span>
            <button
              onClick={() => {
                if (window.confirm('Atenção: deseja restaurar os pontos padrão iniciais de São Luís?')) {
                  onResetDefaultPoints();
                }
              }}
              className="text-[11px] font-semibold text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors mt-1"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Restaurar Originais</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nome, bairro (ex: Calhau, Turu) ou endereço..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedFilterCategory}
                onChange={(e) => setSelectedFilterCategory(e.target.value)}
                className="text-xs py-2 px-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Todas as Categorias</option>
                <option value="ecoponto">Ecopontos (Verdes)</option>
                <option value="bazar">Bazares (Vermelhos)</option>
                <option value="doacao">Doações (Amarelos)</option>
                <option value="asilo">Asilos (Azuis)</option>
                <option value="reciclagem">Reciclagem (Pretos)</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="text-xs py-2 px-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Todos os Status</option>
                <option value="verified">Apenas Verificados</option>
                <option value="unverified">Apenas Pendentes</option>
                <option value="community">Apenas Comunidade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Points Management Table */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Listando <strong>{filteredPoints.length}</strong> de {points.length} pontos cadastrados</span>
          </div>

          <div className="divide-y divide-neutral-800">
            {filteredPoints.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                Nenhum ponto encontrado com os filtros selecionados.
              </div>
            ) : (
              filteredPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onSelectPoint(point)}>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs mb-1">
                      <span className="font-semibold text-emerald-400">{point.categoryLabel}</span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span className="text-white font-medium">Bairro {point.neighborhood}</span>
                      {point.isCommunityAdded && (
                        <span className="text-[10px] bg-neutral-800 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          Comunidade
                        </span>
                      )}
                      {point.verified ? (
                        <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          ✓ Verificado
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded">
                          Pendente
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-white leading-tight">
                      {point.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      📍 {point.address} — <span className="text-neutral-500">{point.hours}</span>
                    </p>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => openEditModal(point)}
                      title="Editar detalhes do ponto"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => onToggleVerifyPoint(point.id)}
                      title="Alternar verificação"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        point.verified
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800 hover:bg-blue-900'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {point.verified ? 'Verificado' : 'Verificar'}
                    </button>

                    <button
                      onClick={() => setPointToDelete(point)}
                      title="Excluir este ponto do banco de dados"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-white border border-red-900/50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal: Delete Confirmation */}
        {pointToDelete && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-red-500/40 rounded-2xl p-6 text-white shadow-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-white">Confirmar Exclusão</h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    Deseja remover definitivamente <strong>"{pointToDelete.name}"</strong> ({pointToDelete.neighborhood}) do banco de dados de São Luís?
                  </p>
                  <div className="flex items-center gap-2 mt-5">
                    <button
                      onClick={() => {
                        onDeletePoint(pointToDelete.id);
                        setPointToDelete(null);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Confirmar Exclusão
                    </button>
                    <button
                      onClick={() => setPointToDelete(null)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Point */}
        {editingPoint && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Editar Ponto no PostgreSQL</span>
                </h3>
                <button onClick={() => setEditingPoint(null)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Nome do Local</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Categoria</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as PointCategory)}
                      className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                    >
                      <option value="ecoponto">Ecoponto (Verde)</option>
                      <option value="bazar">Bazar (Vermelho)</option>
                      <option value="doacao">Doação (Amarelo)</option>
                      <option value="asilo">Asilo (Azul)</option>
                      <option value="reciclagem">Reciclagem (Preto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Bairro de São Luís</label>
                    <input
                      type="text"
                      required
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Horário</label>
                    <input
                      type="text"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Itens Aceitos (por vírgula)</label>
                  <input
                    type="text"
                    value={editItems}
                    onChange={(e) => setEditItems(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditingPoint(null)}
                    className="px-3.5 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
