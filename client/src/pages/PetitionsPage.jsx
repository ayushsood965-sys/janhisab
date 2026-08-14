import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPetitions, createPetition, signPetition, getPoliticians } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Flag,
  Users,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

export default function PetitionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [politiciansList, setPoliticiansList] = useState([]);

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Civic Infrastructure');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [targetOfficialDesignation, setTargetOfficialDesignation] = useState('');
  const [targetPoliticianId, setTargetPoliticianId] = useState('');
  const [signatureGoal, setSignatureGoal] = useState(1000);
  const [submitting, setSubmitting] = useState(false);

  const fetchPetitionsList = async () => {
    setLoading(true);
    try {
      const res = await getPetitions();
      if (res.data.success) {
        setPetitions(res.data.petitions || []);
      }
    } catch (err) {
      console.warn('Petition fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitionsList();
    getPoliticians({ limit: 50 }).then((res) => {
      if (res.data.success) setPoliticiansList(res.data.politicians || []);
    });
  }, []);

  const handleSign = async (petitionId) => {
    if (!isAuthenticated) {
      alert('Please log in or register an anonymous handle to sign.');
      return;
    }
    try {
      const res = await signPetition(petitionId, { comment: 'Signed in public interest.' });
      if (res.data.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        alert(res.data.message);
        fetchPetitionsList();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error signing petition');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to launch a petition.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createPetition({
        title,
        description,
        category,
        targetDepartment,
        targetOfficialDesignation,
        targetPoliticians: targetPoliticianId ? [targetPoliticianId] : [],
        signatureGoal: Number(signatureGoal),
      });

      if (res.data.success) {
        alert('🎉 Petition launched successfully! Auto-notice dispatch enabled.');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setTargetDepartment('');
        setTargetOfficialDesignation('');
        fetchPetitionsList();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error launching petition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🤝 PETITION ENGINE</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">ACTIONABLE CIVIC DEMANDS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Petitions That Actually Reach Officials
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Petitions with automatic milestone dispatch to District Collectors, MLAs, MPs, and departmental dashboards.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm flex items-center space-x-2 shrink-0 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Civic Petition</span>
          </button>
        </div>
      </div>

      {/* Petitions Grid */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">🤝</div>
          <p className="text-xs text-textMuted font-semibold font-mono">Loading public petitions...</p>
        </div>
      ) : petitions.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white border border-brand-200/80 glass-card">
          <span className="text-4xl">📭</span>
          <h3 className="text-lg font-bold text-textPrimary mt-3 font-['Outfit']">No petitions active</h3>
          <p className="text-xs text-textSecondary mt-1">Be the first to launch a community campaign!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {petitions.map((p) => {
            const pct = Math.min(100, Math.round((p.currentSignatures / p.signatureGoal) * 100));
            return (
              <div
                key={p._id}
                className="p-8 rounded-3xl bg-white/95 border border-brand-200/70 shadow-glass hover:shadow-glass-hover transition-all glass-card flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-mono font-bold border border-brand-200">
                      {p.category}
                    </span>
                    <span
                      className={`text-[10px] px-3 py-0.5 rounded-full font-extrabold uppercase font-mono ${
                        p.status === 'notice_dispatched'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-textPrimary font-['Outfit'] leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{p.description}</p>

                  {/* Target Authority */}
                  <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs space-y-1">
                    <span className="text-[10px] text-brand-800 uppercase font-mono font-bold block">Target Authority:</span>
                    <span className="font-bold text-textPrimary">{p.targetDepartment} ({p.targetOfficialDesignation})</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-textSecondary">
                        <strong>{p.currentSignatures.toLocaleString()}</strong> of {p.signatureGoal.toLocaleString()} Signatures
                      </span>
                      <span className="font-mono font-extrabold text-brand-700">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-brand-50 overflow-hidden border border-brand-100">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-[11px] text-textMuted font-medium">
                    Milestones: 100 → 1K → 10K → 1 Lakh
                  </span>
                  <button
                    onClick={() => handleSign(p._id)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center space-x-1.5 transition-all shadow-xs"
                  >
                    <span>✍️ Sign Petition</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Petition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-lg w-full p-8 shadow-glass-lg relative my-8 glass-dropdown">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Launch Civic Petition
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              Structured demands with verified signatures and automated official notices.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Petition Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Install CCTV & Emergency Help Poles on Sarojini Nagar Walkway"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Demand Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="State the public concern and specific requested government action..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Women Safety"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Signature Goal</label>
                  <select
                    value={signatureGoal}
                    onChange={(e) => setSignatureGoal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none shadow-xs font-semibold"
                  >
                    <option value={500}>500 Signatures</option>
                    <option value={1000}>1,000 Signatures</option>
                    <option value={5000}>5,000 Signatures</option>
                    <option value={10000}>10,000 Signatures</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Target Department & Designation</label>
                <input
                  type="text"
                  required
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  placeholder="e.g. Delhi Police & Municipal Corporation of Delhi"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs mb-2"
                />
                <input
                  type="text"
                  value={targetOfficialDesignation}
                  onChange={(e) => setTargetOfficialDesignation(e.target.value)}
                  placeholder="e.g. Deputy Commissioner of Police (South District)"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Tag Elected Leader (Optional)</label>
                <select
                  value={targetPoliticianId}
                  onChange={(e) => setTargetPoliticianId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none shadow-xs"
                >
                  <option value="">None</option>
                  {politiciansList.map((pol) => (
                    <option key={pol._id} value={pol._id}>{pol.name} ({pol.constituency})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? 'Launching...' : '🚀 Launch Petition (+30 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
