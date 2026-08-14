import React, { useEffect, useState, useRef } from 'react';
import { getMemeTemplates, getRoastCards, createPost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Smile,
  Download,
  Share2,
  Sparkles,
  Upload,
  RefreshCw,
  Send,
  Flame,
  Skull,
} from 'lucide-react';

export default function MemeStudioPage() {
  const { user, isAuthenticated } = useAuth();
  const canvasRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [roastCards, setRoastCards] = useState([]);
  const [activeTab, setActiveTab] = useState('creator');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topText, setTopText] = useState('When asked about unspent MPLAD funds');
  const [bottomText, setBottomText] = useState('"Next question please"');
  const [roastTag, setRoastTag] = useState('clown_behavior');
  const [customImage, setCustomImage] = useState(null);

  useEffect(() => {
    getMemeTemplates().then((res) => {
      if (res.data.success) {
        setTemplates(res.data.templates || []);
        if (res.data.templates?.length > 0) {
          setSelectedTemplate(res.data.templates[0]);
          setTopText(res.data.templates[0].defaultTopText);
          setBottomText(res.data.templates[0].defaultBottomText);
        }
      }
    });

    getRoastCards().then((res) => {
      if (res.data.success) setRoastCards(res.data.roastCards || []);
    });
  }, []);

  // Render Meme on HTML5 Canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedTemplate) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = customImage || selectedTemplate.imageUrl;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 500;

      // Draw background image
      ctx.drawImage(img, 0, 0, 600, 500);

      // Gradient overlay for contrast
      const gradient = ctx.createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
      gradient.addColorStop(0.2, 'transparent');
      gradient.addColorStop(0.8, 'transparent');
      gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 500);

      // Top Text styling
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Impact, Outfit, sans-serif';

      // Draw Top Text
      if (topText) {
        ctx.strokeText(topText.toUpperCase(), 300, 50);
        ctx.fillText(topText.toUpperCase(), 300, 50);
      }

      // Draw Bottom Text
      if (bottomText) {
        ctx.strokeText(bottomText.toUpperCase(), 300, 460);
        ctx.fillText(bottomText.toUpperCase(), 300, 460);
      }

      // Watermark
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#C084FC';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.textAlign = 'right';
      ctx.strokeText('JanHisab.org • Janta Ka Boss', 585, 490);
      ctx.fillText('JanHisab.org • Janta Ka Boss', 585, 490);
    };
  }, [selectedTemplate, topText, bottomText, customImage]);

  const handleDownloadMeme = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `JanHisab_Meme_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handlePostToVoiceWall = async () => {
    if (!isAuthenticated) {
      alert('Please log in to publish meme to the Voice Wall.');
      return;
    }
    const dataUrl = canvasRef.current?.toDataURL();
    if (!dataUrl) return;

    try {
      const res = await createPost({
        title: topText || 'Civic Satire Meme',
        content: bottomText || 'Satirical political meme generated in JanHisab Meme Studio',
        postType: 'meme',
        mediaUrl: dataUrl,
        category: 'General Satire',
        roastToastTag: roastTag,
        evidenceLevel: 'opinion',
        hashtags: ['#JanHisabMeme', '#RoastMyNeta', '#CivicSatire'],
      });

      if (res.data.success) {
        alert('🎉 Meme successfully published to the Voice Wall!');
      }
    } catch (err) {
      alert('Error publishing meme to feed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🎭 MEME FACTORY & ROAST STUDIO</span>
              <span>•</span>
              <span className="text-purple-700 font-bold">SATIRE WITH TEETH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Satire, Memes & Roast Cards
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Create and share political memes that make leaders answer. Built-in templates, Roast/Toast tags, and instant watermarked export.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-brand-100 pb-2">
        <button
          onClick={() => setActiveTab('creator')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'creator'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🎨 Meme Generator Canvas
        </button>
        <button
          onClick={() => setActiveTab('roast_gallery')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'roast_gallery'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🔥 Top Roast Cards ({roastCards.length})
        </button>
      </div>

      {/* TAB 1: Generator Studio */}
      {activeTab === 'creator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-2xl border border-brand-200 shadow-md bg-black"
            />
            <div className="flex items-center space-x-3 mt-5 w-full justify-center">
              <button
                onClick={handleDownloadMeme}
                className="px-5 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-800 font-bold hover:bg-brand-100 flex items-center space-x-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-brand-600" />
                <span>Download Watermarked PNG</span>
              </button>
              <button
                onClick={handlePostToVoiceWall}
                className="px-6 py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center space-x-2 transition-all shadow-sm active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Post to Voice Wall</span>
              </button>
            </div>
          </div>

          {/* Controls & Templates */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
              <h3 className="text-base font-bold text-textPrimary font-['Outfit'] uppercase tracking-wider font-mono">
                Meme Text & Roast Settings
              </h3>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Top Caption</label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="e.g. When asked about road quality"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Bottom Caption</label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="e.g. 'Next question please'"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none focus:border-brand-500 shadow-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Roast / Toast Classification</label>
                <select
                  value={roastTag}
                  onChange={(e) => setRoastTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-brand-200 text-xs text-textPrimary focus:outline-none shadow-xs font-semibold"
                >
                  <option value="clown_behavior">🤡 Clown Behavior (Peak Incompetence)</option>
                  <option value="actually_based">💯 Actually Based (Celebrate Good Work)</option>
                  <option value="peak_corruption">🔥 Peak Corruption (Evidence Callout)</option>
                  <option value="sleeper_cell">😴 Sleeper Cell (Doing Nothing)</option>
                  <option value="drama_queen">🎭 Drama Queen (Performative Rhetoric)</option>
                </select>
              </div>
            </div>

            {/* Template Selector Grid */}
            <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-3">
              <h4 className="text-xs font-bold text-textPrimary font-mono uppercase">Choose Meme Template</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setTopText(tpl.defaultTopText);
                      setBottomText(tpl.defaultBottomText);
                      setCustomImage(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      selectedTemplate?.id === tpl.id
                        ? 'border-brand-500 bg-brand-50/80 ring-2 ring-brand-200 shadow-xs'
                        : 'border-brand-100 bg-brand-50/30 hover:border-brand-300'
                    }`}
                  >
                    <img src={tpl.imageUrl} alt={tpl.title} className="h-16 w-full object-cover rounded-xl mb-1.5 shadow-xs" />
                    <p className="text-xs font-bold text-textPrimary truncate">{tpl.title}</p>
                    <span className="text-[10px] text-textMuted font-medium">{tpl.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Roast Cards Gallery */}
      {activeTab === 'roast_gallery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roastCards.map((card) => (
            <div
              key={card._id}
              className="p-6 rounded-3xl bg-white/95 border border-brand-200/70 shadow-glass hover:shadow-glass-hover transition-all glass-card space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold uppercase font-mono border border-rose-200">
                  {card.roastToastTag?.replace('_', ' ')}
                </span>
                <span className="text-textMuted text-[10px] font-mono">by {card.authorHandle}</span>
              </div>
              <h4 className="text-base font-bold text-textPrimary font-['Outfit']">{card.title}</h4>
              <p className="text-xs text-textSecondary leading-relaxed">{card.content}</p>
              {card.mediaUrl && (
                <img src={card.mediaUrl} alt={card.title} className="rounded-2xl border border-brand-100 max-h-48 w-full object-cover shadow-xs" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
