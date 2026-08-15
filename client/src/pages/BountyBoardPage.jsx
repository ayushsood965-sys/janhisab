import React, { useEffect, useState } from 'react';
import { getBounties, contributeBounty, submitBountyProof, getGhotalaAwards, voteGhotalaAward } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Target,
  Award,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  Upload,
  Sparkles,
  ChevronRight,
  Flame,
  X,
} from 'lucide-react';

export default function BountyBoardPage() {
  const { user, isAuthenticated, updateUserPoints } = useAuth();
  const { toast } = useToast();
  const [bounties, setBounties] = useState([]);
  const [ghotalaAwards, setGhotalaAwards] = useState([]);
  const [activeTab, setActiveTab] = useState('bounties');
  const [loading, setLoading] = useState(true);

  // Contribute state
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [contribPoints, setContribPoints] = useState(50);
  const [contributing, setContributing] = useState(false);

  // Submit proof state
  const [proofBounty, setProofBounty] = useState(null);
  const [proofTitle, setProofTitle] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofSummary, setProofSummary] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  const fetchBountyData = async () => {
    setLoading(true);
    try {
      const [bRes, gRes] = await Promise.all([
        getBounties(),
        getGhotalaAwards(),
      ]);
      if (bRes.data.success) setBounties(bRes.data.bounties || []);
      if (gRes.data.success) setGhotalaAwards(gRes.data.awards || []);
    } catch (err) {
      console.warn('Bounty data error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBountyData();
  }, []);

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to pool Janta Points into investigation bounties.', 'Authentication Required');
      return;
    }
    setContributing(true);
    try {
      const res = await contributeBounty(selectedBounty._id, contribPoints);
      if (res.data.success) {
        toast.success(res.data.message || 'Points pooled to investigation escrow!', 'Bounty Funded');
        updateUserPoints(res.data.userRemainingPoints);
        setSelectedBounty(null);
        fetchBountyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error contributing to bounty');
    } finally {
      setContributing(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to submit investigation proof.', 'Authentication Required');
      return;
    }
    setSubmittingProof(true);
    try {
      const res = await submitBountyProof(proofBounty._id, {
        title: proofTitle,
        evidenceUrl: proofUrl,
        summary: proofSummary,
      });

      if (res.data.success) {
        toast.success('Investigation evidence submitted for Community Jury verification!', 'Evidence Logged');
        setProofBounty(null);
        setProofTitle('');
        setProofUrl('');
        setProofSummary('');
        fetchBountyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleVoteAward = async (nomineeId) => {
    if (!isAuthenticated) {
      toast.warning('Please log in to vote in Weekly Ghotala Awards.', 'Authentication Required');
      return;
    }
    try {
      const res = await voteGhotalaAward(nomineeId);
      if (res.data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        toast.success(res.data.message || 'Vote registered in Weekly Ghotala Awards!', 'Vote Cast');
        fetchBountyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error voting award');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🎯 INVESTIGATION BOUNTIES</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">CROWDFUNDED CIVIC TRUTH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Bounty Board & Ghotala Awards
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Citizens pool Janta Points to reward investigative journalists and RTI warriors who bring hard documents to light.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-brand-100 pb-2">
        <button
          onClick={() => setActiveTab('bounties')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'bounties'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🎯 Active Investigation Pools ({bounties.length})
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'awards'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🏆 Weekly "Ghotala Awards" Voting
        </button>
      </div>

      {/* TAB 1: Bounties Grid */}
      {activeTab === 'bounties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bounties.map((b) => (
            <div
              key={b._id}
              className="p-8 rounded-3xl bg-white/95 border border-brand-200/70 shadow-glass hover:shadow-glass-hover transition-all glass-card flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-mono font-bold border border-brand-200">
                    {b.category}
                  </span>
                  <div className="p-2 px-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-mono font-extrabold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{b.rewardPoolPoints} XP Prize Pool</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-textPrimary font-['Outfit'] leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{b.description}</p>

                {b.targetAuthority && (
                  <p className="text-xs text-textSecondary">
                    Target Authority: <strong className="text-textPrimary">{b.targetAuthority}</strong>
                  </p>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedBounty(b)}
                  className="px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  + Add XP to Pool
                </button>
                <button
                  onClick={() => setProofBounty(b)}
                  className="px-5 py-2 rounded-xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Claim & Submit Proof</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Ghotala Awards */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          {ghotalaAwards.map((award) => (
            <div key={award._id} className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-100">
                <div>
                  <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-mono font-bold border border-rose-200 uppercase">
                    WEEKLY CIVIC AWARDS ({award.weekPeriod})
                  </span>
                  <h3 className="text-2xl font-black text-textPrimary font-['Outfit'] mt-2">
                    {award.categoryName}
                  </h3>
                </div>
                <span className="text-xs text-textMuted font-mono">
                  Total Votes: {award.nominees?.reduce((a, b) => a + (b.votes || 0), 0) || 0}
                </span>
              </div>

              {/* Nominees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {award.nominees?.map((n) => (
                  <div
                    key={n._id}
                    className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100 hover:border-brand-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="text-xs font-bold text-textPrimary font-['Outfit'] block text-base">
                        {n.nomineeName}
                      </span>
                      <p className="text-xs text-brand-800 font-semibold">{n.party} ({n.constituency})</p>
                      <p className="text-[11px] text-textSecondary mt-2 leading-relaxed italic">
                        "{n.reasonCitation}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-brand-700">{n.votes} Votes</span>
                      <button
                        onClick={() => handleVoteAward(n._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-xs transition-all"
                      >
                        Vote 💀
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contribute Modal */}
      {selectedBounty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-md w-full p-8 shadow-glass-lg relative glass-dropdown">
            <button
              onClick={() => setSelectedBounty(null)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Add Points to Bounty Pool
            </h3>
            <p className="text-xs text-textSecondary mb-4">"{selectedBounty.title}"</p>

            <form onSubmit={handleContributeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Janta Points to Contribute</label>
                <input
                  type="number"
                  min="10"
                  max={user?.jantaPoints || 500}
                  value={contribPoints}
                  onChange={(e) => setContribPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary font-mono font-bold focus:outline-none focus:border-brand-500 shadow-xs"
                />
                <p className="text-[10px] text-textMuted mt-1">Available balance: {user?.jantaPoints || 0} XP</p>
              </div>

              <button
                type="submit"
                disabled={contributing}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50"
              >
                {contributing ? 'Transferring...' : `Contribute ${contribPoints} XP to Investigation Pool`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Claim & Submit Proof Modal */}
      {proofBounty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-lg w-full p-8 shadow-glass-lg relative my-8 glass-dropdown">
            <button
              onClick={() => setProofBounty(null)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Submit Investigation Proof
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              "{proofBounty.title}"
            </p>

            <form onSubmit={handleProofSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  value={proofTitle}
                  onChange={(e) => setProofTitle(e.target.value)}
                  placeholder="e.g. Certified Lab Report on PWD Road Thickness"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Evidence Document URL</label>
                <input
                  type="url"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or public RTI vault URL"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Investigation Summary</label>
                <textarea
                  required
                  rows={3}
                  value={proofSummary}
                  onChange={(e) => setProofSummary(e.target.value)}
                  placeholder="Describe how this document fulfills the investigation bounty criteria..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProof}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {submittingProof ? 'Submitting...' : 'Submit Claim to Community Jury'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
