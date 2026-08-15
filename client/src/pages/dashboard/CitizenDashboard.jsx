import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPetitions,
  createPetition,
  updatePetition,
  deletePetition,
  getRtiVault,
  generateRtiDraft,
  uploadRtiResponse,
  verifyNagrikUpi,
} from '../../services/api';
import {
  MessageSquare,
  Flag,
  FileText,
  Award,
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  X,
  RefreshCw,
  Upload,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'reports', label: 'My Civic Reports', icon: MessageSquare },
  { id: 'petitions', label: 'My Petitions', icon: Flag },
  { id: 'rtis', label: 'My RTI Requests', icon: FileText },
  { id: 'karma', label: 'Karma & Rewards', icon: Award },
  { id: 'settings', label: 'Account Settings', icon: Settings },
];

export default function CitizenDashboard() {
  const { user, verifyUpi } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reports');

  // Reports state (CRUD)
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportCategory, setReportCategory] = useState('Infrastructure');
  const [reportProofUrl, setReportProofUrl] = useState('');

  // Petitions state (CRUD)
  const [petitions, setPetitions] = useState([]);
  const [loadingPetitions, setLoadingPetitions] = useState(false);
  const [showCreatePetitionModal, setShowCreatePetitionModal] = useState(false);
  const [editingPetition, setEditingPetition] = useState(null);
  const [petitionTitle, setPetitionTitle] = useState('');
  const [petitionTarget, setPetitionTarget] = useState('District Magistrate / PWD');
  const [petitionCategory, setPetitionCategory] = useState('Infrastructure');
  const [petitionGoal, setPetitionGoal] = useState(500);
  const [petitionDesc, setPetitionDesc] = useState('');

  // RTI state (CRUD)
  const [rtis, setRtis] = useState([]);
  const [loadingRtis, setLoadingRtis] = useState(false);
  const [showRtiModal, setShowRtiModal] = useState(false);
  const [showRtiUploadModal, setShowRtiUploadModal] = useState(false);
  const [selectedRtiForUpload, setSelectedRtiForUpload] = useState(null);
  const [rtiDept, setRtiDept] = useState('Public Works Department (PWD)');
  const [rtiSubject, setRtiSubject] = useState('Road Repair Specification & Bill Copy Request');
  const [rtiQueries, setRtiQueries] = useState('1. Certified copy of tender contract\n2. Name of contractor and quality audit report\n3. Total payment released till date');
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [uploadDocUrl, setUploadDocUrl] = useState('');
  const [uploadDocSummary, setUploadDocSummary] = useState('');

  // Settings state
  const [userBio, setUserBio] = useState('Active citizen fighting for local civic accountability.');
  const [notifyDaily, setNotifyDaily] = useState(true);

  // Fetch user data
  const fetchMyReports = async () => {
    setLoadingReports(true);
    try {
      const res = await getPosts({ limit: 50 });
      if (res.data.success) {
        setReports(res.data.posts || []);
      }
    } catch (err) {
      console.warn('Fetch reports error:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchMyPetitions = async () => {
    setLoadingPetitions(true);
    try {
      const res = await getPetitions();
      if (res.data.success) {
        setPetitions(res.data.petitions || []);
      }
    } catch (err) {
      console.warn('Fetch petitions error:', err);
    } finally {
      setLoadingPetitions(false);
    }
  };

  const fetchMyRtis = async () => {
    setLoadingRtis(true);
    try {
      const res = await getRtiVault();
      if (res.data.success) {
        setRtis(res.data.records || res.data.responses || []);
      }
    } catch (err) {
      console.warn('Fetch RTIs error:', err);
    } finally {
      setLoadingRtis(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') fetchMyReports();
    else if (activeTab === 'petitions') fetchMyPetitions();
    else if (activeTab === 'rtis') fetchMyRtis();
  }, [activeTab]);

  // Report CRUD handlers
  const handleSaveReport = async (e) => {
    e.preventDefault();
    try {
      if (editingReport) {
        const res = await updatePost(editingReport._id, {
          title: reportTitle,
          content: reportContent,
          category: reportCategory,
        });
        if (res.data.success) {
          setReports((prev) => prev.map((p) => (p._id === editingReport._id ? res.data.post : p)));
          toast.success('Report updated successfully!');
        }
      } else {
        const res = await createPost({
          title: reportTitle,
          content: reportContent,
          category: reportCategory,
          postType: 'evidence',
          evidenceSources: reportProofUrl ? [{ title: 'Supporting Document', url: reportProofUrl }] : [],
          constituency: user?.constituency || 'New Delhi',
          state: user?.state || 'Delhi',
        });
        if (res.data.success) {
          setReports((prev) => [res.data.post, ...prev]);
          toast.success('Civic report created and posted to Voice Wall!', 'Report Published');
        }
      }
      setShowCreateReportModal(false);
      setEditingReport(null);
      setReportTitle('');
      setReportContent('');
      setReportProofUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving report');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw and delete this civic report?')) return;
    try {
      await deletePost(id);
      setReports((prev) => prev.filter((p) => p._id !== id));
      toast.info('Report withdrawn.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting report');
    }
  };

  // Petition CRUD handlers
  const handleSavePetition = async (e) => {
    e.preventDefault();
    try {
      if (editingPetition) {
        const res = await updatePetition(editingPetition._id, {
          title: petitionTitle,
          targetAuthority: petitionTarget,
          category: petitionCategory,
          targetSignatures: Number(petitionGoal),
          description: petitionDesc,
        });
        if (res.data.success) {
          setPetitions((prev) => prev.map((p) => (p._id === editingPetition._id ? res.data.petition : p)));
          toast.success('Petition updated successfully!');
        }
      } else {
        const res = await createPetition({
          title: petitionTitle,
          targetAuthority: petitionTarget,
          category: petitionCategory,
          targetSignatures: Number(petitionGoal),
          description: petitionDesc,
        });
        if (res.data.success) {
          setPetitions((prev) => [res.data.petition, ...prev]);
          toast.success('Petition published!', 'Petition Active');
        }
      }
      setShowCreatePetitionModal(false);
      setEditingPetition(null);
      setPetitionTitle('');
      setPetitionDesc('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving petition');
    }
  };

  const handleDeletePetition = async (id) => {
    if (!window.confirm('Are you sure you want to delete this petition?')) return;
    try {
      await deletePetition(id);
      setPetitions((prev) => prev.filter((p) => p._id !== id));
      toast.info('Petition deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting petition');
    }
  };

  // RTI Form 'A' draft creation handler
  const handleGenerateRti = async (e) => {
    e.preventDefault();
    try {
      const res = await generateRtiDraft({
        department: rtiDept,
        subject: rtiSubject,
        queries: rtiQueries.split('\n'),
        applicantName: user?.fullName || user?.handle,
        applicantAddress: `${user?.constituency}, ${user?.state}`,
      });
      if (res.data.success) {
        setShowRtiModal(false);
        fetchMyRtis();
        toast.success('Form "A" RTI Application generated and added to your vault!', 'RTI Ready');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating RTI');
    }
  };

  // RTI response upload handler
  const handleUploadRtiResponse = async (e) => {
    e.preventDefault();
    try {
      const res = await uploadRtiResponse({
        title: uploadDocTitle || 'Official Government RTI Response',
        documentUrl: uploadDocUrl,
        summary: uploadDocSummary,
        keyExpose: 'Public records uploaded for community verification.',
      });
      if (res.data.success) {
        setShowRtiUploadModal(false);
        setSelectedRtiForUpload(null);
        setUploadDocTitle('');
        setUploadDocUrl('');
        setUploadDocSummary('');
        fetchMyRtis();
        toast.success('RTI response successfully uploaded to public vault! +100 XP awarded.', 'RTI Published');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading RTI response');
    }
  };

  const handleDeleteRti = (index) => {
    if (!window.confirm('Remove this draft RTI entry from your console?')) return;
    setRtis((prev) => prev.filter((_, i) => i !== index));
    toast.info('RTI draft removed.');
  };

  return (
    <DashboardLayout
      title="Citizen Console"
      subtitle="Track your evidence reports, petitions, and RTI applications"
      roleName="Citizen"
      roleBadgeColor="bg-emerald-100 text-emerald-950 border-emerald-300"
      sidebarItems={SIDEBAR_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ========================================================================= */}
      {/* TAB 1: MY CIVIC REPORTS (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">My Civic Reports</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Manage and monitor your ground truth submissions</p>
            </div>
            <button
              onClick={() => {
                setEditingReport(null);
                setReportTitle('');
                setReportContent('');
                setReportProofUrl('');
                setShowCreateReportModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Report Ground Issue</span>
            </button>
          </div>

          {loadingReports ? (
            <div className="text-center py-20">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
              <p className="text-xs text-slate-600 font-bold">Loading your civic reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
              <span className="text-4xl">📝</span>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">No Reports Filed Yet</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Be the eyes of democracy. Report potholed roads, delayed hospitals, or water supply failures with evidence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div key={report._id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md hover:shadow-lg transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 font-black uppercase font-mono">
                        {report.category}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 font-['Outfit'] leading-snug">{report.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{report.content}</p>
                  </div>

                  <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{report.corroborationCount || 0} Verifications</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingReport(report);
                          setReportTitle(report.title);
                          setReportContent(report.content);
                          setReportCategory(report.category);
                          setShowCreateReportModal(true);
                        }}
                        className="p-2 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                        title="Edit Report"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY PETITIONS (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'petitions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">My Petitions</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Demands backed by verified citizen signatures</p>
            </div>
            <button
              onClick={() => {
                setEditingPetition(null);
                setPetitionTitle('');
                setPetitionDesc('');
                setPetitionGoal(500);
                setShowCreatePetitionModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Draft New Petition</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {petitions.map((p) => {
              const pct = Math.min(100, Math.round(((p.signaturesCount || p.currentSignatures || 1) / (p.targetSignatures || p.signatureGoal || 500)) * 100));
              return (
                <div key={p._id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black uppercase font-mono">
                        {p.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {p.signaturesCount || p.currentSignatures || 1} / {p.targetSignatures || p.signatureGoal || 500} Signs
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 font-['Outfit'] leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>

                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-brand-50 border border-brand-200 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                        <span>{pct}% Milestone</span>
                        <span>Target: {p.targetAuthority || p.targetDepartment}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingPetition(p);
                        setPetitionTitle(p.title);
                        setPetitionDesc(p.description);
                        setPetitionTarget(p.targetAuthority || p.targetDepartment || 'PWD');
                        setPetitionCategory(p.category);
                        setPetitionGoal(p.targetSignatures || p.signatureGoal || 500);
                        setShowCreatePetitionModal(true);
                      }}
                      className="p-2 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                      title="Edit Petition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePetition(p._id)}
                      className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Withdraw Petition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY RTI REQUESTS (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'rtis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">My RTI Applications & Responses</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Draft, print, upload responses, and track Form 'A' requests</p>
            </div>
            <button
              onClick={() => setShowRtiModal(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Draft Form 'A' RTI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rtis.map((r, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-950 font-black uppercase font-mono">
                      RTI Act 2005
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">30-Day Statutory SLA</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit']">{r.subject || r.title || 'Road Quality Audit Request'}</h3>
                  <p className="text-xs text-slate-600 font-mono">Authority: {r.department || 'Public Works Department (PWD)'}</p>
                  <div className="p-3 rounded-2xl bg-brand-50/60 border border-brand-200 text-xs font-mono text-slate-700">
                    Status: 🟢 Dispatched to PIO • Response Tracking Active
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRtiForUpload(r);
                      setUploadDocTitle(`${r.subject || r.title} Official Response`);
                      setShowRtiUploadModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 flex items-center space-x-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Response (+100 XP)</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRti(i)}
                    className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: KARMA & REWARDS */}
      {/* ========================================================================= */}
      {activeTab === 'karma' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-brand-50/70 to-purple-100/50 border border-brand-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-black uppercase text-brand-700">Citizen Karma Tier</span>
                <h2 className="text-3xl font-black text-slate-900 font-['Outfit'] mt-1">
                  {user?.karmaTier === 'sakriya' ? 'Sakriya Nagrik 🟢 (1.0x Voting)' : user?.karmaTier === 'prabhari' ? 'Prabhari Nagrik 🔵 (2.0x Voting)' : 'Nagrik 🟤 (0.5x Voting)'}
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">Earn XP by corroborating ground evidence and signing petitions.</p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black text-brand-700 font-mono">{user?.jantaPoints || 0}</span>
                <span className="text-xs font-bold text-slate-500 font-mono block">Janta Points (XP)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md text-center space-y-2">
              <span className="text-3xl">🔥</span>
              <h3 className="text-sm font-black text-slate-900 font-['Outfit']">Daily Civic Streak</h3>
              <p className="text-2xl font-black text-brand-700 font-mono">{user?.dailyStreak || 1} Days</p>
              <p className="text-[11px] text-slate-500">+15 XP daily login bonus</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md text-center space-y-2">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-sm font-black text-slate-900 font-['Outfit']">Verified Nagrik</h3>
              <p className="text-base font-black text-emerald-800 font-mono">
                {user?.verifiedNagrik ? 'Verified Nagrik 🛡️' : 'Basic Anon ⚪'}
              </p>
              {!user?.verifiedNagrik ? (
                <button
                  onClick={async () => {
                    await verifyUpi();
                    toast.success('₹11 Verified Nagrik badge activated! 3x quadratic voting weight enabled.', 'Verification Active');
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400"
                >
                  Activate ₹11 UPI
                </button>
              ) : (
                <p className="text-[11px] text-emerald-700 font-bold">3x Quadratic Voting Weight</p>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md text-center space-y-2">
              <span className="text-3xl">🏆</span>
              <h3 className="text-sm font-black text-slate-900 font-['Outfit']">Earned Badges</h3>
              <p className="text-2xl font-black text-purple-700 font-mono">{user?.badges?.length || 1}</p>
              <p className="text-[11px] text-slate-500">Democracy Pioneer</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACCOUNT SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="p-8 rounded-3xl bg-white border border-brand-200 shadow-md space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Account & Privacy Settings</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Zero-PII pseudonymous profile management</p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">Pseudonymous Handle</label>
              <input
                type="text"
                disabled
                value={user?.handle || ''}
                className="w-full px-4 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs font-mono font-bold text-slate-600"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Handles are cryptographically pinned to your identity.</span>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">Assigned Constituency</label>
              <input
                type="text"
                disabled
                value={`${user?.constituency || 'New Delhi'}, ${user?.state || 'Delhi'}`}
                className="w-full px-4 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs font-bold text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">Citizen Bio Statement</label>
              <textarea
                rows={3}
                value={userBio}
                onChange={(e) => setUserBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-brand-50/70 border border-brand-200">
              <input
                type="checkbox"
                id="notify"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
                className="rounded accent-brand-600"
              />
              <label htmlFor="notify" className="text-xs font-bold text-slate-900">
                Receive daily email alerts for constituency development issues
              </label>
            </div>

            <button
              onClick={() => toast.success('Preferences saved successfully!')}
              className="px-6 py-2.5 rounded-2xl bg-gradient-cta text-white font-black text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
            >
              Save Profile Preferences
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* Create / Edit Report Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCreateReportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">
              {editingReport ? 'Edit Civic Report' : 'Report Civic Issue with Proof'}
            </h3>
            <form onSubmit={handleSaveReport} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Broken water pipeline flooded Main Market"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Corruption">Corruption</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Women Safety">Women Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Detailed Description & Evidence</label>
                <textarea
                  rows={4}
                  required
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Describe exact location, time, and impact..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Evidence URL (Optional)</label>
                <input
                  type="text"
                  value={reportProofUrl}
                  onChange={(e) => setReportProofUrl(e.target.value)}
                  placeholder="https://example.com/rti-copy.pdf"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                {editingReport ? 'Save Changes' : 'Publish to Ground Truth Ledger →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Petition Modal */}
      {showCreatePetitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCreatePetitionModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">
              {editingPetition ? 'Edit Citizen Petition' : 'Draft Citizen Petition'}
            </h3>
            <form onSubmit={handleSavePetition} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Petition Title</label>
                <input
                  type="text"
                  required
                  value={petitionTitle}
                  onChange={(e) => setPetitionTitle(e.target.value)}
                  placeholder="e.g. Install CCTV cameras and streetlights on Outer Ring Road"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Target Authority</label>
                  <input
                    type="text"
                    required
                    value={petitionTarget}
                    onChange={(e) => setPetitionTarget(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Signature Goal</label>
                  <input
                    type="number"
                    value={petitionGoal}
                    onChange={(e) => setPetitionGoal(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Demand Description</label>
                <textarea
                  rows={4}
                  required
                  value={petitionDesc}
                  onChange={(e) => setPetitionDesc(e.target.value)}
                  placeholder="Explain why this demand is critical for community safety..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                {editingPetition ? 'Save Petition Changes' : 'Launch Petition →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Form 'A' RTI Modal */}
      {showRtiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowRtiModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">Generate Form 'A' RTI Draft</h3>
            <form onSubmit={handleGenerateRti} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Public Authority / Department</label>
                <input
                  type="text"
                  required
                  value={rtiDept}
                  onChange={(e) => setRtiDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">RTI Subject</label>
                <input
                  type="text"
                  required
                  value={rtiSubject}
                  onChange={(e) => setRtiSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Information Sought (Numbered Queries)</label>
                <textarea
                  rows={4}
                  required
                  value={rtiQueries}
                  onChange={(e) => setRtiQueries(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                Compile Form 'A' Legal Letter →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Response Modal */}
      {showRtiUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowRtiUploadModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">Upload Received RTI Response PDF</h3>
            <form onSubmit={handleUploadRtiResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                  placeholder="e.g. Official PWD Tender Quality Report Response"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">PDF / Public Storage URL</label>
                <input
                  type="url"
                  required
                  value={uploadDocUrl}
                  onChange={(e) => setUploadDocUrl(e.target.value)}
                  placeholder="https://example.com/response-scan.pdf"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Key Disclosures / Summary</label>
                <textarea
                  rows={3}
                  required
                  value={uploadDocSummary}
                  onChange={(e) => setUploadDocSummary(e.target.value)}
                  placeholder="Summarize key revelations (e.g. contractor penalties, fund release date)..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Publish to Public RTI Vault (+100 XP) →</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
