import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, reactToPost, corroboratePost, boostPost, votePoll, commentOnPost, summarizeIssue, getPoliticiansTicker } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import CivicScaleMotion, { VerifiedShieldMotion } from '../components/common/LottieAnimation';
import {
  Flame,
  Skull,
  Laugh,
  Smile,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  MessageCircle,
  Share2,
  Zap,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  Award,
  Scale,
  FileText,
  Radio,
} from 'lucide-react';
import CreatePostModal from '../components/voice/CreatePostModal';

const REACTION_CONFIG = [
  { key: 'fire', label: '🔥 Fire', color: 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100' },
  { key: 'skull', label: '💀 Expose', color: 'text-rose-800 bg-rose-50 border-rose-300 hover:bg-rose-100' },
  { key: 'rofl', label: '😂 ROFL', color: 'text-yellow-800 bg-yellow-50 border-yellow-300 hover:bg-yellow-100' },
  { key: 'clown', label: '🤡 Jumla', color: 'text-purple-800 bg-purple-50 border-purple-300 hover:bg-purple-100' },
  { key: 'solidarity', label: '✊ Solidarity', color: 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100' },
  { key: 'needsEvidence', label: '🧾 Check', color: 'text-cyan-800 bg-cyan-50 border-cyan-300 hover:bg-cyan-100' },
];

export default function VoiceWallPage({ showCreateModal, onCloseCreateModal }) {
  const { user, isAuthenticated, updateUserPoints } = useAuth();
  const { toast } = useToast();
  const socket = useSocket();
  const [posts, setPosts] = useState([]);
  const [tickerData, setTickerData] = useState({ wallOfFame: [], wallOfShame: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [aiSummaries, setAiSummaries] = useState({});
  const [loadingAiSummary, setLoadingAiSummary] = useState(null);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'verified') params.evidenceLevel = 'verified';
      else if (activeTab === 'memes') params.type = 'meme';
      else if (activeTab === 'audio') params.type = 'audio';
      else if (activeTab === 'petitions') params.type = 'petition';
      else if (activeTab === 'polls') params.type = 'poll';
      else if (activeTab === 'evidence') params.type = 'evidence';

      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const [postsRes, tickerRes] = await Promise.all([
        getPosts(params),
        getPoliticiansTicker(),
      ]);

      if (postsRes.data.success) {
        setPosts(postsRes.data.posts || []);
      }
      if (tickerRes.data?.success) {
        setTickerData(tickerRes.data);
      }
    } catch (err) {
      console.warn('Feed fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab, selectedCategory]);

  useEffect(() => {
    if (!socket) return;
    socket.on('reaction_updated', ({ postId, reactionType, updatedReactions }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, reactions: updatedReactions } : p))
      );
    });
    return () => socket.off('reaction_updated');
  }, [socket]);

  const handleReact = async (postId, reactionKey) => {
    if (!isAuthenticated) {
      toast.warning('Please log in or create an anonymous account to react.', 'Authentication Required');
      return;
    }
    try {
      const res = await reactToPost(postId, reactionKey);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, reactions: res.data.reactions, boostScore: res.data.boostScore }
              : p
          )
        );
        if (socket) {
          socket.emit('send_reaction', {
            postId,
            reactionType: reactionKey,
            updatedReactions: res.data.reactions,
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error recording reaction');
    }
  };

  const handleCorroborate = async (postId) => {
    if (!isAuthenticated) {
      toast.warning('Please log in to corroborate this citizen report.', 'Authentication Required');
      return;
    }
    try {
      const res = await corroboratePost(postId);
      if (res.data.success) {
        toast.success(res.data.message || 'Report corroborated successfully! +15 XP');
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  corroborationCount: res.data.corroborationCount,
                  isCorroborated: res.data.isCorroborated,
                  evidenceLevel: res.data.evidenceLevel,
                }
              : p
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error corroborating post');
    }
  };

  const handleBoost = async (postId) => {
    if (!isAuthenticated) {
      toast.warning('Please log in to spend Janta Points on issue boosts.', 'Authentication Required');
      return;
    }
    try {
      const res = await boostPost(postId, 50);
      if (res.data.success) {
        toast.success(res.data.message || 'Post boosted on Voice Wall! Priority escalation active.');
        updateUserPoints(res.data.userRemainingPoints);
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, boostScore: res.data.boostScore } : p))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error boosting post');
    }
  };

  const handlePollVote = async (postId, optionIndex) => {
    if (!isAuthenticated) {
      toast.warning('Please log in to vote in citizen polls.', 'Authentication Required');
      return;
    }
    try {
      const res = await votePoll(postId, optionIndex);
      if (res.data.success) {
        toast.success('Vote counted! Quadratic confidence dampener applied.');
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, pollData: res.data.pollData } : p))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording poll vote');
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await commentOnPost(postId, { content: commentText });
      if (res.data.success) {
        toast.success('Comment published to public audit trail!');
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
        );
        setCommentText('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding comment');
    }
  };

  const handleGenerateAiSummary = async (post) => {
    if (aiSummaries[post._id]) {
      setAiSummaries((prev) => {
        const next = { ...prev };
        delete next[post._id];
        return next;
      });
      return;
    }

    setLoadingAiSummary(post._id);
    try {
      const res = await summarizeIssue({
        title: post.title,
        content: post.content,
        comments: post.comments || [],
      });
      if (res.data.success) {
        setAiSummaries((prev) => ({ ...prev, [post._id]: res.data.summary }));
      }
    } catch (err) {
      console.warn('AI summary error:', err.message);
    } finally {
      setLoadingAiSummary(null);
    }
  };

  const getEvidenceBadge = (level, isCorroborated) => {
    if (isCorroborated || level === 'verified') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>🟢 Verified • Seal of Janta</span>
        </span>
      );
    }
    if (level === 'likely') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-amber-700" />
          <span>🟡 Likely Corroborated</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
        <span>⚪ Opinion / Uncorroborated</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* ========================================================================= */}
      {/* 🏛️ HERO SECTION: Senior Art Direction & Animated Lottie Graphics */}
      {/* ========================================================================= */}
      <section className="relative p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-white via-brand-50/70 to-purple-100/40 border border-brand-200/90 shadow-2xl overflow-hidden">
        {/* Soft Radial Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 border border-brand-300 text-brand-900 text-xs font-mono font-black tracking-wide uppercase shadow-xs">
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
              <span>INDIA'S PUBLIC ACCOUNTABILITY ENGINE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-['Outfit'] leading-[1.1]">
              Every Promise Tracked.<br />
              <span className="text-brand-700 font-black">
                Every Score Explainable.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
              An evidence-driven civic audit platform combining parliamentary records from PRS India, asset disclosures from MyNeta, and citizen ground truth.
            </p>

            {/* Hero Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenCreatePost && onOpenCreatePost()}
                className="px-8 py-4 rounded-2xl bg-gradient-cta text-white font-extrabold text-sm hover:shadow-purple-glow hover:scale-[1.02] active:scale-[0.98] transition-all font-['Outfit'] flex items-center space-x-2.5 shadow-md"
              >
                <Sparkles className="w-5 h-5" />
                <span>Raise Ground Truth Issue</span>
              </button>

              <Link
                to="/politicians"
                className="px-7 py-4 rounded-2xl bg-white border border-brand-200 text-slate-900 font-extrabold text-sm hover:bg-brand-50/80 hover:border-brand-400 transition-all shadow-sm flex items-center space-x-2 font-['Outfit']"
              >
                <Scale className="w-5 h-5 text-brand-600" />
                <span>Audit Leaders (4-Pillars)</span>
              </Link>
            </div>

            {/* Trust Metrics Pill Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-200/80 text-xs font-mono">
              <div>
                <span className="text-2xl font-black text-slate-900 font-mono block">543</span>
                <span className="text-slate-600 font-bold uppercase text-[11px]">MPs & MLAs Audited</span>
              </div>
              <div>
                <span className="text-2xl font-black text-brand-700 font-mono block">100%</span>
                <span className="text-slate-600 font-bold uppercase text-[11px]">Open Data Logic</span>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-700 font-mono block">Zero-PII</span>
                <span className="text-slate-600 font-bold uppercase text-[11px]">HMAC & EXIF Stripped</span>
              </div>
            </div>
          </div>

          {/* Right Hero Lottie Graphic & Live Divergence Spotlight (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            <div className="w-full p-6 rounded-3xl bg-white/95 border border-brand-200 shadow-xl space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand-900 uppercase font-mono flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-brand-600" />
                  <span>4-PILLAR IMPACT SCORE™ ENGINE</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold font-mono">
                  LIVE COMPILATION
                </span>
              </div>

              {/* Vector Civic Scale Motion Graphic Animation */}
              <div className="flex justify-center py-2">
                <CivicScaleMotion className="w-56 h-56" />
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Rajesh Verma (New Delhi)</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">88.5 / 100 🦁</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-brand-200">
                  <div className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full w-[88.5%]" />
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Objective: 92% • Verified: 84% • Sentiment (Wilson 95%): 89% • Recency: 90%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🧭 CIVIC BENTO GRID: Quick Access to Core Modules */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Bento 1: Wada Tracker */}
        <Link
          to="/promises"
          className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-md hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <span className="text-2xl">🗳️</span>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit'] group-hover:text-brand-700 transition-colors">
              AI Wada Tracker
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Manifesto pledges tracked like GitHub commits with Pinocchio Jumla % index.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 flex items-center space-x-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Audit Pledges →</span>
          </span>
        </Link>

        {/* Bento 2: RTI Factory */}
        <Link
          to="/rti-factory"
          className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-md hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <span className="text-2xl">📜</span>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit'] group-hover:text-brand-700 transition-colors">
              RTI Factory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              1-Click legally vetted Form 'A' RTI letter draft generator for road and hospital audits.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 flex items-center space-x-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Draft Form 'A' →</span>
          </span>
        </Link>

        {/* Bento 3: Petitions Center */}
        <Link
          to="/petitions"
          className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-md hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <span className="text-2xl">🤝</span>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit'] group-hover:text-brand-700 transition-colors">
              Petitions Center
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Verified civic petitions that auto-dispatch notices to District Collectors.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 flex items-center space-x-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Sign Petitions →</span>
          </span>
        </Link>

        {/* Bento 4: 3D Collectible Cards */}
        <Link
          to="/neta-cards"
          className="p-6 rounded-3xl bg-white border border-brand-200/80 shadow-md hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <span className="text-2xl">🃏</span>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit'] group-hover:text-brand-700 transition-colors">
              Neta Card Deck
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              3D holographic collectible cards with attendance stats and roast quote attacks.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 flex items-center space-x-1 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Explore Deck →</span>
          </span>
        </Link>
      </section>

      {/* ========================================================================= */}
      {/* 🗣️ VOICE WALL FEED SECTION: Filter Tabs & Search */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              Live Citizen Ground Truth Feed
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Filtered by evidence tiers (🟢 Verified • 🟡 Likely • ⚪ Opinion).
            </p>
          </div>

          <button
            onClick={() => onOpenCreatePost && onOpenCreatePost()}
            className="px-6 py-2.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-sm flex items-center space-x-2 shrink-0 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Raise Civic Issue</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-white border border-brand-200 shadow-sm">
          {/* Format Filter Tabs */}
          <div className="flex overflow-x-auto no-scrollbar space-x-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: '🔥 All Posts' },
              { id: 'verified', label: '🟢 Verified Only' },
              { id: 'evidence', label: '📜 RTI / Docs' },
              { id: 'memes', label: '😂 Memes' },
              { id: 'polls', label: '📊 Polls' },
              { id: 'petitions', label: '🤝 Petitions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-purple-glow'
                    : 'text-slate-700 hover:text-brand-700 hover:bg-brand-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFeed()}
                placeholder="Search hashtags, topics..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-800 focus:outline-none font-bold"
            >
              <option value="All">All Topics</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Corruption">Corruption</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Women Safety">Women Safety</option>
              <option value="General Satire">Satire</option>
            </select>
          </div>
        </div>

        {/* Feed List */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">⚖️</div>
            <p className="text-xs text-slate-600 font-extrabold font-mono">Loading verified citizen voice feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-white border border-brand-200 shadow-md">
            <span className="text-4xl">📭</span>
            <h3 className="text-lg font-bold text-slate-900 mt-3 font-['Outfit']">No posts in this feed</h3>
            <p className="text-xs text-slate-600 mt-1">Be the first nagrik to raise an issue in this category!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const hasAiSummary = !!aiSummaries[post._id];
              return (
                <article
                  key={post._id}
                  className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-md hover:shadow-xl transition-all space-y-4"
                >
                  {/* Header: Author & Evidence Badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm font-mono">
                        {post.authorHandle ? post.authorHandle.substring(0, 2).toUpperCase() : 'AN'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-slate-900 font-mono">{post.authorHandle}</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-300 font-extrabold uppercase">
                            {post.authorKarmaTier || 'nagrik'}
                          </span>
                          {post.boostScore > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-extrabold flex items-center space-x-0.5">
                              <Zap className="w-3 h-3 text-purple-700" />
                              <span>+{post.boostScore} Boosted</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {post.constituency}, {post.state} • {new Date(post.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getEvidenceBadge(post.evidenceLevel, post.isCorroborated)}
                      {post.roastToastTag && post.roastToastTag !== 'none' && (
                        <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 font-black uppercase font-mono">
                          {post.roastToastTag.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Content */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 font-['Outfit'] leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line font-medium">
                      {post.content}
                    </p>
                  </div>

                  {/* Media Image / Meme */}
                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-brand-100 bg-slate-50 max-h-96 flex items-center justify-center shadow-xs">
                      <img src={post.mediaUrl} alt={post.title} className="w-full h-auto object-contain max-h-96" />
                    </div>
                  )}

                  {/* Poll View */}
                  {post.postType === 'poll' && post.pollData && (
                    <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2.5">
                      <p className="text-sm font-black text-brand-950 mb-2 font-['Outfit']">📊 {post.pollData.question}</p>
                      {post.pollData.options.map((opt, idx) => {
                        const totalVotes = post.pollData.options.reduce((a, b) => a + (b.votes || 0), 0);
                        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePollVote(post._id, idx)}
                            className="w-full text-left p-3.5 rounded-xl bg-white border border-brand-200 hover:border-brand-400 relative overflow-hidden transition-all shadow-xs"
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-brand-100 z-0 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-900">{opt.text}</span>
                              <span className="font-mono text-brand-800 font-black">{pct}% ({opt.votes})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Evidence Sources List */}
                  {post.evidenceSources && post.evidenceSources.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1.5">
                      <p className="text-xs font-black text-emerald-950 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Certified Evidence Sources Attached:</span>
                      </p>
                      {post.evidenceSources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline pr-4"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{s.title || s.url}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* AI 5-Line Issue Summary Box */}
                  {hasAiSummary && (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50 to-brand-50 border border-brand-200 text-xs space-y-2 text-slate-900 animate-in fade-in shadow-xs">
                      <div className="flex items-center space-x-1.5 text-brand-900 font-extrabold font-['Outfit'] pb-2 border-b border-brand-200 text-sm">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        <span>AI 5-Line Structured Issue Breakdown</span>
                      </div>
                      <p><strong>1. Core Issue:</strong> {aiSummaries[post._id].line1_CoreIssue}</p>
                      <p><strong>2. Context:</strong> {aiSummaries[post._id].line2_Context}</p>
                      <p><strong>3. Public Demand:</strong> {aiSummaries[post._id].line3_PublicDemand}</p>
                      <p><strong>4. Community Sentiment:</strong> {aiSummaries[post._id].line4_CommunitySentiment}</p>
                      <p><strong>5. Accountability Status:</strong> {aiSummaries[post._id].line5_AccountabilityStatus}</p>
                    </div>
                  )}

                  {/* Tagged Politician Badge */}
                  {post.taggedPoliticians && post.taggedPoliticians.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-xs uppercase font-mono text-slate-500 font-extrabold">Accountable Leader:</span>
                      {post.taggedPoliticians.map((pol) => (
                        <span
                          key={pol._id}
                          className="text-xs px-3 py-1 rounded-xl bg-brand-100 border border-brand-300 text-brand-900 font-extrabold"
                        >
                          {pol.name} ({pol.party})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.hashtags.map((h, i) => (
                        <span key={i} className="text-xs text-brand-700 font-mono font-bold hover:text-brand-950 cursor-pointer">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reactions & Actions Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-brand-100">
                    {/* Political Reactions */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                      {REACTION_CONFIG.map((r) => {
                        const count = post.reactions?.[r.key] || 0;
                        return (
                          <button
                            key={r.key}
                            onClick={() => handleReact(post._id, r.key)}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${r.color}`}
                          >
                            <span>{r.label}</span>
                            <span className="font-mono text-xs ml-1">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Corroborate */}
                      <button
                        onClick={() => handleCorroborate(post._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-black text-emerald-950 hover:bg-emerald-200 flex items-center space-x-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Verify ({post.corroborationCount || 0})</span>
                      </button>

                      {/* AI Summary Trigger */}
                      <button
                        onClick={() => handleGenerateAiSummary(post)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-100 border border-brand-300 text-xs font-black text-brand-900 hover:bg-brand-200 flex items-center space-x-1 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        <span>{hasAiSummary ? 'Hide AI' : 'AI Summary'}</span>
                      </button>

                      {/* Boost */}
                      <button
                        onClick={() => handleBoost(post._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-100 border border-purple-300 text-xs font-black text-purple-900 hover:bg-purple-200 flex items-center space-x-1 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-purple-700" />
                        <span>Boost</span>
                      </button>

                      {/* Comments Toggle */}
                      <button
                        onClick={() =>
                          setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-brand-200 text-xs font-bold text-slate-800 hover:text-brand-700 flex items-center space-x-1 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Section Drawer */}
                  {activeCommentPostId === post._id && (
                    <div className="pt-4 border-t border-brand-100 space-y-3 animate-in fade-in">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                          placeholder="Add pseudonymous testimony or evidence..."
                          className="flex-1 px-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-bold"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow font-['Outfit'] shadow-xs"
                        >
                          Reply
                        </button>
                      </div>

                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {post.comments.map((c, i) => (
                            <div key={i} className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs">
                              <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                                <span className="font-black text-brand-900 font-mono">{c.authorHandle}</span>
                                <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                              </div>
                              <p className="text-slate-800 font-medium">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={onCloseCreateModal}
          onPostCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
          }}
        />
      )}
    </div>
  );
}
