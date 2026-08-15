import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getPosts,
  upgradePostEvidence,
  deletePost,
  getFactChecks,
  createFactCheck,
  getAdminAuditLogs,
} from '../../services/api';
import {
  Scale,
  ShieldAlert,
  FileCheck,
  History,
  ShieldCheck,
  CheckCircle,
  XCircle,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  X,
  Search,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'queue', label: 'Lokpal Evidence Queue', icon: Scale },
  { id: 'flagged', label: 'Flagged Content & Spam', icon: ShieldAlert },
  { id: 'factchecks', label: 'Fact-Check Registry', icon: FileCheck },
  { id: 'logs', label: 'Jury Audit Logs', icon: History },
];

export default function ModeratorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('queue');

  // Evidence Queue state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Flagged spam state
  const [flaggedPosts, setFlaggedPosts] = useState([
    {
      id: 'flag_1',
      authorHandle: 'BotFarm_902',
      reason: 'Repetitive spam phrasing detected: "Great leader! Vote now!"',
      category: 'Bot Spam',
      quarantined: true,
      timestamp: new Date(),
    },
  ]);

  // Fact Checks state (CRUD)
  const [factChecks, setFactChecks] = useState([]);
  const [loadingFactChecks, setLoadingFactChecks] = useState(false);
  const [showFactCheckModal, setShowFactCheckModal] = useState(false);
  const [editingFactCheck, setEditingFactCheck] = useState(null);
  const [fcClaim, setFcClaim] = useState('');
  const [fcVerdict, setFcVerdict] = useState('VERIFIED_TRUE');
  const [fcExplanation, setFcExplanation] = useState('');
  const [fcSources, setFcSources] = useState('');

  // Logs state
  const [logs, setLogs] = useState([]);

  const fetchEvidenceQueue = async () => {
    setLoadingPosts(true);
    try {
      const res = await getPosts({ limit: 50 });
      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchFactCheckList = async () => {
    setLoadingFactChecks(true);
    try {
      const res = await getFactChecks();
      if (res.data.success) {
        setFactChecks(res.data.factChecks || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingFactChecks(false);
    }
  };

  const fetchAuditLogList = async () => {
    try {
      const res = await getAdminAuditLogs();
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue' || activeTab === 'flagged') fetchEvidenceQueue();
    else if (activeTab === 'factchecks') fetchFactCheckList();
    else if (activeTab === 'logs') fetchAuditLogList();
  }, [activeTab]);

  // Evidence status upgrade handler
  const handleUpgradeTier = async (postId, newLevel) => {
    try {
      const res = await upgradePostEvidence({ postId, newLevel });
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, evidenceLevel: newLevel, isCorroborated: newLevel === 'verified' } : p))
        );
        toast.success(`Post evidence level successfully upgraded to ${newLevel.toUpperCase()}!`, 'Evidence Upgraded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error upgrading evidence');
    }
  };

  // Reject / Take down post handler
  const handleTakedownPost = async (postId) => {
    if (!window.confirm('Take down this unverified claim from the public Voice Wall?')) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.info('Post taken down by Lokpal Jury.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error taking down post');
    }
  };

  // Flagged spam actions
  const handleDismissFlag = (flagId) => {
    setFlaggedPosts((prev) => prev.filter((f) => f.id !== flagId));
    toast.info('Flag dismissed.');
  };

  // Fact Check CRUD handlers
  const handleSaveFactCheck = async (e) => {
    e.preventDefault();
    try {
      if (editingFactCheck) {
        setFactChecks((prev) =>
          prev.map((fc) =>
            fc.id === editingFactCheck.id
              ? {
                  ...fc,
                  claim: fcClaim,
                  verdict: fcVerdict,
                  explanation: fcExplanation,
                  officialSources: fcSources.split('\n').filter((s) => s.trim()),
                }
              : fc
          )
        );
        toast.success('Fact-Check entry updated!');
      } else {
        const res = await createFactCheck({
          claim: fcClaim,
          verdict: fcVerdict,
          explanation: fcExplanation,
          officialSources: fcSources.split('\n').filter((s) => s.trim()),
        });
        if (res.data.success) {
          setFactChecks((prev) => [res.data.factCheck, ...prev]);
          toast.success('Fact-Check entry published to Public Registry!', 'Fact Check Active');
        }
      }
      setShowFactCheckModal(false);
      setEditingFactCheck(null);
      setFcClaim('');
      setFcExplanation('');
      setFcSources('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating fact check');
    }
  };

  const handleDeleteFactCheck = (id) => {
    if (!window.confirm('Delete this fact-check entry from the public registry?')) return;
    setFactChecks((prev) => prev.filter((fc) => fc.id !== id));
    toast.info('Fact check entry removed.');
  };

  return (
    <DashboardLayout
      title="Lokpal Jury Console"
      subtitle="Examine citizen proof, audit evidence veracity, and maintain public fact-check registries"
      roleName="Lokpal Moderator"
      roleBadgeColor="bg-blue-100 text-blue-950 border-blue-300"
      roleIcon={Scale}
      sidebarItems={SIDEBAR_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ========================================================================= */}
      {/* TAB 1: LOKPAL EVIDENCE QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Lokpal Evidence Verification Queue</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Triage citizen submissions and upgrade unverified claims to official Verified status.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-brand-100 text-brand-900 border border-brand-300">
              {posts.length} Submissions In Triage
            </span>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black font-mono text-slate-900">{post.authorHandle}</span>
                    <span className="text-xs text-slate-500 font-mono">• {post.constituency}, {post.state}</span>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-black uppercase font-mono border ${
                    post.evidenceLevel === 'verified'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : post.evidenceLevel === 'likely'
                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    Current: {post.evidenceLevel?.toUpperCase() || 'OPINION'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Outfit'] leading-snug">{post.title}</h3>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">{post.content}</p>
                </div>

                {/* Evidence Links */}
                {post.evidenceSources && post.evidenceSources.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <p className="font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Attached Citizen Proof:</span>
                    </p>
                    {post.evidenceSources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer" className="block text-emerald-800 font-mono font-bold hover:underline">
                        • {s.title || s.url}
                      </a>
                    ))}
                  </div>
                )}

                {/* Moderation Upgrade Toolbar */}
                <div className="pt-3 border-t border-brand-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Corroborations: <strong>{post.corroborationCount || 0} Nagriks</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpgradeTier(post._id, 'verified')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 flex items-center space-x-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Grant Verified Seal 🟢</span>
                    </button>

                    <button
                      onClick={() => handleUpgradeTier(post._id, 'likely')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black hover:bg-amber-200 flex items-center space-x-1 shadow-xs"
                    >
                      <span>Mark Likely 🟡</span>
                    </button>

                    <button
                      onClick={() => handleTakedownPost(post._id)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                      title="Take Down False Claim"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLAGGED CONTENT & ANTI-SPAM */}
      {/* ========================================================================= */}
      {activeTab === 'flagged' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Flagged Posts & Anti-Brigading Queue</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Suspect accounts quarantined by heuristic AI filters</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-rose-100 text-rose-950 border border-rose-300">
              {flaggedPosts.length} Quarantined
            </span>
          </div>

          <div className="space-y-4">
            {flaggedPosts.map((flag) => (
              <div key={flag.id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-950 font-black uppercase font-mono">
                    {flag.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">{new Date(flag.timestamp).toLocaleTimeString('en-IN')}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit']">Account: @{flag.authorHandle}</h3>
                <p className="text-xs text-rose-800 bg-rose-50 p-3 rounded-2xl border border-rose-200 font-medium">
                  {flag.reason}
                </p>

                <div className="pt-3 border-t border-brand-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleDismissFlag(flag.id)}
                    className="px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-slate-700 text-xs font-bold hover:bg-brand-100"
                  >
                    Dismiss Flag
                  </button>
                  <button
                    onClick={() => {
                      handleDismissFlag(flag.id);
                      toast.warning(`Account @${flag.authorHandle} suspended from platform.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700"
                  >
                    Suspend Spammer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FACT-CHECK REGISTRY (CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'factchecks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Public Fact-Check Audit Registry</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Official fact audits published by Lokpal Jury</p>
            </div>
            <button
              onClick={() => {
                setEditingFactCheck(null);
                setFcClaim('');
                setFcExplanation('');
                setFcSources('');
                setShowFactCheckModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Fact Check</span>
            </button>
          </div>

          <div className="space-y-4">
            {factChecks.map((fc) => (
              <div key={fc.id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full font-black uppercase font-mono border ${
                    fc.verdict === 'VERIFIED_TRUE'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : fc.verdict === 'PARTLY_TRUE'
                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                      : 'bg-rose-100 text-rose-950 border-rose-300'
                  }`}>
                    Verdict: {fc.verdict?.replace('_', ' ')}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingFactCheck(fc);
                        setFcClaim(fc.claim);
                        setFcVerdict(fc.verdict);
                        setFcExplanation(fc.explanation);
                        setFcSources(Array.isArray(fc.officialSources) ? fc.officialSources.join('\n') : '');
                        setShowFactCheckModal(true);
                      }}
                      className="p-1.5 rounded-lg text-brand-700 hover:bg-brand-50"
                      title="Edit Fact Check"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFactCheck(fc.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Delete Fact Check"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">Claim: "{fc.claim}"</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{fc.explanation}</p>

                {fc.officialSources && fc.officialSources.length > 0 && (
                  <div className="p-3 rounded-2xl bg-brand-50 border border-brand-200 text-xs font-mono text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">Official Citations:</p>
                    {fc.officialSources.map((s, i) => (
                      <p key={i}>• {s}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Jury Action Audit Log</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Immutable audit trail of all moderation actions</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-brand-900">{log.action}:</span> {log.description}
                  <p className="text-[10px] text-slate-500 mt-0.5">Actor: {log.actor} • {new Date(log.timestamp).toLocaleTimeString('en-IN')}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px]">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fact Check Modal */}
      {showFactCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowFactCheckModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">
              {editingFactCheck ? 'Edit Fact-Check Record' : 'Publish Fact-Check Record'}
            </h3>
            <form onSubmit={handleSaveFactCheck} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Public Claim</label>
                <input
                  type="text"
                  required
                  value={fcClaim}
                  onChange={(e) => setFcClaim(e.target.value)}
                  placeholder="e.g. Government allocated ₹500 Cr for Highway project"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Jury Verdict</label>
                <select
                  value={fcVerdict}
                  onChange={(e) => setFcVerdict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                >
                  <option value="VERIFIED_TRUE">VERIFIED TRUE 🟢</option>
                  <option value="PARTLY_TRUE">PARTLY TRUE / MISLEADING 🟡</option>
                  <option value="FALSE_JUMLA">FALSE / JUMLA 💀</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Detailed Explanation</label>
                <textarea
                  rows={4}
                  required
                  value={fcExplanation}
                  onChange={(e) => setFcExplanation(e.target.value)}
                  placeholder="Reference official budget codes, tender numbers, and gazette notices..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Official Sources (1 per line)</label>
                <textarea
                  rows={3}
                  value={fcSources}
                  onChange={(e) => setFcSources(e.target.value)}
                  placeholder="e.g. Gazette Notification #441\nDelhi PWD Audit Report 2025"
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                {editingFactCheck ? 'Save Fact Check Changes' : 'Sign & Publish Fact Check →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
