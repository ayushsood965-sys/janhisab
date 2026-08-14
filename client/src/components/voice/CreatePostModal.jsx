import React, { useState, useEffect } from 'react';
import { createPost, getPoliticians, uploadMedia } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldAlert, Upload, Link as LinkIcon, Plus, CheckCircle, AlertTriangle, HelpCircle, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Corruption', 'Infrastructure', 'Education', 'Healthcare', 'Employment',
  'Environment', 'Women Safety', 'Farmer Issues', 'Governance', 'General Satire'
];

const ROAST_TAGS = [
  { id: 'none', label: 'None' },
  { id: 'clown_behavior', label: '🤡 Clown Behavior' },
  { id: 'actually_based', label: '💯 Actually Based' },
  { id: 'peak_corruption', label: '🔥 Peak Corruption' },
  { id: 'sleeper_cell', label: '😴 Sleeper Cell (Inactive)' },
  { id: 'drama_queen', label: '🎭 Drama Queen' },
];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [category, setCategory] = useState('Infrastructure');
  const [evidenceLevel, setEvidenceLevel] = useState('opinion');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceSourceType, setEvidenceSourceType] = useState('rti_document');
  const [taggedPoliticianId, setTaggedPoliticianId] = useState('');
  const [roastToastTag, setRoastToastTag] = useState('none');
  const [hashtags, setHashtags] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [politiciansList, setPoliticiansList] = useState([]);
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Option 1', 'Option 2']);

  // Friction state
  const [showFrictionModal, setShowFrictionModal] = useState(false);
  const [frictionMessage, setFrictionMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await getPoliticians({ limit: 50 });
        if (res.data.success) {
          setPoliticiansList(res.data.politicians || []);
        }
      } catch (err) {
        // ignore
      }
    };
    if (isOpen) fetchLeaders();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const executePostCreation = async (forceBypass = false) => {
    setError('');
    setLoading(true);

    try {
      let uploadedUrl = '';
      if (mediaFile) {
        const formData = new FormData();
        formData.append('media', mediaFile);
        const uploadRes = await uploadMedia(formData);
        if (uploadRes.data.success) {
          uploadedUrl = uploadRes.data.fileUrl;
        }
      }

      const evidenceSources = [];
      if (evidenceUrl) {
        evidenceSources.push({
          title: `${evidenceSourceType.replace('_', ' ').toUpperCase()} Attachment`,
          url: evidenceUrl,
          sourceType: evidenceSourceType,
        });
      }

      const parsedHashtags = hashtags
        .split(' ')
        .filter((t) => t.trim().length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      const payload = {
        title,
        content,
        postType,
        mediaUrl: uploadedUrl || undefined,
        category,
        evidenceLevel: evidenceSources.length > 0 ? (evidenceLevel === 'opinion' ? 'likely' : evidenceLevel) : evidenceLevel,
        evidenceSources,
        taggedPoliticians: taggedPoliticianId ? [taggedPoliticianId] : [],
        roastToastTag,
        hashtags: parsedHashtags,
        state: user?.state || 'Delhi',
        constituency: user?.constituency || 'New Delhi',
        forceBypassFriction: forceBypass,
        pollData:
          postType === 'poll'
            ? {
                question: pollQuestion || title,
                options: pollOptions.filter((o) => o.trim()).map((o) => ({ text: o, votes: 0 })),
              }
            : undefined,
      };

      const res = await createPost(payload);

      if (res.data.frictionTriggered) {
        setFrictionMessage(res.data.message);
        setShowFrictionModal(true);
        setLoading(false);
        return;
      }

      if (res.data.success) {
        if (onPostCreated) onPostCreated(res.data.post);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error publishing post');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executePostCreation(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="bg-white/95 border border-brand-200/80 rounded-3xl max-w-2xl w-full p-8 shadow-glass-lg relative my-8 glass-dropdown">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-textMuted hover:text-textPrimary transition-colors p-1.5 rounded-full hover:bg-brand-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-gradient-hero font-['Outfit'] flex items-center space-x-2">
              <span>🗣️ Raise an Issue on the Voice Wall</span>
            </h3>
            <p className="text-xs text-textSecondary mt-1">
              Anonymous posting backed by Evidence Levels (🟢 Verified • 🟡 Likely • ⚪ Opinion).
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type Selector */}
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">Post Format</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[
                  { id: 'text', label: '📝 Text' },
                  { id: 'evidence', label: '📜 RTI/Doc' },
                  { id: 'meme', label: '😂 Meme' },
                  { id: 'video', label: '🎥 Video' },
                  { id: 'audio', label: '🎵 Audio' },
                  { id: 'petition', label: '🤝 Petition' },
                  { id: 'poll', label: '📊 Poll' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPostType(t.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      postType === t.id
                        ? 'bg-brand-50 text-brand-700 border border-brand-300 shadow-sm'
                        : 'bg-white text-textSecondary border border-brand-100 hover:bg-brand-50/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">Issue Headline</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken Bridge & Bitumen Failure on Ring Road Flyover"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200/50 font-bold shadow-xs"
              />
            </div>

            {/* Content Body */}
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1.5">Detailed Observation</label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe ground facts, dates, affected citizens, tender history..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200/50 shadow-xs leading-relaxed"
              />
            </div>

            {/* Poll options if postType === 'poll' */}
            {postType === 'poll' && (
              <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 space-y-2">
                <label className="block text-xs font-bold text-brand-800">Poll Options</label>
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none focus:border-brand-500"
                  />
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                    className="text-xs text-brand-700 font-bold hover:underline"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            )}

            {/* Evidence Attachment Section */}
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Evidence & Verification Level</span>
                </span>
                <select
                  value={evidenceLevel}
                  onChange={(e) => setEvidenceLevel(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none font-medium shadow-xs"
                >
                  <option value="opinion">⚪ Opinion (No Doc Attached)</option>
                  <option value="likely">🟡 Likely (Partially Sourced)</option>
                  <option value="verified">🟢 Verified (RTI / Official Record)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={evidenceSourceType}
                  onChange={(e) => setEvidenceSourceType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none shadow-xs"
                >
                  <option value="rti_document">RTI Document Copy</option>
                  <option value="news_report">News Article Link</option>
                  <option value="court_order">Court / CAG Order</option>
                  <option value="affidavit">ECI Affidavit</option>
                  <option value="geotagged_photo">Geotagged Photo</option>
                </select>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="Paste Source / RTI Document URL"
                  className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              {/* Media File Upload (EXIF auto-stripped) */}
              <div>
                <label className="flex items-center space-x-2 text-xs text-brand-700 font-semibold cursor-pointer hover:text-brand-900 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo / Document (EXIF Metadata Automatically Stripped)</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                {mediaPreview && (
                  <div className="mt-2 relative inline-block">
                    <img src={mediaPreview} alt="Preview" className="h-20 w-auto rounded-xl border border-brand-200 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaFile(null);
                        setMediaPreview('');
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-accentCrimson text-white rounded-full p-0.5 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tagging & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none shadow-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Tag Politician</label>
                <select
                  value={taggedPoliticianId}
                  onChange={(e) => setTaggedPoliticianId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none shadow-xs"
                >
                  <option value="">None (General Issue)</option>
                  {politiciansList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.constituency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Roast / Toast Tag</label>
                <select
                  value={roastToastTag}
                  onChange={(e) => setRoastToastTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none shadow-xs"
                >
                  {ROAST_TAGS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#RoadScam #SarojiniNagar #VikasAudit"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-200 text-xs text-textPrimary font-mono focus:outline-none focus:border-brand-500 shadow-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-brand-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish to Voice Wall'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content Friction Dialog */}
      {showFrictionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-brand-200 rounded-3xl max-w-md w-full p-6 shadow-glass-lg glass-dropdown">
            <div className="flex items-center space-x-3 mb-3 text-brand-700">
              <ShieldAlert className="w-7 h-7 text-accentCrimson" />
              <h4 className="text-lg font-bold font-['Outfit'] text-textPrimary">Evidence Friction Notice</h4>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed mb-5">
              {frictionMessage}
            </p>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setShowFrictionModal(false)}
                className="w-full py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow transition-all font-['Outfit']"
              >
                ← Go Back & Attach Evidence (Recommended)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFrictionModal(false);
                  executePostCreation(true);
                }}
                className="w-full py-2 rounded-2xl bg-brand-50 border border-brand-200 text-textSecondary hover:text-brand-800 text-xs font-semibold transition-colors"
              >
                Proceed as Unverified Opinion (Lower Visibility)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
