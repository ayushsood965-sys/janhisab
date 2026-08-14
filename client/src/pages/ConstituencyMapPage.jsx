import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getMapIssues, reportMapIssue, getConstituencyByPincode, getHawaMeter } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  Building,
  PlusCircle,
  Sparkles,
  X,
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ onPinDropped }) {
  useMapEvents({
    click(e) {
      onPinDropped(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ConstituencyMapPage() {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [hawaTrends, setHawaTrends] = useState([]);
  const [pincodeInput, setPincodeInput] = useState('110001');
  const [constituencyProfile, setConstituencyProfile] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Pin drop report modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinLat, setPinLat] = useState(28.6139);
  const [pinLng, setPinLng] = useState(77.209);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState('Road & Infrastructure');
  const [reporting, setReporting] = useState(false);

  const fetchMapData = async () => {
    try {
      const [issuesRes, hawaRes] = await Promise.all([
        getMapIssues(),
        getHawaMeter(),
      ]);
      if (issuesRes.data.success) setIssues(issuesRes.data.issues || []);
      if (hawaRes.data.success) setHawaTrends(hawaRes.data.hawaTrends || []);
    } catch (err) {
      console.warn('Map data error:', err.message);
    }
  };

  const handlePincodeSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pincodeInput.trim()) return;
    setPincodeLoading(true);
    try {
      const res = await getConstituencyByPincode(pincodeInput.trim());
      if (res.data.success) {
        setConstituencyProfile(res.data);
      }
    } catch (err) {
      alert('Could not resolve PIN code profile');
    } finally {
      setPincodeLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    handlePincodeSearch();
  }, []);

  const handleMapClick = (lat, lng) => {
    setPinLat(Math.round(lat * 10000) / 10000);
    setPinLng(Math.round(lng * 10000) / 10000);
    setShowPinModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to pin an issue.');
      return;
    }
    setReporting(true);
    try {
      const res = await reportMapIssue({
        title: issueTitle,
        category: issueCategory,
        lat: pinLat,
        lng: pinLng,
        state: constituencyProfile?.state || 'Delhi',
        constituency: constituencyProfile?.constituency || 'New Delhi',
      });
      if (res.data.success) {
        alert('🎉 Civic issue pinned to map! Fellow citizens can now corroborate.');
        setShowPinModal(false);
        setIssueTitle('');
        fetchMapData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error pinning issue');
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🗺️ CONSTITUENCY GEO-AUDIT</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">PIN-DROP ACCOUNTABILITY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Interactive Constituency & Issue Map
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Click anywhere on the map to drop a geotagged issue pin. Resolved issues boost local politician scores; ignored ones penalize them.
            </p>
          </div>

          {/* PIN Code Lookup Box */}
          <form onSubmit={handlePincodeSearch} className="flex items-center space-x-2.5 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-textMuted" />
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit PIN..."
                className="pl-9 pr-3.5 py-3 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary font-mono font-bold focus:outline-none focus:border-brand-500 w-48 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={pincodeLoading}
              className="px-5 py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all shadow-sm"
            >
              {pincodeLoading ? '...' : 'Audit PIN'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Map + Side Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaflet Map (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Live Ground Truth Map (Click map to drop issue pin)</span>
            </span>
            <span className="text-[10px] text-textMuted font-mono font-medium">
              🟢 Reported • 🟡 Acknowledged • 🔵 In Progress • ✅ Resolved
            </span>
          </div>

          <div className="h-[520px] rounded-3xl overflow-hidden border border-brand-200/80 shadow-glass relative z-0">
            <MapContainer
              center={[28.6139, 77.209]}
              zoom={11}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker onPinDropped={handleMapClick} />

              {issues.map((iss) => (
                <Marker key={iss.id} position={[iss.lat, iss.lng]}>
                  <Popup>
                    <div className="text-xs text-textPrimary p-1 space-y-1">
                      <p className="font-bold text-sm text-brand-900">{iss.title}</p>
                      <p className="text-[10px] text-slate-600">{iss.category} • {iss.constituency}</p>
                      <p className="font-bold text-emerald-700">Status: {iss.status.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500">Verified by {iss.corroborationCount || 1} citizens</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Column: PIN Code Profile & Hawa Meter */}
        <div className="space-y-6">
          {/* PIN Code Resolved Profile */}
          {constituencyProfile && (
            <div className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-glass space-y-3.5 glass-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-700 font-mono">
                  PIN: {constituencyProfile.pincode}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold">
                  {constituencyProfile.state}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-textPrimary font-['Outfit']">
                  {constituencyProfile.constituency} Constituency
                </h3>
                <p className="text-xs text-textSecondary">{constituencyProfile.district} District</p>
              </div>

              {constituencyProfile.demographics && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
                    <span className="text-[10px] text-textMuted uppercase font-mono block font-medium">Budget Sanctioned</span>
                    <span className="font-extrabold font-mono text-textPrimary">{constituencyProfile.demographics.budgetAllocatedCrores}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-mono block font-bold">Fund Utilized</span>
                    <span className="font-extrabold font-mono text-emerald-700">{constituencyProfile.demographics.budgetUtilizedCrores}</span>
                  </div>
                </div>
              )}

              {constituencyProfile.mp && (
                <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs space-y-1">
                  <span className="text-[10px] text-brand-800 uppercase font-mono block font-bold">Sitting Lok Sabha MP:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-textPrimary">{constituencyProfile.mp.name}</span>
                    <span className="font-mono font-extrabold text-brand-700">Score: {constituencyProfile.mp.impactScore}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌪️ Hawa Meter Widget */}
          <div className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-glass space-y-3.5 glass-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-brand-800 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>HAWA METER (TRENDING ISSUES)</span>
              </h3>
            </div>

            <div className="space-y-2">
              {hawaTrends.map((t) => (
                <div
                  key={t.rank}
                  className="p-3 rounded-2xl bg-brand-50/40 border border-brand-100 hover:border-brand-300 text-xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-brand-800 font-mono">{t.hashtag}</span>
                    <p className="text-[11px] text-textSecondary">{t.topic}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-mono font-bold">
                      {t.direction === 'exploding' ? '🔥 Exploding' : '📈 Growing'}
                    </span>
                    <p className="text-[9px] text-textMuted mt-0.5 font-mono">{t.postsCount} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pin Drop Issue Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-md w-full p-8 shadow-glass-lg relative glass-dropdown">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              📍 Pin Civic Issue to Location
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              Coords: {pinLat}, {pinLng} • Direct feedback loop to local leader rating.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Issue Description</label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Broken Bridge & Open Manhole"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Category</label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Road & Infrastructure">Road & Infrastructure</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={reporting}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {reporting ? 'Pinning...' : '📍 Drop Geotagged Issue Pin (+25 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
