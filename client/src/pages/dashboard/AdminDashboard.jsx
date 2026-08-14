import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getPendingVerifications,
  verifyUserApplication,
  getAdminUserList,
  updateUserRole,
  toggleUserLock,
  getCmsConfig,
  updateCmsFormulaWeights,
  toggleCmsModule,
  getPoliticians,
  createPolitician,
  updatePolitician,
  deletePolitician,
  getAdminAuditLogs,
} from '../../services/api';
import {
  ShieldAlert,
  Users,
  Settings,
  Sliders,
  Landmark,
  FileText,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Search,
  RefreshCw,
  X,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'verification', label: 'Role Verification Queue', icon: ShieldAlert },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'cms', label: 'Modular CMS Toggles', icon: Settings },
  { id: 'algorithm', label: 'Algorithm Weight Tuner', icon: Sliders },
  { id: 'politicians', label: 'Politician Master CRUD', icon: Landmark },
  { id: 'logs', label: 'Platform Security Logs', icon: FileText },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('verification');

  // Pending Verifications state
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);

  // User management state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // CMS state
  const [cmsConfig, setCmsConfig] = useState(null);
  const [weights, setWeights] = useState({
    objectiveData: 25,
    verifiedEvidence: 35,
    communitySentiment: 25,
    recencyDecay: 15,
  });

  // Politicians CRUD state
  const [politicians, setPoliticians] = useState([]);
  const [loadingPoliticians, setLoadingPoliticians] = useState(false);
  const [showPoliticianModal, setShowPoliticianModal] = useState(false);
  const [editingPolitician, setEditingPolitician] = useState(null);
  const [polName, setPolName] = useState('');
  const [polParty, setPolParty] = useState('Democratic People Front');
  const [polState, setPolState] = useState('Delhi');
  const [polConstituency, setPolConstituency] = useState('New Delhi');
  const [polHouse, setPolHouse] = useState('Lok Sabha');
  const [polAttendance, setPolAttendance] = useState(85);
  const [polCrimes, setPolCrimes] = useState(0);

  // Logs state
  const [logs, setLogs] = useState([]);

  // Fetch verifications
  const fetchPending = async () => {
    setLoadingVerifications(true);
    try {
      const res = await getPendingVerifications();
      if (res.data.success) {
        setPendingUsers(res.data.pendingUsers || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingVerifications(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getAdminUserList({ search: userSearch, role: userRoleFilter });
      if (res.data.success) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch CMS
  const fetchCms = async () => {
    try {
      const res = await getCmsConfig();
      if (res.data.success) {
        setCmsConfig(res.data.config);
        if (res.data.config.weights) setWeights(res.data.config.weights);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Fetch Politicians
  const fetchPoliticiansList = async () => {
    setLoadingPoliticians(true);
    try {
      const res = await getPoliticians({ limit: 50 });
      if (res.data.success) {
        setPoliticians(res.data.politicians || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingPoliticians(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
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
    if (activeTab === 'verification') fetchPending();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'cms' || activeTab === 'algorithm') fetchCms();
    else if (activeTab === 'politicians') fetchPoliticiansList();
    else if (activeTab === 'logs') fetchLogs();
  }, [activeTab, userRoleFilter]);

  // Verification Decision Handler
  const handleVerifyDecision = async (targetUserId, action) => {
    try {
      const res = await verifyUserApplication({ targetUserId, action });
      if (res.data.success) {
        setPendingUsers((prev) => prev.filter((u) => u._id !== targetUserId));
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing verification');
    }
  };

  // Role modification
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        alert(`User role updated to ${newRole}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing role');
    }
  };

  // Toggle user lock
  const handleToggleLock = async (userId) => {
    try {
      const res = await toggleUserLock(userId);
      if (res.data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isLocked: res.data.isLocked } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error locking user');
    }
  };

  // CMS module toggle
  const handleToggleModule = async (moduleKey, isEnabled) => {
    try {
      await toggleCmsModule(moduleKey, isEnabled);
      setCmsConfig((prev) => ({
        ...prev,
        modules: { ...prev?.modules, [moduleKey]: isEnabled },
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling module');
    }
  };

  // Algorithm weights save
  const handleSaveWeights = async () => {
    try {
      const total = Object.values(weights).reduce((a, b) => a + Number(b), 0);
      if (total !== 100) {
        alert(`Weights must sum to exactly 100%. Current total: ${total}%`);
        return;
      }
      await updateCmsFormulaWeights(weights);
      alert('Impact Score™ mathematical weights updated across all 543 politicians!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating formula weights');
    }
  };

  // Politician CRUD handlers
  const handleSavePolitician = async (e) => {
    e.preventDefault();
    try {
      if (editingPolitician) {
        const res = await updatePolitician(editingPolitician._id, {
          name: polName,
          party: polParty,
          state: polState,
          constituency: polConstituency,
          house: polHouse,
          metrics: { attendanceRate: Number(polAttendance), criminalCasesPending: Number(polCrimes) },
        });
        if (res.data.success) {
          setPoliticians((prev) =>
            prev.map((p) => (p._id === editingPolitician._id ? res.data.politician : p))
          );
          alert('Politician master record updated!');
        }
      } else {
        const res = await createPolitician({
          name: polName,
          party: polParty,
          state: polState,
          constituency: polConstituency,
          house: polHouse,
          metrics: { attendanceRate: Number(polAttendance), criminalCasesPending: Number(polCrimes) },
        });
        if (res.data.success) {
          setPoliticians((prev) => [res.data.politician, ...prev]);
          alert('New Politician registered in Master Registry!');
        }
      }
      setShowPoliticianModal(false);
      setEditingPolitician(null);
      setPolName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving politician');
    }
  };

  const handleDeletePolitician = async (id) => {
    if (!window.confirm('Delete this politician profile from the master registry?')) return;
    try {
      await deletePolitician(id);
      setPoliticians((prev) => prev.filter((p) => p._id !== id));
      alert('Politician profile removed.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting profile');
    }
  };

  return (
    <DashboardLayout
      title="Super Admin Master Console"
      subtitle="System oversight, role authentication, algorithm tuning, and platform governance"
      roleName="Super Admin"
      roleBadgeColor="bg-purple-100 text-purple-950 border-purple-300 font-mono"
      sidebarItems={SIDEBAR_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ========================================================================= */}
      {/* TAB 1: ROLE VERIFICATION QUEUE (APPROVE / REJECT) */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Role Verification Applications Queue
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Authenticate official credentials for Representative and Lokpal Jury applicants.
              </p>
            </div>
            <span className="text-xs font-mono font-black px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300">
              {pendingUsers.length} Pending Approvals
            </span>
          </div>

          {loadingVerifications ? (
            <div className="text-center py-20">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
              <p className="text-xs text-slate-600 font-bold">Loading pending applications...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
              <span className="text-4xl">🎉</span>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">All Role Applications Processed</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                No Representative or Moderator applications currently awaiting authentication.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((appUser) => (
                <div
                  key={appUser._id}
                  className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center font-bold text-xs text-white font-mono shadow-sm">
                        {appUser.handle.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-black text-slate-900 font-['Outfit']">{appUser.fullName || appUser.handle}</h3>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-950 border border-purple-300 font-black uppercase font-mono">
                            Requested Role: {appUser.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Handle: @{appUser.handle} • Email: {appUser.email} • {appUser.constituency}, {appUser.state}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-300">
                      🟡 PENDING_ADMIN_VERIFICATION
                    </span>
                  </div>

                  {/* Uploaded credentials */}
                  <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs space-y-1">
                    <span className="font-bold text-slate-900">Submitted Credential Document:</span>
                    <a
                      href={appUser.credentialsDoc || 'https://eci.gov.in/affidavits/id.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-700 font-mono font-bold hover:underline flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{appUser.credentialsDoc || 'https://eci.gov.in/affidavits/id.pdf'}</span>
                    </a>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="pt-3 border-t border-brand-100 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => handleVerifyDecision(appUser._id, 'REJECT')}
                      className="px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs hover:bg-rose-100 transition-colors flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>

                    <button
                      onClick={() => handleVerifyDecision(appUser._id, 'APPROVE')}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Verify Role 🟢</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">User Management & Permissions</h2>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">Directory of registered citizens, representatives, and moderators</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    placeholder="Search handle, email..."
                    className="pl-9 pr-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold focus:outline-none"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="citizen">Citizen</option>
                  <option value="representative">Representative</option>
                  <option value="moderator">Moderator</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-brand-100 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="pb-3">User / Handle</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Karma XP</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="py-3">
                        <p className="font-bold text-slate-900">{u.fullName || u.handle}</p>
                        <p className="text-[10px] text-slate-500 font-mono">@{u.handle} • {u.email}</p>
                      </td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 font-mono font-bold text-slate-900 focus:outline-none"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="representative">Representative</option>
                          <option value="moderator">Moderator</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          u.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-950'
                            : 'bg-amber-100 text-amber-950'
                        }`}>
                          {u.verificationStatus || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-brand-700">{u.jantaPoints || 0} XP</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleLock(u._id)}
                          className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                            u.isLocked
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                          }`}
                          title={u.isLocked ? 'Unlock Account' : 'Lock Account'}
                        >
                          {u.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MODULAR CMS TOGGLES */}
      {/* ========================================================================= */}
      {activeTab === 'cms' && (
        <div className="p-8 rounded-3xl bg-white border border-brand-200 shadow-md space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Decoupled Platform Module Toggles</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Enable or disable specific features dynamically across the platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cmsConfig?.modules &&
              Object.entries(cmsConfig.modules).map(([modKey, isEnabled]) => (
                <div key={modKey} className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 capitalize font-['Outfit']">{modKey.replace(/([A-Z])/g, ' $1')}</h3>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{isEnabled ? '🟢 Active' : '🔴 Disabled'}</span>
                  </div>
                  <button
                    onClick={() => handleToggleModule(modKey, !isEnabled)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isEnabled ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ALGORITHM WEIGHT TUNER */}
      {/* ========================================================================= */}
      {activeTab === 'algorithm' && (
        <div className="p-8 rounded-3xl bg-white border border-brand-200 shadow-md space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Impact Score™ Mathematical Weight Tuner</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Fine-tune the 4-Pillar composite score equation (Must sum to 100%)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Objective Data Weight</span>
                <span className="font-mono text-brand-700 font-black">{weights.objectiveData}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.objectiveData}
                onChange={(e) => setWeights({ ...weights, objectiveData: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Verified Evidence Weight</span>
                <span className="font-mono text-brand-700 font-black">{weights.verifiedEvidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.verifiedEvidence}
                onChange={(e) => setWeights({ ...weights, verifiedEvidence: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Community Sentiment Weight</span>
                <span className="font-mono text-brand-700 font-black">{weights.communitySentiment}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.communitySentiment}
                onChange={(e) => setWeights({ ...weights, communitySentiment: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Recency Decay Factor</span>
                <span className="font-mono text-brand-700 font-black">{weights.recencyDecay}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.recencyDecay}
                onChange={(e) => setWeights({ ...weights, recencyDecay: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          <button
            onClick={handleSaveWeights}
            className="px-8 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Weights & Recalculate 543 MPs →</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: POLITICIAN MASTER CRUD */}
      {/* ========================================================================= */}
      {activeTab === 'politicians' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-brand-200 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Politician Master Registry CRUD</h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Add, update, or remove elected representatives</p>
            </div>
            <button
              onClick={() => {
                setEditingPolitician(null);
                setPolName('');
                setShowPoliticianModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Register New MP/MLA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {politicians.map((p) => (
              <div key={p._id} className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-brand-200 bg-brand-50 shrink-0" />
                    <div>
                      <h3 className="text-base font-black text-slate-900 font-['Outfit']">{p.name}</h3>
                      <p className="text-xs text-brand-700 font-bold">{p.party} • {p.constituency}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-brand-50 text-slate-700">Attendance: {p.metrics?.attendanceRate}%</div>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold">Score: {p.impactScore}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditingPolitician(p);
                      setPolName(p.name);
                      setPolParty(p.party);
                      setPolState(p.state);
                      setPolConstituency(p.constituency);
                      setPolHouse(p.house);
                      setPolAttendance(p.metrics?.attendanceRate || 85);
                      setPolCrimes(p.metrics?.criminalCasesPending || 0);
                      setShowPoliticianModal(true);
                    }}
                    className="p-2 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePolitician(p._id)}
                    className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
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
      {/* TAB 6: PLATFORM LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-white border border-brand-200 shadow-md space-y-4">
          <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">System Security & Audit Logs</h2>
          <div className="space-y-2">
            {logs.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-brand-900">{l.action}:</span> {l.description}
                  <p className="text-[10px] text-slate-500 mt-0.5">By {l.actor} • {new Date(l.timestamp).toLocaleTimeString('en-IN')}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px]">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Politician Modal */}
      {showPoliticianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowPoliticianModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-4">
              {editingPolitician ? 'Edit Politician Profile' : 'Register New Politician'}
            </h3>
            <form onSubmit={handleSavePolitician} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={polName}
                  onChange={(e) => setPolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Party</label>
                  <input
                    type="text"
                    required
                    value={polParty}
                    onChange={(e) => setPolParty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">House</label>
                  <select
                    value={polHouse}
                    onChange={(e) => setPolHouse(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold"
                  >
                    <option value="Lok Sabha">Lok Sabha</option>
                    <option value="Vidhan Sabha">Vidhan Sabha</option>
                    <option value="Rajya Sabha">Rajya Sabha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={polState}
                    onChange={(e) => setPolState(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Constituency</label>
                  <input
                    type="text"
                    required
                    value={polConstituency}
                    onChange={(e) => setPolConstituency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Attendance %</label>
                  <input
                    type="number"
                    value={polAttendance}
                    onChange={(e) => setPolAttendance(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Criminal Cases</label>
                  <input
                    type="number"
                    value={polCrimes}
                    onChange={(e) => setPolCrimes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-md"
              >
                Save Politician Record →
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
