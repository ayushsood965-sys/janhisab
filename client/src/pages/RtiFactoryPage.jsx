import React, { useEffect, useState } from 'react';
import { getRtiTemplates, generateRtiDraft, getRtiVault, uploadRtiResponse, getRtiLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Download,
  Upload,
  Printer,
  Copy,
  Award,
  Search,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';

export default function RtiFactoryPage() {
  const { user, isAuthenticated, updateUserPoints } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [vaultResponses, setVaultResponses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(true);

  // Generator Wizard State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('New Delhi');
  const [targetState, setTargetState] = useState('Delhi');
  const [specificLocation, setSpecificLocation] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [generating, setGenerating] = useState(false);

  // Upload Response State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTemplateId, setUploadTemplateId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocUrl, setUploadDocUrl] = useState('');
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadKeyExpose, setUploadKeyExpose] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchRtiData = async () => {
    setLoading(true);
    try {
      const [tplRes, vltRes, ldrRes] = await Promise.all([
        getRtiTemplates(),
        getRtiVault(),
        getRtiLeaderboard(),
      ]);

      if (tplRes.data.success) setTemplates(tplRes.data.templates || []);
      if (vltRes.data.success) setVaultResponses(vltRes.data.responses || []);
      if (ldrRes.data.success) setLeaderboard(ldrRes.data.leaderboard || []);
    } catch (err) {
      console.warn('RTI data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRtiData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const res = await generateRtiDraft({
        templateId: selectedTemplate._id,
        applicantName,
        applicantAddress,
        targetDistrict,
        targetState,
        specificLocation,
      });

      if (res.data.success) {
        setGeneratedDraft(res.data.draftText);
        toast.success('RTI Legal Draft generated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadResponseSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to publish verified RTI disclosures.', 'Authentication Required');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadRtiResponse({
        templateId: uploadTemplateId || templates[0]?._id,
        title: uploadTitle,
        documentUrl: uploadDocUrl,
        summary: uploadSummary,
        keyExpose: uploadKeyExpose,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'RTI response published to Public Vault! +100 XP');
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadDocUrl('');
        setUploadSummary('');
        setUploadKeyExpose('');
        fetchRtiData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading RTI response');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">📜 RTI FACTORY ("RTI KA HATHIYAR")</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">RIGHT TO INFORMATION ACT 2005</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              One-Click Legally Vetted RTI Drafting
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              File RTIs on road quality, hospital medicines, teacher vacancies, and unspent MPLAD funds as easily as ordering food.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                if (templates.length > 0) {
                  setSelectedTemplate(templates[0]);
                  setActiveTab('generator');
                }
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Draft Custom RTI Form 'A'</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-white border border-brand-200 text-brand-800 text-xs font-bold hover:bg-brand-50 transition-colors flex items-center space-x-2 shadow-xs"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload RTI Reply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-brand-100 pb-2">
        {[
          { id: 'templates', label: '📂 RTI Template Library' },
          { id: 'generator', label: '✍️ Application Draft Wizard' },
          { id: 'vault', label: `🏛️ Public Response Vault (${vaultResponses.length})` },
          { id: 'league', label: '🏆 RTI League Leaderboard' },
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

      {/* TAB 1: Templates Library */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((t) => (
            <div
              key={t._id}
              className="p-8 rounded-3xl bg-white/95 border border-brand-200/70 shadow-glass hover:shadow-glass-hover transition-all glass-card flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-mono font-bold border border-brand-200">
                    {t.category}
                  </span>
                  <span className="text-textMuted font-medium text-[11px]">📥 {t.downloadCount || 0} Drafted</span>
                </div>
                <h3 className="text-lg font-bold text-textPrimary font-['Outfit']">{t.title}</h3>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{t.description}</p>
                <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs space-y-1">
                  <p className="text-[10px] text-brand-800 font-mono uppercase font-bold">Target PIO Authority:</p>
                  <p className="font-bold text-textPrimary">{t.department} • {t.pioDesignation}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Filing Fee: {t.filingFee}</p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-brand-100 flex items-center justify-between">
                <span className="text-[11px] text-textMuted">
                  Standard Questions: <strong className="text-textPrimary">{t.applicationQuestions?.length || 0} Clauses</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedTemplate(t);
                    setActiveTab('generator');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center space-x-1"
                >
                  <span>Use This Template</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Application Draft Wizard */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Form */}
          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
            <h3 className="text-lg font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>RTI Form 'A' Draft Builder</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Select Template</label>
              <select
                value={selectedTemplate?._id || ''}
                onChange={(e) => {
                  const t = templates.find((item) => item._id === e.target.value);
                  setSelectedTemplate(t);
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs font-semibold"
              >
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Applicant Name</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Citizen of India / Your Name"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Target State</label>
                  <input
                    type="text"
                    required
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Target District</label>
                  <input
                    type="text"
                    required
                    value={targetDistrict}
                    onChange={(e) => setTargetDistrict(e.target.value)}
                    placeholder="e.g. South Delhi"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Specific Location / Road / Ward</label>
                <input
                  type="text"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  placeholder="e.g. Sarojini Nagar Ring Road Underpass"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {generating ? 'Drafting Application...' : '⚡ Generate Form "A" Letter'}
              </button>
            </form>
          </div>

          {/* Right Preview */}
          <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-textPrimary font-mono uppercase tracking-wider">
                  📄 Form 'A' Printable Preview
                </h4>
                {generatedDraft && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDraft);
                      toast.success('RTI legal text copied to clipboard!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-700 font-bold hover:bg-brand-100 flex items-center space-x-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                )}
              </div>

              <textarea
                readOnly
                rows={16}
                value={
                  generatedDraft ||
                  `Click "Generate Form 'A' Letter" on the left to compile your legally vetted RTI application draft.`
                }
                className="w-full p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-mono focus:outline-none leading-relaxed shadow-inner"
              />
            </div>

            {generatedDraft && (
              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-800 font-bold hover:bg-brand-100 flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-brand-600" />
                <span>Print Official RTI Application Letter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Public Response Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {vaultResponses.length === 0 ? (
            <p className="text-xs text-textMuted text-center py-16">No RTI responses uploaded yet.</p>
          ) : (
            vaultResponses.map((r, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white border border-brand-100 shadow-glass space-y-3 glass-card"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Uploaded by {r.userHandle || 'Anonymous Nagrik'}</span>
                  </span>
                  <span className="text-textMuted text-[10px] font-mono">
                    {new Date(r.uploadedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <h4 className="text-base font-bold text-textPrimary font-['Outfit']">{r.title}</h4>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{r.summary}</p>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <strong className="text-rose-900">🚨 Key Finding / Disclosure:</strong> {r.keyExpose}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: RTI League */}
      {activeTab === 'league' && (
        <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-5">
          <div>
            <h3 className="text-lg font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2">
              <Award className="w-5 h-5 text-brand-600" />
              <span>RTI League — Top Citizen Auditors</span>
            </h3>
            <p className="text-xs text-textSecondary mt-1">Citizens who regularly file and upload government disclosures earn Citizen Karma multipliers.</p>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((u, idx) => (
              <div
                key={u._id || idx}
                className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex items-center justify-between text-xs hover:bg-brand-50 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="font-mono font-black text-brand-700 text-base w-6">#{idx + 1}</span>
                  <div>
                    <span className="font-bold text-textPrimary font-mono text-sm">{u.handle}</span>
                    <span className="text-[11px] text-textMuted ml-2">{u.state}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-brand-200 text-brand-800 font-bold uppercase">
                    {u.karmaTier}
                  </span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">{u.karmaPoints} Karma</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload RTI Response Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-lg w-full p-8 shadow-glass-lg relative glass-dropdown">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Upload Received RTI Response
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              Share official government disclosures with the public. Earn +100 XP and the RTI Warrior badge!
            </p>

            <form onSubmit={handleUploadResponseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Certified Quality Lab Test Report on PWD Bitumen"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Summary of Response</label>
                <textarea
                  required
                  rows={3}
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  placeholder="Briefly state what information the PIO disclosed..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Key Finding / Corruption Expose</label>
                <input
                  type="text"
                  required
                  value={uploadKeyExpose}
                  onChange={(e) => setUploadKeyExpose(e.target.value)}
                  placeholder="e.g. Bitumen thickness was 2.8% vs mandatory 5.5% standard"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Document Link / PDF URL</label>
                <input
                  type="url"
                  value={uploadDocUrl}
                  onChange={(e) => setUploadDocUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {uploading ? 'Publishing to Vault...' : 'Publish to Public Vault (+100 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
