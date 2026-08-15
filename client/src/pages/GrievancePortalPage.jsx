import React, { useEffect, useState } from 'react';
import { fileGrievance, trackGrievance, getJuryQueue, voteJuryQueue } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Scale,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Users,
  Search,
  FileText,
  Lock,
} from 'lucide-react';

export default function GrievancePortalPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('file');

  // File Form State
  const [complainantName, setComplainantName] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [complainantDesignation, setComplainantDesignation] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [reasonCategory, setReasonCategory] = useState('defamation_claim');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [filedTicket, setFiledTicket] = useState(null);
  const [filing, setFiling] = useState(false);

  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Jury Queue State
  const [juryQueue, setJuryQueue] = useState([]);
  const [juryLoading, setJuryLoading] = useState(false);

  const fetchJury = async () => {
    setJuryLoading(true);
    try {
      const res = await getJuryQueue();
      if (res.data.success) {
        setJuryQueue(res.data.queue || []);
      }
    } catch (err) {
      console.warn('Jury queue error:', err.message);
    } finally {
      setJuryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jury') fetchJury();
  }, [activeTab]);

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setFiling(true);
    try {
      const res = await fileGrievance({
        complainantName,
        complainantEmail,
        complainantDesignation,
        targetContentUrl: targetUrl,
        reasonCategory,
        detailedDescription,
      });

      if (res.data.success) {
        setFiledTicket(res.data.grievance);
        toast.success('Grievance filed under IT Rules 2021. 36h statutory timer started.', 'Ticket Filed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error filing grievance');
    } finally {
      setFiling(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setTrackingLoading(true);
    try {
      const res = await trackGrievance(trackingNumber.trim());
      if (res.data.success) {
        setTrackedGrievance(res.data.grievance);
        toast.success('Grievance status retrieved successfully.');
      }
    } catch (err) {
      toast.error('Grievance tracking ID not found');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleJuryVote = async (grievanceId, voteDecision) => {
    if (!isAuthenticated) {
      toast.warning('Please log in as a verified Sakriya/Guardian nagrik to vote in Community Jury.', 'Authentication Required');
      return;
    }
    try {
      const res = await voteJuryQueue(grievanceId, voteDecision);
      if (res.data.success) {
        toast.success(res.data.message || 'Jury vote registered cryptographically!', 'Vote Recorded');
        fetchJury();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error voting on moderation queue');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">⚖️ STATUTORY SAFE HARBOR PORTAL</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">IT RULES 2021 COMPLIANCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Grievance Redressal & Intermediary Protection
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Operating under Section 79 of the Information Technology Act, 2000. Statutory 24-hour acknowledgment and 15-day SLA tracker with decentralized Community Jury oversight.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-brand-200 shadow-glass space-y-1 text-xs shrink-0">
            <span className="text-[10px] text-emerald-800 uppercase font-mono block font-bold">Appointed Grievance Officer:</span>
            <p className="font-bold text-textPrimary">Adv. R. Narayanan</p>
            <p className="text-textMuted font-mono text-[11px]">grievance@janaudit.org</p>
            <p className="text-[10px] text-textSecondary pt-1 border-t border-brand-100">SLA: 24h Ack • 15 Days Resolution</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-brand-100 pb-2">
        <button
          onClick={() => setActiveTab('file')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'file'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          📝 File IT Rules 2021 Complaint
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'track'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🔍 Track Grievance Status
        </button>
        <button
          onClick={() => setActiveTab('jury')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'jury'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          👥 Community Jury Queue ({juryQueue.length})
        </button>
      </div>

      {/* TAB 1: File Form */}
      {activeTab === 'file' && (
        <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-6">
          {filedTicket ? (
            <div className="space-y-4 text-center py-6">
              <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 text-3xl">
                ✓
              </div>
              <h3 className="text-2xl font-black text-textPrimary font-['Outfit']">
                Grievance Acknowledged (Statutory IT Rules 2021)
              </h3>
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 font-mono text-xs space-y-1">
                <p className="text-textMuted font-bold">Tracking Ticket Number:</p>
                <p className="text-xl font-bold text-brand-700">{filedTicket.trackingNumber}</p>
                <p className="text-[10px] text-textSecondary">
                  Acknowledgment Timestamp: {new Date(filedTicket.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <p className="text-xs text-textSecondary max-w-md mx-auto leading-relaxed">
                Your complaint has been forwarded to the Grievance Redressal Officer and decentralized Community Jury queue. Resolution status will be updated within 15 statutory days.
              </p>
              <button
                onClick={() => setFiledTicket(null)}
                className="px-6 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xs hover:bg-brand-100"
              >
                File Another Complaint
              </button>
            </div>
          ) : (
            <form onSubmit={handleFileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Complainant Legal Name</label>
                  <input
                    type="text"
                    required
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={complainantEmail}
                    onChange={(e) => setComplainantEmail(e.target.value)}
                    placeholder="official@domain.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Designation / Capacity</label>
                <input
                  type="text"
                  value={complainantDesignation}
                  onChange={(e) => setComplainantDesignation(e.target.value)}
                  placeholder="e.g. Legal Representative of XYZ / Individual Citizen"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Target Post URL / ID</label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://janaudit.org/posts/... or post ID"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Grounds for Complaint (IT Rules 2021)</label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none shadow-xs font-semibold"
                >
                  <option value="defamation_claim">Defamation / Unverified Factual Claim</option>
                  <option value="privacy_violation">Privacy Violation / Non-Consensual PII</option>
                  <option value="hate_speech">Hate Speech / Public Order Threat</option>
                  <option value="copyright_infringement">Copyright / Intellectual Property Violation</option>
                  <option value="other_statutory">Other Statutory Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Detailed Factual Representation</label>
                <textarea
                  required
                  rows={4}
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Provide detailed facts and official rebuttal documents..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={filing}
                className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {filing ? 'Generating Statutory Notice...' : '⚖️ File Grievance (Generate 24h Ack)'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: Tracking */}
      {activeTab === 'track' && (
        <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-6">
          <form onSubmit={handleTrackSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-textPrimary">Enter 10-Digit Grievance Tracking Number</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. GRV-839420"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary font-mono font-bold focus:outline-none focus:border-brand-500 shadow-xs"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit']"
              >
                {trackingLoading ? '...' : 'Track SLA'}
              </button>
            </div>
          </form>

          {trackedGrievance && (
            <div className="p-6 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-700">{trackedGrievance.trackingNumber}</span>
                <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 uppercase font-mono">
                  {trackedGrievance.status}
                </span>
              </div>
              <p><strong>Category:</strong> {trackedGrievance.reasonCategory}</p>
              <p><strong>Ack Timestamp:</strong> {new Date(trackedGrievance.createdAt).toLocaleString('en-IN')}</p>
              <p><strong>Officer Decision:</strong> {trackedGrievance.officerDecision || 'Pending review by Adv. R. Narayanan within 15-day statutory window'}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Community Jury */}
      {activeTab === 'jury' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-brand-50/60 border border-brand-200 text-xs space-y-2">
            <h3 className="font-bold text-brand-900 font-['Outfit'] text-sm flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-brand-700" />
              <span>Decentralized Community Jury Moderation Queue</span>
            </h3>
            <p className="text-textSecondary leading-relaxed">
              To prevent partisan censorship, flagged reports are voted on by a randomized jury of Sakriya and Guardian tier citizens.
            </p>
          </div>

          {juryQueue.length === 0 ? (
            <p className="text-xs text-textMuted text-center py-16">No grievances pending jury moderation.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {juryQueue.map((item) => (
                <div
                  key={item._id}
                  className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-glass space-y-4 glass-card"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
                      {item.reasonCategory}
                    </span>
                    <span className="text-[10px] text-textMuted font-mono">{item.trackingNumber}</span>
                  </div>

                  <p className="text-xs text-textSecondary leading-relaxed">{item.detailedDescription}</p>

                  <div className="pt-4 border-t border-brand-100 flex items-center justify-between">
                    <button
                      onClick={() => handleJuryVote(item._id, 'uphold_post')}
                      className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
                    >
                      ✓ Uphold Post (Public Interest)
                    </button>
                    <button
                      onClick={() => handleJuryVote(item._id, 'remove_content')}
                      className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-colors"
                    >
                      ✕ Takedown Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
