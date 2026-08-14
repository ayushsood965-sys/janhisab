import React, { useEffect, useState } from 'react';
import { getNetaCards, unlockNetaCard, getUserDeck } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Award,
  Sparkles,
  Layers,
  Zap,
  Lock,
  CheckCircle,
} from 'lucide-react';

export default function NetaCardsPage() {
  const { user, isAuthenticated, updateUserPoints } = useAuth();
  const [cards, setCards] = useState([]);
  const [userDeck, setUserDeck] = useState([]);
  const [activeTab, setActiveTab] = useState('all_cards');
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const [cardsRes, deckRes] = await Promise.all([
        getNetaCards(),
        isAuthenticated ? getUserDeck() : Promise.resolve({ data: { deck: [] } }),
      ]);
      if (cardsRes.data.success) setCards(cardsRes.data.cards || []);
      if (deckRes.data?.success) setUserDeck(deckRes.data.deck || []);
    } catch (err) {
      console.warn('Neta cards error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [isAuthenticated]);

  const handleUnlock = async (cardId) => {
    if (!isAuthenticated) {
      alert('Please log in to unlock collectible Neta cards.');
      return;
    }
    try {
      const res = await unlockNetaCard(cardId);
      if (res.data.success) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        alert(res.data.message);
        updateUserPoints(res.data.userRemainingPoints);
        fetchCards();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error unlocking card');
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return { label: '👑 LEGENDARY FOIL', border: 'border-amber-400 bg-amber-50 text-amber-900' };
      case 'Rare':
        return { label: '💎 RARE FOIL', border: 'border-brand-400 bg-brand-50 text-brand-900' };
      default:
        return { label: '⚪ COMMON', border: 'border-slate-300 bg-slate-50 text-slate-800' };
    }
  };

  const isCardUnlocked = (cardId) => {
    return userDeck.some((c) => c._id === cardId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">🃏 3D HOLOGRAPHIC NETA CARDS</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">COLLECTIBLE CIVIC TRADING DECK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
              Political Top Trumps & Deck Binder
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-xl leading-relaxed">
              Collectible political trading cards with stats: Attendance, Criminal Case count, Net Worth Growth, and Roast Quotes.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-brand-200 shadow-glass flex items-center space-x-3 shrink-0">
            <span className="text-2xl">🃏</span>
            <div>
              <span className="text-[10px] text-textMuted uppercase font-mono block font-medium">My Deck Binder</span>
              <span className="text-xl font-bold font-mono text-brand-700">{userDeck.length} Unlocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-brand-100 pb-2">
        <button
          onClick={() => setActiveTab('all_cards')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'all_cards'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🗂️ All Available Cards ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('my_deck')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'my_deck'
              ? 'bg-gradient-cta text-white shadow-purple-glow'
              : 'text-textSecondary hover:bg-brand-50/60'
          }`}
        >
          🏆 My Card Deck ({userDeck.length})
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">🃏</div>
          <p className="text-xs text-textMuted font-semibold font-mono">Loading holographic Neta trading deck...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(activeTab === 'my_deck' ? userDeck : cards).map((c) => {
            const rarity = getRarityBadge(c.rarity);
            const unlocked = isCardUnlocked(c._id);

            return (
              <div
                key={c._id}
                className="p-6 rounded-3xl holo-card-light transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1.5"
              >
                <div>
                  {/* Top Banner */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase font-mono border ${rarity.border}`}>
                      {rarity.label}
                    </span>
                    <span className="font-mono font-extrabold text-brand-700">#{c.cardNumber}</span>
                  </div>

                  {/* Character Artwork */}
                  <div className="rounded-2xl overflow-hidden border border-brand-200 shadow-sm bg-white mb-3 aspect-square">
                    <img src={c.artworkUrl} alt={c.name} className="w-full h-full object-cover" />
                  </div>

                  <h3 className="text-lg font-black text-textPrimary font-['Outfit']">{c.name}</h3>
                  <p className="text-xs text-brand-800 font-semibold">{c.party} • {c.constituency}</p>

                  {/* Special Attack & Roast Quote */}
                  <div className="mt-3 p-3 rounded-2xl bg-white/80 border border-brand-100 text-xs space-y-1 shadow-xs">
                    <p className="text-[10px] uppercase font-mono text-purple-800 font-bold">
                      ⚡ Special Move: <strong className="text-textPrimary">{c.specialAbility}</strong>
                    </p>
                    <p className="italic text-textSecondary text-[11px]">"{c.roastQuote}"</p>
                  </div>

                  {/* Card Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 font-mono">
                    <div className="p-2 rounded-xl bg-white/90 border border-brand-100 shadow-xs">
                      <span className="text-[9px] text-textMuted uppercase block">Attendance</span>
                      <span className="font-bold text-textPrimary">{c.stats?.attendance}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/90 border border-brand-100 shadow-xs">
                      <span className="text-[9px] text-textMuted uppercase block">Crime Cases</span>
                      <span className="font-bold text-rose-600">{c.stats?.criminalCases} Cases</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/90 border border-brand-100 shadow-xs">
                      <span className="text-[9px] text-textMuted uppercase block">Asset Growth</span>
                      <span className="font-bold text-purple-800">+{c.stats?.assetGrowthPct}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/90 border border-brand-100 shadow-xs">
                      <span className="text-[9px] text-textMuted uppercase block">Jumla Level</span>
                      <span className="font-bold text-amber-700">{c.stats?.jumlaRating}/100</span>
                    </div>
                  </div>
                </div>

                {/* Unlock CTA */}
                <div className="pt-3 border-t border-brand-200/60">
                  {unlocked ? (
                    <span className="w-full py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1 font-['Outfit']">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Unlocked in Your Deck</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleUnlock(c._id)}
                      className="w-full py-2.5 rounded-2xl bg-gradient-cta text-white font-bold text-xs hover:shadow-purple-glow font-['Outfit'] flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Unlock ({c.unlockCostCredits} Points)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
