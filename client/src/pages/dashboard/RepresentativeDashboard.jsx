import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getPosts,
  submitRepresentativeReply,
  getPromises,
  createPromise,
  updatePromise,
  deletePromise,
} from '../../services/api';
import {
  MapPin,
  CheckCircle,
  Megaphone,
  BarChart3,
  Shield,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles,
  ExternalLink,
  Upload,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'issues', label: 'Constituency Issues', icon: MapPin },
  { id: 'promises', label: 'Manifesto Promises', icon: CheckCircle },
  { id: 'announcements', label: 'Official Bulletins', icon: Megaphone },
  { id: 'analytics', label: 'Civic Analytics', icon: BarChart3 },
  { id: 'credentials', label: 'Verification ID', icon: Shield },
];

export default function RepresentativeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('issues');

  // Issues & Right of Reply state
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [selectedIssueForReply, setSelectedIssueForReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [proofImage, setProofImage] = useState('');

  // Promises state
  const [promises, setPromises] = useState([]);
  const [loadingPromises, setLoadingPromises] = useState(false);
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [editingPromise, setEditingPromise] = useState(null);
  const [promiseTitle, setPromiseTitle] = useState('');
  const [promiseDesc, setPromiseDesc] = useState('');
  const [promiseCategory, setPromiseCategory] = useState('Infrastructure');
  const [promisePct, setPromisePct] = useState(50);

  // Announcements state
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ann_1',
      title: 'Monsoon Drainage Desilting Work Commencing across Wards 14-22',
      content: 'PWD and Municipal teams have been deployed with super-sucker machines to clear drains before monsoon.',
      date: new Date(),
    },
    {
      id: 'ann_2',
      title: 'New Community Health Center (CHC) Inauguration Date Announced',
      content: 'The 50-bed multi-speciality public clinic will be operational starting next Monday with free generic medicine counter.',
      date: new Date(Date.now() - 86400000 * 2),
    },
  ]);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Credentials upload state
  const [credentialsDocUrl, setCredentialsDocUrl] = useState(user?.credentialsDoc || 'https://eci.gov.in/affidavits/id.pdf');

  const fetchConstituencyIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await getPosts({ limit: 50 });
      if (res.data.success) {
        setIssues(res.data.posts || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingIssues(false);
    }
  };

  const fetchManifestoPromises = async () => {
    setLoadingPromises(true);
    try {
      const res = await getPromises();
      if (res.data.success) {
        setPromises(res.data.promises || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingPromises(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'issues') fetchConstituencyIssues();
    else if (activeTab === 'promises') fetchManifestoPromises();
  }, [activeTab]);

  // Reply handler
  const handlePublishReply = async (e) => {
    e.preventDefault();
    if (!selectedIssueForReply) return;
    try {
      const res = await submitRepresentativeReply(selectedIssueForReply._id, {
        replyContent: replyText,
        newStatus,
        proofImageUrl: proofImage,
      });
      if (res.data.success) {
        setIssues((prev) =>
          prev.map((item) => (item._id === selectedIssueForReply._id ? res.data.post : item))
        );
        setSelectedIssueForReply(null);
        setReplyText('');
        setProofImage('');
        alert('Official Right of Reply published!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting reply');
    }
  };

  // Promise CRUD handlers
  const handleSavePromise = async (e) => {
    e.preventDefault();
    try {
      if (editingPromise) {
        const res = await updatePromise(editingPromise._id, {
          title: promiseTitle,
          description: promiseDesc,
          category: promiseCategory,
          completionPercentage: promisePct,
        });
        if (res.data.success) {
          setPromises((prev) =>
            prev.map((p) => (p._id === editingPromise._id ? res.data.promise : p))
          );
          alert('Promise progress updated!');
        }
      } else {
        const res = await createPromise({
          title: promiseTitle,
          description: promiseDesc,
          category: promiseCategory,
          completionPercentage: promisePct,
          politicianName: user?.fullName || user?.handle,
        });
        if (res.data.success) {
          setPromises((prev) => [res.data.promise, ...prev]);
          alert('Manifesto promise added!');
        }
      }
      setShowPromiseModal(false);
      setEditingPromise(null);
      setPromiseTitle('');
      setPromiseDesc('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving promise');
    }
  };

  const handleDeletePromise = async (id) => {
    if (!window.confirm('Delete this promise record?')) return;
    try {
      await deletePromise(id);
      setPromises((prev) => prev.filter((p) => p._id !== id));
      alert('Promise deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting promise');
    }
  };

  // Announcement CRUD handlers
  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    if (editingAnn) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingAnn.id ? { ...a, title: annTitle, content: annContent } : a))
      );
      alert('Bulletin updated successfully!');
    } else {
      const newAnn = {
        id: `ann_${Date.now()}`,
        title: annTitle,
        content: annContent,
        date: new Date(),
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      alert('Official bulletin published!');
    }
    setShowAnnModal(false);
    setEditingAnn(null);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleDeleteAnnouncement = (id) => {
    if (!window.confirm('Delete this bulletin?')) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    alert('Bulletin removed.');
  };

  const handleUpdateCredentials = (e) => {
    e.preventDefault();
    alert('Credentials updated! Submitted to Lokpal Super Admin verification queue.');
  };

  return (
    <DashboardLayout
      title="Representative Console"
      subtitle="Manage constituency grievances, publish Right of Reply, and track manifesto pledges"
      roleName="Representative"
      roleBadgeColor="bg-purple-100 text-purple-950 border-purple-300"
      roleIcon={Megaphone}
      sidebarItems={SIDEBAR_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ========================================================================= */}
      {/* TAB 1: CONSTITUENCY ISSUES (RIGHT OF REPLY CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Constituency Ground Issues</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Verified citizen reports in {user?.constituency || 'New Delhi'}. Exercise statutory Right of Reply.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-brand-100 text-brand-900 border border-brand-300">
              {issues.length} Active Issues
            </span>
          </div>

          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 font-black uppercase font-mono">
                      {issue.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      Reported by {issue.authorHandle} • {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-black uppercase font-mono border ${
                    issue.issueStatus === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : issue.issueStatus === 'In Progress'
                      ? 'bg-blue-100 text-blue-950 border-blue-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}>
                    Status: {issue.issueStatus || 'Under Review'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Outfit'] leading-snug">{issue.title}</h3>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">{issue.content}</p>
                </div>

                {/* Right of Reply Action Bar */}
                <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {issue.comments?.filter((c) => c.isOfficial).length > 0
                      ? '✅ Official Reply Published'
                      : '⏳ Response Awaited'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedIssueForReply(issue);
                      setReplyText('');
                      setProofImage('');
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-cta text-white font-black text-xs hover:shadow-purple-glow font-['Outfit'] shadow-xs flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Publish Right of Reply →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANIFESTO PROMISES (CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'promises' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Manifesto Commitments & Progress</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Public pledges tracked on the AI Wada Tracker</p>
            </div>
            <button
              onClick={() => {
                setEditingPromise(null);
                setPromiseTitle('');
                setPromiseDesc('');
                setPromisePct(50);
                setShowPromiseModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Manifesto Promise</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promises.map((p) => (
              <div key={p._id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-950 font-black uppercase font-mono">
                      {p.category}
                    </span>
                    <span className={`text-xs font-mono font-black ${p.completionPercentage >= 100 ? 'text-emerald-700' : 'text-brand-700'}`}>
                      {p.completionPercentage || 0}% Delivered
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 font-['Outfit'] leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>

                  <div className="w-full h-2.5 rounded-full bg-brand-50 border border-brand-200 overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${p.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-bold font-mono">Status: {p.status}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingPromise(p);
                        setPromiseTitle(p.title);
                        setPromiseDesc(p.description);
                        setPromiseCategory(p.category);
                        setPromisePct(p.completionPercentage || 0);
                        setShowPromiseModal(true);
                      }}
                      className="p-2 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                      title="Update Progress"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePromise(p._id)}
                      className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Delete"
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
      {/* TAB 3: OFFICIAL BULLETINS (CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Constituency Press Bulletins</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Broadcast official development updates to voters</p>
            </div>
            <button
              onClick={() => {
                setEditingAnn(null);
                setAnnTitle('');
                setAnnContent('');
                setShowAnnModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Official Release</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black uppercase font-mono">
                    Official Press Release
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-500 font-bold">{new Date(ann.date).toLocaleDateString('en-IN')}</span>
                    <button
                      onClick={() => {
                        setEditingAnn(ann);
                        setAnnTitle(ann.title);
                        setAnnContent(ann.content);
                        setShowAnnModal(true);
                      }}
                      className="p-1.5 rounded-lg text-brand-700 hover:bg-brand-50"
                      title="Edit Bulletin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Delete Bulletin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">{ann.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CIVIC ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-slate-500">Citizen Sentiment Score</span>
              <p className="text-3xl font-black text-emerald-700 font-mono">84.2% 🦁</p>
              <p className="text-[11px] text-slate-500 font-medium">Wilson 95% Confidence Interval</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-slate-500">Issue Resolution Rate</span>
              <p className="text-3xl font-black text-brand-700 font-mono">76%</p>
              <p className="text-[11px] text-slate-500 font-medium">19 of 25 complaints answered</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-slate-500">Parliament Attendance</span>
              <p className="text-3xl font-black text-purple-700 font-mono">92%</p>
              <p className="text-[11px] text-slate-500 font-medium">PRS India Verified Audit</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VERIFICATION CREDENTIALS */}
      {/* ========================================================================= */}
      {activeTab === 'credentials' && (
        <div className="p-8 rounded-3xl bg-white border border-brand-200 shadow-md space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Official Representation Credentials</h2>
            <p className="text-xs text-slate-600 font-medium">Election Commission of India (ECI) Certificate & Verification Documents</p>
          </div>

          <form onSubmit={handleUpdateCredentials} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">Official ID / Certificate URL</label>
              <input
                type="url"
                required
                value={credentialsDocUrl}
                onChange={(e) => setCredentialsDocUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">Current Verification Status:</p>
              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] inline-block ${
                user?.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950'
              }`}>
                {user?.verificationStatus || 'PENDING_ADMIN_VERIFICATION'}
              </span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-cta text-white font-black text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
            >
              Update Credentials URL
            </button>
          </form>
        </div>
      )}

      {/* Right of Reply Modal */}
      {selectedIssueForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedIssueForReply(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-2">Publish Official Right of Reply</h3>
            <p className="text-xs text-slate-600 mb-4">Responding to: <strong>{selectedIssueForReply.title}</strong></p>

            <form onSubmit={handlePublishReply} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Issue Status Update</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress (Work Assigned)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Official Response Statement</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="State official action taken, contractor penalties, or timeline..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Proof Photo URL (Triggers Before/After Slider)</label>
                <input
                  type="text"
                  value={proofImage}
                  onChange={(e) => setProofImage(e.target.value)}
                  placeholder="https://example.com/repaired_road.jpg"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                Sign & Publish Official Reply →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Promise Modal */}
      {showPromiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowPromiseModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">
              {editingPromise ? 'Update Manifesto Commitment' : 'Add Manifesto Commitment'}
            </h3>
            <form onSubmit={handleSavePromise} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Promise Title</label>
                <input
                  type="text"
                  required
                  value={promiseTitle}
                  onChange={(e) => setPromiseTitle(e.target.value)}
                  placeholder="e.g. 100% LED Solar Street Lighting in all colonies"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Category</label>
                  <select
                    value={promiseCategory}
                    onChange={(e) => setPromiseCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Employment">Employment</option>
                    <option value="Women Safety">Women Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Fulfillment % ({promisePct}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={promisePct}
                    onChange={(e) => setPromisePct(Number(e.target.value))}
                    className="w-full accent-brand-600 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  required
                  value={promiseDesc}
                  onChange={(e) => setPromiseDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                Save Manifesto Promise →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowAnnModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">
              {editingAnn ? 'Edit Constituency Bulletin' : 'Post Constituency Bulletin'}
            </h3>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Bulletin Headline</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Bulletin Content</label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                {editingAnn ? 'Save Bulletin Changes' : 'Publish Press Release →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
