/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_POINTS } from './data/saoLuisData';
import { LocationPoint } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InteractiveMap } from './components/InteractiveMap';
import { DirectoryList } from './components/DirectoryList';
import { PointDetailModal } from './components/PointDetailModal';
import { AddPointModal } from './components/AddPointModal';
import { ImpactCalculator } from './components/ImpactCalculator';
import { CommunityBoard } from './components/CommunityBoard';
import { RecyclingGuide } from './components/RecyclingGuide';
import { AdminPanel } from './components/AdminPanel';
import { BottomNav } from './components/BottomNav';
import { CulturalFooter } from './components/CulturalFooter';

const LOCAL_STORAGE_KEY = 'ajudamap_custom_points';
const DELETED_POINTS_KEY = 'ajudamap_deleted_points';

export default function App() {
  // Determine initial route based on URL pathname or hash (e.g. /admin or #admin)
  const getInitialTab = (): string => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin') {
        return 'admin';
      }
      if (hash === '#calculadora') return 'calculadora';
      if (hash === '#mural') return 'mural';
      if (hash === '#guia') return 'guia';
    }
    return 'mapa';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // Sync route changes with browser history / URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'admin') {
        window.history.pushState(null, '', '/admin');
      } else if (tab === 'mapa') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `#${tab}`);
      }
    }
  };

  // Handle browser popstate / back-forward navigation
  useEffect(() => {
    const onPopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  // Points state
  const [points, setPoints] = useState<LocationPoint[]>(() => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_POINTS_KEY) || '[]');
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      let combined = INITIAL_POINTS;
      if (saved) {
        const parsed = JSON.parse(saved);
        combined = [...parsed, ...INITIAL_POINTS];
      }
      return combined.filter((p) => !deletedIds.includes(p.id));
    } catch {
      return INITIAL_POINTS;
    }
  });

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; provider: string }>({
    connected: true,
    provider: 'PostgreSQL Supabase',
  });

  // Fetch points from PostgreSQL backend on mount
  useEffect(() => {
    const fetchPointsFromDb = async () => {
      try {
        const res = await fetch('/api/points');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPoints(data);
            setDbStatus({ connected: true, provider: 'PostgreSQL Supabase (Online)' });
          }
        }
      } catch (err) {
        // Fallback to local points
        console.warn('Backend API offline, operating in local mode:', err);
        setDbStatus({ connected: false, provider: 'Modo Local (Cache)' });
      }
    };

    fetchPointsFromDb();
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');

  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter points cleanly with free-text neighborhood match
  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesAddress = p.address.toLowerCase().includes(q);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesItems = p.acceptedItems.some((item) => item.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesNeighborhood && !matchesDesc && !matchesItems) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (selectedNeighborhood.trim()) {
        const nQ = selectedNeighborhood.toLowerCase().trim();
        if (!p.neighborhood.toLowerCase().includes(nQ)) {
          return false;
        }
      }

      if (selectedMaterial !== 'all') {
        const matQ = selectedMaterial.toLowerCase();
        const hasMat = p.acceptedItems.some((it) => it.toLowerCase().includes(matQ));
        if (!hasMat) return false;
      }

      return true;
    });
  }, [points, searchQuery, selectedCategory, selectedNeighborhood, selectedMaterial]);

  // Handle Geolocation
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não disponível no navegador.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
        showToast('Localização detectada em São Luís!');
      },
      () => {
        setUserCoords([-2.5298, -44.2750]);
        setIsLocating(false);
        showToast('Centralizado em São Luís.');
      },
      { timeout: 7000 }
    );
  };

  const handleSelectPoint = (point: LocationPoint) => {
    setSelectedPoint(point);
    setIsDetailModalOpen(true);
  };

  // Add Point with PostgreSQL persistence
  const handleAddPoint = async (newPoint: LocationPoint) => {
    const updated = [newPoint, ...points];
    setPoints(updated);

    try {
      const customOnly = updated.filter((p) => p.isCommunityAdded);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // ignore
    }

    // Persist to backend database
    try {
      await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoint),
      });
    } catch (err) {
      console.warn('Could not sync to backend:', err);
    }

    setSelectedPoint(newPoint);
    showToast(`"${newPoint.name}" adicionado ao banco de dados!`);
  };

  // Delete Point with PostgreSQL persistence
  const handleDeletePoint = async (pointId: string) => {
    const pointToDelete = points.find((p) => p.id === pointId);
    const updated = points.filter((p) => p.id !== pointId);
    setPoints(updated);

    try {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_POINTS_KEY) || '[]');
      if (!deletedIds.includes(pointId)) {
        deletedIds.push(pointId);
        localStorage.setItem(DELETED_POINTS_KEY, JSON.stringify(deletedIds));
      }
      const customOnly = updated.filter((p) => p.isCommunityAdded);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // ignore
    }

    // Persist deletion to PostgreSQL
    try {
      await fetch(`/api/points/${encodeURIComponent(pointId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Could not sync deletion to backend:', err);
    }

    showToast(`Ponto "${pointToDelete?.name || ''}" removido.`);
    if (selectedPoint?.id === pointId) {
      setSelectedPoint(null);
      setIsDetailModalOpen(false);
    }
  };

  // Update Point details in PostgreSQL
  const handleUpdatePoint = async (updatedPoint: LocationPoint) => {
    setPoints((prev) => prev.map((p) => (p.id === updatedPoint.id ? updatedPoint : p)));

    try {
      await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPoint),
      });
    } catch (err) {
      console.warn('Could not sync edit to backend:', err);
    }

    showToast(`Ponto "${updatedPoint.name}" atualizado no PostgreSQL.`);
  };

  // Toggle Point Verified in PostgreSQL
  const handleToggleVerifyPoint = async (pointId: string) => {
    const current = points.find((p) => p.id === pointId);
    const nextState = !current?.verified;

    setPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, verified: nextState } : p))
    );

    try {
      await fetch(`/api/points/${encodeURIComponent(pointId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: nextState }),
      });
    } catch (err) {
      console.warn('Could not sync verification to backend:', err);
    }

    showToast(`Status verificado atualizado.`);
  };

  // Reset to original points in PostgreSQL
  const handleResetDefaultPoints = async () => {
    localStorage.removeItem(DELETED_POINTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPoints(INITIAL_POINTS);

    try {
      await fetch('/api/points/reset', { method: 'POST' });
    } catch (err) {
      console.warn('Could not reset in backend:', err);
    }

    showToast('Pontos originais de São Luís restaurados no PostgreSQL.');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-neutral-100 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[999999] bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl border border-emerald-500/40 animate-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        pointsCount={points.length}
      />

      {/* Multi-Page Route Content */}
      <main className="flex-1 bg-black">
        {/* Page 1: Mapa da Ilha */}
        {activeTab === 'mapa' && (
          <div className="animate-in fade-in duration-150">
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onNearMe={handleNearMe}
              isLocating={isLocating}
              pointsTotal={points.length}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: Leaflet Map with Carto Voyager URL */}
                <div className="lg:col-span-7 xl:col-span-8 order-1 relative z-0">
                  <InteractiveMap
                    points={filteredPoints}
                    selectedPoint={selectedPoint}
                    onSelectPoint={handleSelectPoint}
                    userCoords={userCoords}
                  />
                </div>

                {/* Right: Clean Directory List */}
                <div className="lg:col-span-5 xl:col-span-4 order-2">
                  <DirectoryList
                    points={filteredPoints}
                    selectedPoint={selectedPoint}
                    onSelectPoint={handleSelectPoint}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedNeighborhood={selectedNeighborhood}
                    setSelectedNeighborhood={setSelectedNeighborhood}
                    selectedMaterial={selectedMaterial}
                    setSelectedMaterial={setSelectedMaterial}
                    userCoords={userCoords}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 2: Calculadora de Impacto */}
        {activeTab === 'calculadora' && (
          <div className="animate-in fade-in duration-150">
            <ImpactCalculator />
          </div>
        )}

        {/* Page 3: Mural da Ilha */}
        {activeTab === 'mural' && (
          <div className="animate-in fade-in duration-150">
            <CommunityBoard />
          </div>
        )}

        {/* Page 4: Guia Cultural & Descarte */}
        {activeTab === 'guia' && (
          <div className="animate-in fade-in duration-150">
            <RecyclingGuide />
          </div>
        )}

        {/* Page 5: Painel Admin (Acessível via /admin ou aba Admin) */}
        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-150">
            <AdminPanel
              points={points}
              onDeletePoint={handleDeletePoint}
              onToggleVerifyPoint={handleToggleVerifyPoint}
              onUpdatePoint={handleUpdatePoint}
              onResetDefaultPoints={handleResetDefaultPoints}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onSelectPoint={handleSelectPoint}
              onGoToPublicMap={() => handleTabChange('mapa')}
              dbStatus={dbStatus}
            />
          </div>
        )}
      </main>

      {/* Dedicated Bottom Navigation present on each category */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Point Detail Modal */}
      {isDetailModalOpen && (
        <PointDetailModal
          point={selectedPoint}
          onClose={() => setIsDetailModalOpen(false)}
          onDeletePoint={handleDeletePoint}
          isAdmin={activeTab === 'admin'}
        />
      )}

      {/* Add Point Modal with interactive mini-map and free neighborhood input */}
      <AddPointModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPoint={handleAddPoint}
        userCoords={userCoords}
      />

      {/* Cultural Footer */}
      <CulturalFooter />
    </div>
  );
}
