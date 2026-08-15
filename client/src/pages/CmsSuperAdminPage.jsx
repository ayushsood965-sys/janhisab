import React, { useEffect, useState } from 'react';
import { getCmsConfig, updateCmsFormulaWeights, toggleCmsModule } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Save,
  CheckCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export default function CmsSuperAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState(null);
  const [weights, setWeights] = useState({
    objectiveDataWeight: 0.45,
    verifiedOutcomesWeight: 0.25,
    communitySentimentWeight: 0.20,
    trustDecayWeight: 0.10,
  });
  const [modules, setModules] = useState({
    voiceWallEnabled: true,
    promiseTrackerEnabled: true,
    rtiFactoryEnabled: true,
    petitionsEnabled: true,
    andolanModeEnabled: true,
    memeStudioEnabled: true,
    netaCardsEnabled: true,
    protestJukeboxEnabled: true,
    bountiesEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await getCmsConfig();
      if (res.data.success) {
        setConfig(res.data.config);
        if (res.data.config.weights) setWeights(res.data.config.weights);
        if (res.data.config.modules) setModules(res.data.config.modules);
      }
    } catch (err) {
      console.warn('CMS config error:', err.message);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleWeightChange = (key, val) => {
    setWeights((prev) => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handleSaveWeights = async () => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1.0) > 0.05) {
      toast.warning(`Weights must sum to 1.0 (Current: ${total.toFixed(2)})`, 'Invalid Weight Distribution');
      return;
    }
    setSaving(true);
    try {
      const res = await updateCmsFormulaWeights(weights);
      if (res.data.success) {
        toast.success('Mathematical Impact Score formula weights updated across all politician calculations!', 'Weights Updated');
        fetchConfig();
      }
    } catch (err) {
      toast.error('Error updating formula weights');
    } finally {
      setSaving(false);
    }
  };

  const handleModuleToggle = async (moduleKey, currentStatus) => {
    try {
      const res = await toggleCmsModule(moduleKey, !currentStatus);
      if (res.data.success) {
        setModules((prev) => ({ ...prev, [moduleKey]: !currentStatus }));
        toast.info(`Module ${moduleKey} switch updated!`);
      }
    } catch (err) {
      toast.error('Error toggling module switch');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
          <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">⚙️ SUPER ADMIN GOVERNANCE CMS</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">ALGORITHM WEIGHT TUNING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
          Mathematical Scoring & Platform Switches
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
          Fine-tune the weights of the 4-Pillar Impact Score™ engine in real-time and toggle platform modules instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: 4-Pillar Weights Slider Panel */}
        <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-100">
            <h3 className="text-base font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-brand-600" />
              <span>4-Pillar Mathematical Formula Weights</span>
            </h3>
            <span className="font-mono text-xs font-bold text-brand-700">
              Sum: {Object.values(weights).reduce((a, b) => a + b, 0).toFixed(2)} / 1.0
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Pillar 1 */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-textPrimary">Pillar 1: Objective Data (Attendance, Cases, Funds)</span>
                <span className="font-mono font-bold text-brand-700">{(weights.objectiveDataWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={weights.objectiveDataWeight}
                onChange={(e) => handleWeightChange('objectiveDataWeight', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Pillar 2 */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-textPrimary">Pillar 2: Verified Local Outcomes (RTI, Corroborations)</span>
                <span className="font-mono font-bold text-brand-700">{(weights.verifiedOutcomesWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={weights.verifiedOutcomesWeight}
                onChange={(e) => handleWeightChange('verifiedOutcomesWeight', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Pillar 3 */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-textPrimary">Pillar 3: Community Sentiment (Quadratic + Wilson)</span>
                <span className="font-mono font-bold text-brand-700">{(weights.communitySentimentWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.communitySentimentWeight}
                onChange={(e) => handleWeightChange('communitySentimentWeight', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Pillar 4 */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-textPrimary">Pillar 4: Trust Decay Recency</span>
                <span className="font-mono font-bold text-brand-700">{(weights.trustDecayWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.trustDecayWeight}
                onChange={(e) => handleWeightChange('trustDecayWeight', e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          <button
            onClick={handleSaveWeights}
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Recalculating...' : 'Apply Dynamic Weights to All Politicians'}</span>
          </button>
        </div>

        {/* Right: Decoupled Feature Module Switches */}
        <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
          <h3 className="text-base font-bold text-textPrimary font-['Outfit'] pb-3 border-b border-brand-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <span>Decoupled Platform Feature Switches</span>
          </h3>

          <div className="space-y-2.5">
            {[
              { key: 'voiceWallEnabled', label: '🗣️ Anonymous Citizen Voice Wall' },
              { key: 'promiseTrackerEnabled', label: '🗳️ AI Wada Tracker & Comparison Slider' },
              { key: 'rtiFactoryEnabled', label: '📜 RTI Factory & Form "A" Generator' },
              { key: 'petitionsEnabled', label: '🤝 Petitions Engine & Notice Dispatch' },
              { key: 'andolanModeEnabled', label: '📢 48-Hour Ephemeral Andolan Live Room' },
              { key: 'memeStudioEnabled', label: '🎭 Meme Studio & Roast Canvas' },
              { key: 'netaCardsEnabled', label: '🃏 3D Holographic Neta Trading Cards' },
              { key: 'protestJukeboxEnabled', label: '🎵 Protest Jukebox & Audio Leaks' },
              { key: 'bountiesEnabled', label: '🎯 Crowdsourced Investigation Bounties' },
            ].map((mod) => (
              <div
                key={mod.key}
                className="p-3.5 rounded-2xl bg-brand-50/40 border border-brand-100 flex items-center justify-between text-xs hover:bg-brand-50/80 transition-colors"
              >
                <span className="font-bold text-textPrimary">{mod.label}</span>
                <button
                  onClick={() => handleModuleToggle(mod.key, modules[mod.key])}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    modules[mod.key]
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {modules[mod.key] ? 'ENABLED 🟢' : 'DISABLED ⚪'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
