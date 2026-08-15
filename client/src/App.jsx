import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { getCmsConfig } from './services/api';

// Layout Components
import Navbar from './components/layout/Navbar';
import WallOfShameTicker from './components/layout/WallOfShameTicker';
import Footer from './components/layout/Footer';
import CreatePostModal from './components/voice/CreatePostModal';

// Public Pages
import VoiceWallPage from './pages/VoiceWallPage';
import PoliticiansPage from './pages/PoliticiansPage';
import PoliticianDetailPage from './pages/PoliticianDetailPage';
import PromiseTrackerPage from './pages/PromiseTrackerPage';
import RtiFactoryPage from './pages/RtiFactoryPage';
import PetitionsPage from './pages/PetitionsPage';
import ConstituencyMapPage from './pages/ConstituencyMapPage';
import InstitutionsPage from './pages/InstitutionsPage';
import MemeStudioPage from './pages/MemeStudioPage';
import ProtestJukeboxPage from './pages/ProtestJukeboxPage';
import NetaCardsPage from './pages/NetaCardsPage';
import BountyBoardPage from './pages/BountyBoardPage';
import AndolanLivePage from './pages/AndolanLivePage';
import GrievancePortalPage from './pages/GrievancePortalPage';
import CmsSuperAdminPage from './pages/CmsSuperAdminPage';
import AboutPage from './pages/AboutPage';

// Role Dashboard Pages
import CitizenDashboard from './pages/dashboard/CitizenDashboard';
import RepresentativeDashboard from './pages/dashboard/RepresentativeDashboard';
import ModeratorDashboard from './pages/dashboard/ModeratorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Auto-routing Dashboard Dispatcher
function DashboardDispatcher() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FE]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin text-3xl text-brand-600">🏛️</div>
          <p className="text-xs font-mono font-bold text-slate-600">Authenticating role console...</p>
        </div>
      </div>
    );
  }

  if (user?.role === 'superadmin') return <AdminDashboard />;
  if (user?.role === 'representative') return <RepresentativeDashboard />;
  if (user?.role === 'moderator') return <ModeratorDashboard />;
  return <CitizenDashboard />;
}

// App shell with conditional public headers/footers
function AppContent({ showCreatePostModal, setShowCreatePostModal, announcement }) {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-900 flex flex-col selection:bg-brand-600 selection:text-white">
      {/* Global CMS Announcement Marquee if active & not inside dashboard */}
      {!isDashboardRoute && announcement && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-black py-1.5 px-4 text-xs font-bold text-center flex items-center justify-center space-x-2">
          <span>📢</span>
          <span>{announcement.message}</span>
        </div>
      )}

      {/* Live Wall of Fame vs Wall of Shame Top Ticker (Public routes only) */}
      {!isDashboardRoute && <WallOfShameTicker />}

      {/* Main Navbar (Public routes only) */}
      {!isDashboardRoute && <Navbar onOpenCreatePost={() => setShowCreatePostModal(true)} />}

      {/* Main Routing */}
      <main className="flex-1">
        <Routes>
          {/* Public Portal Routes */}
          <Route
            path="/"
            element={
              <VoiceWallPage
                showCreateModal={showCreatePostModal}
                onCloseCreateModal={() => setShowCreatePostModal(false)}
              />
            }
          />
          <Route path="/politicians" element={<PoliticiansPage />} />
          <Route path="/politicians/:id" element={<PoliticianDetailPage />} />
          <Route path="/promises" element={<PromiseTrackerPage />} />
          <Route path="/rti-factory" element={<RtiFactoryPage />} />
          <Route path="/petitions" element={<PetitionsPage />} />
          <Route path="/constituency-map" element={<ConstituencyMapPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/meme-studio" element={<MemeStudioPage />} />
          <Route path="/protest-jukebox" element={<ProtestJukeboxPage />} />
          <Route path="/neta-cards" element={<NetaCardsPage />} />
          <Route path="/bounties" element={<BountyBoardPage />} />
          <Route path="/andolan" element={<AndolanLivePage />} />
          <Route path="/grievance" element={<GrievancePortalPage />} />
          <Route path="/cms-admin" element={<CmsSuperAdminPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Role Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardDispatcher />} />
          <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
          <Route path="/dashboard/representative" element={<RepresentativeDashboard />} />
          <Route path="/dashboard/moderator" element={<ModeratorDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Global Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Footer (Public routes only) */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default function App() {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    getCmsConfig()
      .then((res) => {
        if (res.data?.success && res.data?.config?.announcement?.active) {
          setAnnouncement(res.data.config.announcement);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <AppContent
              showCreatePostModal={showCreatePostModal}
              setShowCreatePostModal={setShowCreatePostModal}
              announcement={announcement}
            />
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
