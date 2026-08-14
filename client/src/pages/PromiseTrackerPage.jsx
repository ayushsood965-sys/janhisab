import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPromises, submitPromiseEvidence } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
  PlusCircle,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Infrastructure',
  'Healthcare',
  'Education',
  'Employment',
  'Agriculture',
  'Women Safety',
  'Environment',
  'Welfare Schemes',
];

export default function PromiseTrackerPage() {
  const { user, isAuthenticated } = useAuth();
  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sliderPosition, setSliderPosition] = useState(50);

  // Submit Evidence Modal State
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const fetchPromiseList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search) params.search = search;

      const res = await getPromises(params);
      if (res.data.success) {
        setPromises(res.data.promises || []);
      }
    } catch (err) {
      console.warn('Promise fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromiseList();
  }, [statusFilter, categoryFilter]);

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit ground truth evidence.');
      return;
    }
    setSubmittingEvidence(true);
    try {
      const res = await submitPromiseEvidence(selectedPromise._id, {
        title: evidenceTitle,
        description: evidenceDesc,
        evidenceUrl,
      });
      if (res.data.success) {
        alert('🎉 Ground evidence recorded on Promise timeline! +20 XP awarded.');
        setSelectedPromise(null);
        setEvidenceTitle('');
        setEvidenceDesc('');
        setEvidenceUrl('');
        fetchPromiseList();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting evidence');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  // Stats calculation
  const totalPromises = promises.length;
  const completedCount = promises.filter((p) => p.status === 'completed').length;
  const inProgressCount = promises.filter((p) => p.status === 'in_progress').length;
  const failedCount = promises.filter((p) => p.status === 'failed').length;
  const jumlaIndex = totalPromises > 0 ? Math.round((failedCount / totalPromises) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Hero */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🗳️ AI WADA TRACKER</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">MANIFESTO COMMIT LOG</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Promises vs Reality Tracker
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Every political manifesto pledge tracked like a GitHub commit. Community-audited with before/after photos and RTI status reports.
            </p>
          </div>

          {/* Jumla Index Box */}
          <div className="p-5 rounded-3xl bg-white border border-rose-200 flex items-center space-x-4 shrink-0 shadow-glass">
            <div>
              <span className="text-[10px] text-rose-800 uppercase font-mono block font-bold">🤥 Overall Jumla Index</span>
              <span className="text-3xl font-black font-mono text-rose-600">{jumlaIndex}% Broken</span>
              <p className="text-[10px] text-textSecondary mt-0.5">{failedCount} of {totalPromises} pledges failed</p>
            </div>
            <div className="text-4xl">🤥</div>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-brand-200/60">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-brand-100 shadow-xs">
            <span className="text-[10px] text-textMuted uppercase font-mono block font-medium">Total Tracked</span>
            <span className="text-lg font-bold font-mono text-textPrimary">{totalPromises} Pledges</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
            <span className="text-[10px] text-emerald-800 uppercase font-mono block font-bold">🟢 Verified Delivered</span>
            <span className="text-lg font-bold font-mono text-emerald-700">{completedCount} Completed</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
            <span className="text-[10px] text-amber-800 uppercase font-mono block font-bold">🟡 In Progress</span>
            <span className="text-lg font-bold font-mono text-amber-700">{inProgressCount} Active</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
            <span className="text-[10px] text-rose-800 uppercase font-mono block font-bold">🔴 Broken / Jumla</span>
            <span className="text-lg font-bold font-mono text-rose-700">{failedCount} Failed</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Status Filter Buttons */}
        <div className="flex overflow-x-auto no-scrollbar space-x-1.5 p-1.5 rounded-2xl bg-white/80 border border-brand-200/80 shadow-xs w-full sm:w-auto glass-pill">
          {[
            { id: 'all', label: 'All Pledges' },
            { id: 'completed', label: '🟢 Completed' },
            { id: 'in_progress', label: '🟡 In Progress' },
            { id: 'failed', label: '🔴 Failed / Jumla' },
            { id: 'not_started', label: '⚪ Not Started' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-cta text-white shadow-purple-glow'
                  : 'text-textSecondary hover:text-brand-700 hover:bg-brand-50/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-textMuted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPromiseList()}
              placeholder="Search promises, leaders..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-brand-200/80 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 shadow-xs font-medium"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-brand-200/80 text-xs text-textSecondary focus:outline-none font-semibold shadow-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Promises List */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">🗳️</div>
          <p className="text-xs text-textMuted font-semibold font-mono">Loading Wada Tracker records...</p>
        </div>
      ) : promises.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white border border-brand-200/80 glass-card">
          <span className="text-4xl">📭</span>
          <h3 className="text-lg font-bold text-textPrimary mt-3 font-['Outfit']">No promises match this filter</h3>
          <p className="text-xs text-textSecondary mt-1">Try switching to another category or status.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {promises.map((p) => (
            <div
              key={p._id}
              className="p-8 rounded-3xl bg-white/95 border border-brand-200/70 shadow-glass hover:shadow-glass-hover transition-all space-y-4 glass-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-mono font-bold">
                    {p.category} ({p.manifestoYear})
                  </span>
                  {p.politician && (
                    <Link
                      to={`/politicians/${p.politician._id}`}
                      className="text-xs font-bold text-brand-800 hover:text-brand-950 transition-colors"
                    >
                      👤 {p.politician.name} ({p.politician.constituency})
                    </Link>
                  )}
                </div>

                <span
                  className={`self-start sm:self-auto text-xs px-3.5 py-1 rounded-full font-bold uppercase ${
                    p.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : p.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {p.status.replace('_', ' ')} • {p.completionPercentage}% Delivery
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-textPrimary font-['Outfit']">{p.title}</h3>
                <p className="text-xs sm:text-sm text-textSecondary mt-1 leading-relaxed">{p.description}</p>
              </div>

              {/* Draggable Promise vs Reality Slider */}
              {p.promiseVsReality?.hasSlider && (
                <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-brand-800 uppercase font-mono flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>Draggable Promise vs Reality Contrast</span>
                    </h4>
                    <span className="text-[10px] text-textMuted font-medium">Drag slider to reveal ground reality</span>
                  </div>

                  <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden select-none border border-brand-200 shadow-sm">
                    {/* Reality Photo */}
                    <img
                      src={p.promiseVsReality.realityImageUrl}
                      alt="Reality"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-rose-900/90 text-white text-[10px] font-mono font-bold shadow-md">
                      {p.promiseVsReality.realityCaption}
                    </span>

                    {/* Promise Photo */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={p.promiseVsReality.promiseImageUrl}
                        alt="Promise"
                        className="w-full h-full object-cover max-w-none"
                        style={{ width: '100%' }}
                      />
                      <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-900/90 text-white text-[10px] font-mono font-bold shadow-md">
                        {p.promiseVsReality.promiseCaption}
                      </span>
                    </div>

                    {/* Draggable divider */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl flex items-center justify-center cursor-ew-resize"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-purple-glow border-2 border-white">
                        ↔
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>
                </div>
              )}

              {/* Timeline Commits */}
              {p.timeline && p.timeline.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-brand-800 uppercase font-mono">
                    Commit History & Milestones ({p.timeline.length})
                  </h5>
                  <div className="space-y-1.5">
                    {p.timeline.map((t, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-textPrimary">{t.title}</span>
                          <p className="text-[11px] text-textSecondary mt-0.5">{t.description}</p>
                        </div>
                        <span className="text-[10px] font-mono text-brand-700 font-bold">
                          {new Date(t.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Evidence CTA */}
              <div className="pt-3 flex items-center justify-between border-t border-brand-100">
                <span className="text-[11px] text-textMuted">
                  Community Evidence Submissions: <strong>{p.communityEvidenceCount || 0}</strong>
                </span>
                <button
                  onClick={() => setSelectedPromise(p)}
                  className="px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit Ground Proof</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Evidence Modal */}
      {selectedPromise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-lg w-full p-8 shadow-glass-lg relative glass-dropdown">
            <button
              onClick={() => setSelectedPromise(null)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Submit Ground Proof on Promise
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              "{selectedPromise.title}"
            </p>

            <form onSubmit={handleEvidenceSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. Hospital Wing Locked — Video Proof 14 Aug 2026"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Ground Observation</label>
                <textarea
                  required
                  rows={3}
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="State the ground facts observed..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Evidence URL / RTI Link</label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEvidence}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {submittingEvidence ? 'Recording Proof...' : 'Publish Evidence to Governance Timeline (+20 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
