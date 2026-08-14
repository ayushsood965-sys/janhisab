import React, { useEffect, useState } from 'react';
import { getInstitutions, submitInstitutionFeedback } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Search,
  Filter,
  Star,
  CheckCircle,
  AlertTriangle,
  HeartPulse,
  Shield,
  GraduationCap,
  Hammer,
  Sparkles,
  X,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Institutions' },
  { id: 'hospital', label: '🏥 Hospitals' },
  { id: 'police_station', label: '👮 Police Stations' },
  { id: 'municipality', label: '🚰 Municipal Wards' },
  { id: 'school', label: '🏫 Schools & Colleges' },
  { id: 'pwd', label: '🛣️ PWD' },
];

export default function InstitutionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Feedback modal state
  const [selectedInst, setSelectedInst] = useState(null);
  const [feedbackDims, setFeedbackDims] = useState({
    serviceQuality: 60,
    responsiveness: 60,
    cleanliness: 60,
    corruptionFreeScore: 60,
    infrastructureQuality: 60,
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchInstitutionsList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await getInstitutions(params);
      if (res.data.success) {
        setInstitutions(res.data.institutions || []);
      }
    } catch (err) {
      console.warn('Institutions fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutionsList();
  }, [category]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit structured feedback.');
      return;
    }
    setSubmittingFeedback(true);
    try {
      const res = await submitInstitutionFeedback(selectedInst._id, {
        dimensions: feedbackDims,
      });
      if (res.data.success) {
        alert('🎉 Structured feedback recorded! Earned +15 XP.');
        setSelectedInst(null);
        fetchInstitutionsList();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🏢 PUBLIC INSTITUTION AUDIT</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">BEYOND POLITICS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Hospitals, Police, Municipalities & Schools
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Public service delivery scorecards with citizen feedback on corruption-free service, cleanliness, and response latency.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-brand-100 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-gradient-cta text-white shadow-purple-glow'
                : 'text-textSecondary hover:text-brand-700 hover:bg-brand-50/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">🏢</div>
          <p className="text-xs text-textMuted font-semibold font-mono">Loading public institutions...</p>
        </div>
      ) : institutions.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white border border-brand-200/80 glass-card">
          <span className="text-4xl">📭</span>
          <h3 className="text-lg font-bold text-textPrimary mt-3 font-['Outfit']">No institutions found</h3>
          <p className="text-xs text-textSecondary mt-1">Try switching categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {institutions.map((inst) => (
            <div
              key={inst._id}
              className="p-8 rounded-3xl bg-white/95 border border-brand-200/70 shadow-glass hover:shadow-glass-hover transition-all glass-card flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-mono font-bold uppercase border border-brand-200">
                    {inst.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1.5 font-mono font-extrabold text-emerald-700 text-sm">
                    <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                    <span>{inst.overallScore}/100</span>
                    <span className="text-[11px] text-textMuted font-normal">({inst.ratingsCount} reviews)</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-textPrimary font-['Outfit'] leading-snug">
                  {inst.name}
                </h3>
                <p className="text-xs text-textMuted font-medium">{inst.address}</p>
                <p className="text-xs text-textSecondary">
                  Head Officer: <strong className="text-textPrimary">{inst.headOfficer}</strong> ({inst.headOfficerDesignation})
                </p>

                {/* Sub Dimensions */}
                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 block font-bold">Corruption-Free Score</span>
                    <span className="font-extrabold font-mono text-emerald-700 text-sm">{inst.dimensions?.corruptionFreeScore || 60}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-brand-50/60 border border-brand-100">
                    <span className="text-[10px] text-brand-800 block font-bold">Responsiveness</span>
                    <span className="font-extrabold font-mono text-brand-700 text-sm">{inst.dimensions?.responsiveness || 55}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                <span className="text-[11px] text-textMuted">
                  Budget: ₹{inst.budgetUtilizedCrores} / ₹{inst.budgetAllocatedCrores} Cr
                </span>
                <button
                  onClick={() => setSelectedInst(inst)}
                  className="px-5 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xs hover:bg-brand-100 font-['Outfit'] transition-colors"
                >
                  Rate Experience
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-md w-full p-8 shadow-glass-lg relative glass-dropdown">
            <button
              onClick={() => setSelectedInst(null)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Structured Service Feedback
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              "{selectedInst.name}"
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
              {[
                { key: 'serviceQuality', label: 'Service Quality & Staff Behavior' },
                { key: 'responsiveness', label: 'Responsiveness & Speed of Work' },
                { key: 'cleanliness', label: 'Hygiene & Cleanliness' },
                { key: 'corruptionFreeScore', label: 'Corruption-Free / Zero Bribe Experience' },
                { key: 'infrastructureQuality', label: 'Infrastructure & Equipment State' },
              ].map((d) => (
                <div key={d.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-textSecondary font-semibold">{d.label}</span>
                    <span className="font-mono font-extrabold text-brand-700">{feedbackDims[d.key]}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={feedbackDims[d.key]}
                    onChange={(e) =>
                      setFeedbackDims({ ...feedbackDims, [d.key]: Number(e.target.value) })
                    }
                    className="w-full accent-brand-600"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all mt-3 disabled:opacity-50"
              >
                {submittingFeedback ? 'Recording...' : 'Submit Structured Citizen Rating (+15 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
