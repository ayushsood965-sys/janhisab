import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPoliticianById, submitRating, submitRightOfReply, setPoliticianAnthem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  CheckCircle,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Music,
  Send,
  X,
} from 'lucide-react';

export default function PoliticianDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated, updateUserPoints } = useAuth();
  const [politician, setPolitician] = useState(null);
  const [promises, setPromises] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Quadratic Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [voteCredits, setVoteCredits] = useState(1);
  const [evidenceTier, setEvidenceTier] = useState(3);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [dimensions, setDimensions] = useState({
    infrastructure: 50,
    accessibility: 50,
    promiseKeeping: 50,
    transparency: 50,
    legislative: 50,
    social: 50,
    economic: 50,
  });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Right of Reply State
  const [replyText, setReplyText] = useState('');
  const [replyDesignation, setReplyDesignation] = useState('');
  const [replyDocUrl, setReplyDocUrl] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Promise vs Reality Slider State
  const [sliderPosition, setSliderPosition] = useState(50);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getPoliticianById(id);
      if (res.data.success) {
        setPolitician(res.data.politician);
        setPromises(res.data.promises || []);
        setTaggedPosts(res.data.taggedPosts || []);
        if (res.data.politician.dimensions) {
          setDimensions(res.data.politician.dimensions);
        }
      }
    } catch (err) {
      console.warn('Politician profile fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in or create an anonymous handle to vote.');
      return;
    }
    setRatingSubmitting(true);
    try {
      const res = await submitRating({
        politicianId: politician._id,
        dimensions,
        votesCount: voteCredits,
        evidenceTier: Number(evidenceTier),
        evidenceUrl,
      });

      if (res.data.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        alert(res.data.message);
        setShowRatingModal(false);
        updateUserPoints(res.data.userRemainingPoints, res.data.userKarmaTier);
        fetchProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleRightOfReplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in as a verified representative to publish a response.');
      return;
    }
    setReplySubmitting(true);
    try {
      const res = await submitRightOfReply(politician._id, {
        designation: replyDesignation,
        text: replyText,
        documentUrl: replyDocUrl,
      });

      if (res.data.success) {
        alert(res.data.message);
        setReplyText('');
        setReplyDesignation('');
        setReplyDocUrl('');
        fetchProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">⚖️</div>
        <p className="text-xs text-textMuted font-semibold font-mono">Compiling 4-Pillar civic audit profile...</p>
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-textPrimary">Politician profile not found</h2>
        <Link to="/politicians" className="text-brand-700 font-bold text-xs mt-2 inline-block hover:underline">
          ← Return to Directory
        </Link>
      </div>
    );
  }

  const getBadgeStyle = (tier) => {
    switch (tier) {
      case 'Janta ka Sher':
        return { icon: '🦁', color: 'text-amber-900 bg-amber-50 border-amber-300' };
      case 'Kaam Karne Wala':
        return { icon: '🌟', color: 'text-emerald-900 bg-emerald-50 border-emerald-300' };
      case 'Theek Hai':
        return { icon: '😐', color: 'text-blue-900 bg-blue-50 border-blue-200' };
      case 'Sust Neta':
        return { icon: '🐌', color: 'text-orange-900 bg-orange-50 border-orange-200' };
      case 'Jumla Champion':
        return { icon: '🤡', color: 'text-purple-900 bg-purple-50 border-purple-300' };
      default:
        return { icon: '💀', color: 'text-rose-900 bg-rose-50 border-rose-300' };
    }
  };

  const badge = getBadgeStyle(politician.badgeTier);
  const m = politician.metrics || {};
  const a = politician.assets || {};
  const b = politician.scoreBreakdown || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-textMuted">
        <Link to="/politicians" className="hover:text-brand-700 font-medium">Politicians</Link>
        <span>/</span>
        <span>{politician.state}</span>
        <span>/</span>
        <span className="text-textPrimary font-bold">{politician.name}</span>
      </div>

      {/* Main Profile Hero Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white/95 border border-brand-200/80 shadow-glass-lg glass-card relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          {/* Politician Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={politician.photo}
              alt={politician.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-brand-200 shadow-md bg-brand-50 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-3 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-mono font-bold">
                  {politician.house}
                </span>
                <span className="text-xs text-textMuted font-medium">{politician.education} • Age {politician.age}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient-hero font-['Outfit'] mt-1.5">
                {politician.name}
              </h1>
              <p className="text-sm text-brand-900 font-semibold mt-0.5">
                {politician.party} <span className="text-brand-600 font-mono font-bold">({politician.partySymbol})</span> • {politician.constituency}, {politician.state}
              </p>
              <p className="text-xs text-textSecondary mt-1">
                Role: <strong className="text-textPrimary">{politician.roleTitle}</strong>
              </p>
            </div>
          </div>

          {/* Impact Score Hero Banner */}
          <div className="flex items-center space-x-4 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className={`p-5 rounded-3xl border flex flex-col items-center justify-center min-w-[150px] shadow-sm ${badge.color}`}>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-textSecondary">Impact Score™</span>
              <span className="text-4xl font-black font-mono my-1 leading-none text-textPrimary">{politician.impactScore}</span>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <span>{badge.icon}</span>
                <span>{politician.badgeTier}</span>
              </span>
              <span className="text-[10px] text-textMuted mt-0.5 font-medium">"{politician.badgeAltName}"</span>
            </div>

            <button
              onClick={() => setShowRatingModal(true)}
              className="px-6 py-4 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm transition-all flex flex-col items-center active:scale-[0.98]"
            >
              <span className="flex items-center space-x-1.5">
                <Scale className="w-4 h-4" />
                <span>Cast Quadratic Vote</span>
              </span>
              <span className="text-[10px] font-normal opacity-90 mt-0.5">Spend Janta Points</span>
            </button>
          </div>
        </div>

        {/* Rotten Tomatoes Divergence Radar Alert */}
        {politician.divergence?.hasDivergence && (
          <div className="mt-8 p-5 rounded-2xl bg-rose-50/90 border border-rose-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-800 flex items-center space-x-1.5 uppercase font-mono tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>⚠️ Divergence Alert: Sentiment–Performance Mismatch Detected</span>
              </h4>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold font-mono">
                FLAGGED FOR AUDIT
              </span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              {politician.divergence.divergenceReason}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-white border border-rose-100 shadow-xs">
                <span className="text-[10px] text-textMuted uppercase font-mono font-medium">📊 Kaam Score (Hard Data)</span>
                <p className="text-xl font-bold font-mono text-textPrimary mt-0.5">{politician.divergence.kaamScore}/100</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-rose-100 shadow-xs">
                <span className="text-[10px] text-brand-700 uppercase font-mono font-medium">💬 Janta Voice (Sentiment)</span>
                <p className="text-xl font-bold font-mono text-brand-700 mt-0.5">{politician.divergence.jantaVoice}/100</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-brand-100 pb-2">
        {[
          { id: 'overview', label: '📊 4-Pillar Breakdown' },
          { id: 'money', label: '💰 Follow The Money (Assets)' },
          { id: 'legislative', label: '🏛️ Legislative Record' },
          { id: 'promises', label: '🗳️ Wada Tracker' },
          { id: 'reply', label: '📢 Right of Reply' },
          { id: 'posts', label: '🗣️ Tagged Citizen Posts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-cta text-white shadow-purple-glow'
                : 'text-textSecondary hover:text-brand-700 hover:bg-brand-50/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 4-Pillar Score Breakdown */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-white border border-brand-100 shadow-glass space-y-2 glass-card">
              <div className="flex items-center justify-between text-xs text-textMuted font-mono">
                <span>PILLAR 1 (45%)</span>
                <span className="font-bold text-emerald-700">HARD FACTS</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary font-['Outfit']">Objective Data Score</h4>
              <p className="text-3xl font-black font-mono text-textPrimary">{b.objectiveData || 50}</p>
              <p className="text-[11px] text-textSecondary leading-relaxed">Attendance (15%), Questions (15%), Criminal record (20%), Fund utilization (15%).</p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-white border border-brand-100 shadow-glass space-y-2 glass-card">
              <div className="flex items-center justify-between text-xs text-textMuted font-mono">
                <span>PILLAR 2 (25%)</span>
                <span className="font-bold text-cyan-700">CORROBORATED</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary font-['Outfit']">Verified Local Outcomes</h4>
              <p className="text-3xl font-black font-mono text-textPrimary">{b.verifiedOutcomes || 50}</p>
              <p className="text-[11px] text-textSecondary leading-relaxed">Geotagged ground proof, multi-citizen corroborated reports, promise delivery ratio.</p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-white border border-brand-100 shadow-glass space-y-2 glass-card">
              <div className="flex items-center justify-between text-xs text-textMuted font-mono">
                <span>PILLAR 3 (20%)</span>
                <span className="font-bold text-brand-700">ANTI-IT CELL</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary font-['Outfit']">Community Sentiment</h4>
              <p className="text-3xl font-black font-mono text-brand-700">{b.communitySentiment || 50}</p>
              <p className="text-[11px] text-textSecondary leading-relaxed">Wilson Lower-Bound interval, Quadratic Voting dampening (√credits), 3x voter weight.</p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-3xl bg-white border border-brand-100 shadow-glass space-y-2 glass-card">
              <div className="flex items-center justify-between text-xs text-textMuted font-mono">
                <span>PILLAR 4 (10%)</span>
                <span className="font-bold text-purple-700">RECENCY</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary font-['Outfit']">Trust Decay Factor</h4>
              <p className="text-3xl font-black font-mono text-textPrimary">{b.trustRecency || 50}</p>
              <p className="text-[11px] text-textSecondary leading-relaxed">Exponential time decay favoring verified delivery within the last 6 months.</p>
            </div>
          </div>

          {/* Sub-Dimensions */}
          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
            <h3 className="text-base font-bold text-textPrimary font-['Outfit'] uppercase tracking-wider font-mono">
              Constituency Sub-Dimensions Breakdown
            </h3>
            <div className="space-y-3.5">
              {[
                { label: '🏗️ Infrastructure Development', val: politician.dimensions?.infrastructure || 50 },
                { label: '📢 Accessibility & Responsiveness', val: politician.dimensions?.accessibility || 50 },
                { label: '🤝 Promise Keeping (Wada Nibhana)', val: politician.dimensions?.promiseKeeping || 50 },
                { label: '🎭 Transparency & Clean Image', val: politician.dimensions?.transparency || 50 },
                { label: '🏛️ Legislative Debate & Questions', val: politician.dimensions?.legislative || 50 },
                { label: '🌍 Social & Community Impact', val: politician.dimensions?.social || 50 },
                { label: '💼 Employment & Economic Delivery', val: politician.dimensions?.economic || 50 },
              ].map((dim, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary font-bold">{dim.label}</span>
                    <span className="font-mono font-extrabold text-brand-700">{dim.val}/100</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-brand-50 overflow-hidden border border-brand-100">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Follow The Money (Assets) */}
      {activeTab === 'money' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2">
                <span>💰 "Follow The Money" — Asset Growth & Affidavits</span>
              </h3>
              <span className="text-xs px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-mono font-bold">
                Source: MyNeta / ADR ECI Affidavits
              </span>
            </div>

            {a.assetGrowthAnomaly && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <p className="font-bold flex items-center space-x-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>🚩 ANOMALY DETECTED: Disproportionate Wealth Accumulation</span>
                </p>
                <p>
                  Declared asset growth (+{a.assetGrowthPct}%) is significantly higher than the 5-year Indian equity market benchmark (+74%).
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100 shadow-xs">
                <span className="text-textMuted uppercase font-mono block text-[10px] font-medium">Declared Assets (2019)</span>
                <span className="text-2xl font-black font-mono text-textPrimary mt-1 block">₹{a.declaredAssets2019} Cr</span>
              </div>
              <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100 shadow-xs">
                <span className="text-textMuted uppercase font-mono block text-[10px] font-medium">Declared Assets (2024)</span>
                <span className="text-2xl font-black font-mono text-brand-700 mt-1 block">₹{a.declaredAssets2024} Cr</span>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 shadow-xs">
                <span className="text-purple-800 uppercase font-mono block text-[10px] font-medium">5-Year Growth vs Market (+74%)</span>
                <span className={`text-2xl font-black font-mono mt-1 block ${a.assetGrowthAnomaly ? 'text-rose-600' : 'text-emerald-600'}`}>
                  +{a.assetGrowthPct}%
                </span>
              </div>
            </div>

            {/* Asset History Timeline */}
            {a.assetHistory && a.assetHistory.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <h4 className="text-xs font-bold text-textPrimary uppercase font-mono">Declared Election Affidavits History</h4>
                <div className="flex items-center space-x-6 pt-1">
                  {a.assetHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-brand-700">{item.year}:</span>
                      <span className="text-xs font-mono text-textPrimary font-semibold">₹{item.amountCrores} Crores</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Legislative Record */}
      {activeTab === 'legislative' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
            <h3 className="text-base font-bold text-textPrimary font-['Outfit']">Legislative Work Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
                <span className="text-textSecondary font-medium">Parliament Attendance</span>
                <span className="font-mono font-bold text-textPrimary">{m.attendanceRate}% (National Avg: {m.nationalAvgAttendance}%)</span>
              </div>
              <div className="flex justify-between p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
                <span className="text-textSecondary font-medium">Questions Raised</span>
                <span className="font-mono font-bold text-textPrimary">{m.questionsAsked} (National Avg: {m.nationalAvgQuestions})</span>
              </div>
              <div className="flex justify-between p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
                <span className="text-textSecondary font-medium">Debates Participated</span>
                <span className="font-mono font-bold text-textPrimary">{m.debatesParticipated}</span>
              </div>
              <div className="flex justify-between p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
                <span className="text-textSecondary font-medium">Private Member Bills</span>
                <span className="font-mono font-bold text-textPrimary">{m.billsIntroduced}</span>
              </div>
              <div className="flex justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-emerald-900 font-medium">MPLAD / MLALAD Utilization</span>
                <span className="font-mono font-bold text-emerald-700">{m.fundUtilizationPct}% (₹{m.fundUtilizedCrores} / ₹{m.fundSanctionedCrores} Cr)</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
            <h3 className="text-base font-bold text-textPrimary font-['Outfit']">Criminal Affidavit Disclosures</h3>
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-textSecondary font-medium">Pending Criminal Cases</span>
                <span className={`font-mono font-bold ${m.criminalCasesPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {m.criminalCasesPending} Cases
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary font-medium">Convicted Cases</span>
                <span className="font-mono font-bold text-emerald-700">{m.criminalCasesConvicted} Cases</span>
              </div>
            </div>

            {m.criminalChargesDetails && m.criminalChargesDetails.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-rose-700">Charges Framed / Disclosed:</p>
                {m.criminalChargesDetails.map((charge, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    • {charge}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Zero criminal cases disclosed in official ECI affidavit.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Wada Tracker (Promises) & Slider */}
      {activeTab === 'promises' && (
        <div className="space-y-6">
          {promises.map((p) => (
            <div key={p._id} className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-mono font-bold">
                  {p.category} ({p.manifestoYear})
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                    p.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : p.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {p.status.replace('_', ' ')} ({p.completionPercentage}%)
                </span>
              </div>

              <h3 className="text-lg font-bold text-textPrimary font-['Outfit']">{p.title}</h3>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{p.description}</p>

              {/* Draggable Promise vs Reality Slider */}
              {p.promiseVsReality?.hasSlider && (
                <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-brand-800 uppercase font-mono flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Draggable "Promise vs Reality" Visual Reveal</span>
                  </h4>
                  <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden select-none border border-brand-200 shadow-sm">
                    {/* Reality Layer */}
                    <img
                      src={p.promiseVsReality.realityImageUrl}
                      alt="Reality"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-rose-900/90 text-white text-[10px] font-mono font-bold shadow-md">
                      {p.promiseVsReality.realityCaption}
                    </span>

                    {/* Promise Layer (Clipped) */}
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

                    {/* Draggable Divider Bar */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
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
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Right of Reply */}
      {activeTab === 'reply' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs font-mono uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Representative Right of Reply (Protected Channel)</span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              Elected representatives and authorized spokespersons can publish official statements and tender inspection documents directly alongside citizen reports.
            </p>

            {/* Submit New Right of Reply */}
            <form onSubmit={handleRightOfReplySubmit} className="pt-4 border-t border-brand-100 space-y-3">
              <h4 className="text-sm font-bold text-textPrimary font-['Outfit']">Submit Official Statement</h4>
              <input
                type="text"
                required
                value={replyDesignation}
                onChange={(e) => setReplyDesignation(e.target.value)}
                placeholder="Official Designation (e.g. MLA Office Public Relations Officer)"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 shadow-xs"
              />
              <textarea
                required
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Enter verified public response regarding pending constituency issues..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
              />
              <input
                type="url"
                value={replyDocUrl}
                onChange={(e) => setReplyDocUrl(e.target.value)}
                placeholder="Optional Supporting Document / Gazette PDF URL"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 shadow-xs"
              />
              <button
                type="submit"
                disabled={replySubmitting}
                className="px-5 py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{replySubmitting ? 'Publishing...' : 'Publish Official Response'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: Tagged Citizen Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {taggedPosts.length === 0 ? (
            <p className="text-xs text-textMuted text-center py-12">No tagged Voice Wall posts yet for this leader.</p>
          ) : (
            taggedPosts.map((post) => (
              <div key={post._id} className="p-6 rounded-3xl bg-white border border-brand-100 shadow-glass space-y-2 glass-card">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-900 font-mono">{post.authorHandle}</span>
                  <span className="text-textMuted">{new Date(post.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <h4 className="text-base font-bold text-textPrimary font-['Outfit']">{post.title}</h4>
                <p className="text-xs text-textSecondary">{post.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quadratic Multi-Dimensional Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-xl w-full p-8 shadow-glass-lg relative my-8 glass-dropdown">
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-2xl font-extrabold text-gradient-hero font-['Outfit'] flex items-center space-x-2">
                <span>⚖️ Quadratic Multi-Dimensional Rating</span>
              </h3>
              <p className="text-xs text-textSecondary mt-1">
                Rating {politician.name}. Each additional vote costs exponentially more Janta Points ($credits = n^2$).
              </p>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              {/* Quadratic Vote Pool Slider */}
              <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-textPrimary">Effective Votes: <strong className="text-brand-700">{voteCredits} Vote(s)</strong></span>
                  <span className="text-brand-800 font-mono font-extrabold">Cost: {voteCredits * voteCredits} Janta Points</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={voteCredits}
                  onChange={(e) => setVoteCredits(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <p className="text-[10px] text-textMuted font-medium">
                  1 vote = 1 pt • 2 votes = 4 pts • 3 votes = 9 pts • 4 votes = 16 pts • 5 votes = 25 pts
                </p>
              </div>

              {/* 7 Dimensions Sliders */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {[
                  { key: 'infrastructure', label: '🏗️ Infrastructure Development' },
                  { key: 'accessibility', label: '📢 Accessibility & Responsiveness' },
                  { key: 'promiseKeeping', label: '🤝 Promise Keeping' },
                  { key: 'transparency', label: '🎭 Transparency & Clean Image' },
                  { key: 'legislative', label: '🏛️ Legislative Record' },
                  { key: 'social', label: '🌍 Social & Community Impact' },
                  { key: 'economic', label: '💼 Economic Delivery' },
                ].map((dim) => (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary font-semibold">{dim.label}</span>
                      <span className="font-mono font-bold text-brand-700">{dimensions[dim.key] || 50}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={dimensions[dim.key] || 50}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, [dim.key]: Number(e.target.value) })
                      }
                      className="w-full accent-brand-600"
                    />
                  </div>
                ))}
              </div>

              {/* Evidence Multiplier Tier */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Evidence Attached</label>
                  <select
                    value={evidenceTier}
                    onChange={(e) => setEvidenceTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none shadow-xs"
                  >
                    <option value={3}>Tier 3 (1x): Standard Rating</option>
                    <option value={2}>Tier 2 (1.5x): Detailed Personal Proof</option>
                    <option value={1}>Tier 1 (3x): Verified RTI / Gazette Doc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Evidence URL</label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="Optional Link"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={ratingSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all shadow-sm disabled:opacity-50"
              >
                {ratingSubmitting ? 'Computing Score...' : `Submit Quadratic Rating (${voteCredits * voteCredits} Points)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
