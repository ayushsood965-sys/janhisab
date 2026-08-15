import React, { useEffect, useState } from 'react';
import { getJukeboxTracks, voteJukeboxTrack, uploadJukeboxTrack, getPoliticians, setPoliticianAnthem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Music,
  Play,
  Pause,
  ThumbsUp,
  Volume2,
  Mic,
  ShieldCheck,
  Award,
  Sparkles,
  X,
} from 'lucide-react';

export default function ProtestJukeboxPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [politiciansList, setPoliticiansList] = useState([]);

  // Upload Form
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Anonymous Nagrik');
  const [audioUrl, setAudioUrl] = useState('');
  const [genre, setGenre] = useState('Rap');
  const [lyricsSnippet, setLyricsSnippet] = useState('');
  const [isWhistleblowerTape, setIsWhistleblowerTape] = useState(false);
  const [targetPoliticianId, setTargetPoliticianId] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchTracks = async () => {
    try {
      const res = await getJukeboxTracks();
      if (res.data.success) {
        setTracks(res.data.tracks || []);
        if (!currentTrack && res.data.tracks?.length > 0) {
          setCurrentTrack(res.data.tracks[0]);
        }
      }
    } catch (err) {
      console.warn('Jukebox tracks error:', err.message);
    }
  };

  useEffect(() => {
    fetchTracks();
    getPoliticians({ limit: 50 }).then((res) => {
      if (res.data.success) setPoliticiansList(res.data.politicians || []);
    });
  }, []);

  const handleVote = async (trackId) => {
    if (!isAuthenticated) {
      toast.warning('Please log in to upvote songs.', 'Authentication Required');
      return;
    }
    try {
      const res = await voteJukeboxTrack(trackId);
      if (res.data.success) {
        toast.success('Vote recorded for track!');
        setTracks((prev) =>
          prev.map((t) => (t._id === trackId ? { ...t, upvotes: res.data.upvotes } : t))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error voting track');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to upload audio.', 'Authentication Required');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadJukeboxTrack({
        title,
        artist,
        audioUrl: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        genre,
        lyricsSnippet,
        isWhistleblowerTape,
        assignedPoliticianId: targetPoliticianId || undefined,
      });

      if (res.data.success) {
        toast.success('Audio uploaded to Awaaz Jukebox! +50 XP awarded.', 'Track Published');
        setShowUploadModal(false);
        setTitle('');
        setAudioUrl('');
        setLyricsSnippet('');
        fetchTracks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading track');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🎵 PROTEST JUKEBOX ("AWAAZ")</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">REVOLUTION THROUGH MUSIC</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Protest Anthems & Whistleblower Tapes
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Civic hip-hop, folk anthems, and pitch-shifted anonymous whistleblower audio leaks. Vote for politician theme songs.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm flex items-center space-x-2 shrink-0 transition-all active:scale-[0.98]"
          >
            <Mic className="w-4 h-4" />
            <span>Upload Anthem / Audio Tape</span>
          </button>
        </div>
      </div>

      {/* Floating Active Player Box */}
      {currentTrack && (
        <div className="p-8 rounded-3xl bg-white border border-brand-200 shadow-glass-lg glass-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-3xl bg-gradient-cta text-white flex items-center justify-center text-xl shadow-purple-glow hover:scale-105 transition-transform shrink-0"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-3 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-mono font-bold">
                  {currentTrack.genre}
                </span>
                {currentTrack.isWhistleblowerTape && (
                  <span className="text-xs px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                    🔒 Voice-Masked Leak
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-textPrimary font-['Outfit'] mt-1">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-textSecondary">
                by <strong className="text-textPrimary">{currentTrack.artist}</strong> • {currentTrack.upvotes || 0} Nagrik Upvotes
              </p>
            </div>
          </div>

          {/* Animated Visualizer Waves */}
          <div className="flex items-center space-x-1.5 h-10 px-6 py-2 rounded-2xl bg-brand-50/70 border border-brand-100">
            {[40, 70, 95, 30, 85, 60, 100, 50, 80, 45, 90, 65].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 bg-gradient-to-t from-brand-600 to-indigo-500 rounded-full transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{ height: isPlaying ? `${h}%` : '25%' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((t) => (
          <div
            key={t._id}
            className={`p-6 rounded-3xl border transition-all glass-card flex flex-col justify-between ${
              currentTrack?._id === t._id
                ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-200/80 shadow-glass'
                : 'border-brand-100 bg-white/95 shadow-xs'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-mono font-bold border border-brand-200">
                  {t.genre}
                </span>
                {t.isWhistleblowerTape && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    Whistleblower Audio
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-textPrimary font-['Outfit']">{t.title}</h4>
              <p className="text-xs text-textSecondary">Artist: {t.artist}</p>

              {t.lyricsSnippet && (
                <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs italic text-brand-900 leading-relaxed font-serif">
                  "{t.lyricsSnippet}"
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-brand-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentTrack(t);
                  setIsPlaying(true);
                }}
                className="flex items-center space-x-2 text-xs font-bold text-brand-700 hover:text-brand-900 font-['Outfit']"
              >
                <Play className="w-4 h-4" />
                <span>Play Anthem</span>
              </button>

              <button
                onClick={() => handleVote(t._id)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800 hover:bg-brand-100 flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-brand-600" />
                <span>{t.upvotes || 0} Upvotes</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Audio Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-brand-200/80 rounded-3xl max-w-lg w-full p-8 shadow-glass-lg relative my-8 glass-dropdown">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-textMuted hover:text-textPrimary p-1.5 rounded-full hover:bg-brand-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gradient-hero font-['Outfit'] mb-1">
              Upload Protest Track / Whistleblower Tape
            </h3>
            <p className="text-xs text-textSecondary mb-4">
              All audio files have EXIF and hardware tags stripped automatically upon ingestion.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-textPrimary font-bold mb-1">Track Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vikas Kahan Hai? (Delhi Rap Anthem)"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Artist Name / Tag</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. MC Janta"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-textPrimary font-bold mb-1">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none shadow-xs font-semibold"
                  >
                    <option value="Rap">Hip-Hop / Rap</option>
                    <option value="Folk">Folk Protest (Lok Geet)</option>
                    <option value="Rock">Rock / Metal</option>
                    <option value="Whistleblower Leak">Whistleblower Voice Leak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Audio File URL (MP3/WAV)</label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-textPrimary font-bold mb-1">Key Lyric / Audio Expose Snippet</label>
                <textarea
                  rows={2}
                  value={lyricsSnippet}
                  onChange={(e) => setLyricsSnippet(e.target.value)}
                  placeholder="e.g. 'Road banayi nahi par bill pass ho gaya...'"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="whistleblowerCheck"
                  checked={isWhistleblowerTape}
                  onChange={(e) => setIsWhistleblowerTape(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="whistleblowerCheck" className="text-textPrimary font-bold cursor-pointer">
                  Mark as confidential whistleblower recording
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] transition-all disabled:opacity-50 mt-2"
              >
                {uploading ? 'Publishing...' : '🎵 Upload Track to Jukebox (+50 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
