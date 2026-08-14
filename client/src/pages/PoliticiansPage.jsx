import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPoliticians } from '../services/api';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Award,
  ChevronRight,
  Sparkles,
  Scale,
} from 'lucide-react';

const HOUSES = ['All', 'Lok Sabha', 'Vidhan Sabha', 'Rajya Sabha'];
const STATES = ['All', 'Delhi', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Himachal Pradesh'];
const PARTIES = ['All', 'Democratic People Front', 'Rashtriya Pragati Dal', 'Janata Vikas Party', 'Maharashtra Kranti Dal'];

export default function PoliticiansPage() {
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [house, setHouse] = useState('All');
  const [state, setState] = useState('All');
  const [party, setParty] = useState('All');
  const [sort, setSort] = useState('score_desc');

  const fetchPoliticiansList = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (house !== 'All') params.house = house;
      if (state !== 'All') params.state = state;
      if (party !== 'All') params.party = party;
      if (sort === 'score_asc') params.sort = 'score_asc';
      else if (sort === 'attendance_desc') params.sort = 'attendance_desc';
      else if (sort === 'asset_growth_desc') params.sort = 'asset_growth_desc';
      else if (sort === 'criminal_cases_desc') params.sort = 'criminal_cases_desc';

      const res = await getPoliticians(params);
      if (res.data.success) {
        setPoliticians(res.data.politicians || []);
      }
    } catch (err) {
      console.warn('Politicians fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliticiansList();
  }, [house, state, party, sort]);

  const getBadgeStyle = (tier) => {
    switch (tier) {
      case 'Janta ka Sher':
        return { icon: '🦁', color: 'text-amber-950 bg-amber-100 border-amber-300' };
      case 'Kaam Karne Wala':
        return { icon: '🌟', color: 'text-emerald-950 bg-emerald-100 border-emerald-300' };
      case 'Theek Hai':
        return { icon: '😐', color: 'text-blue-950 bg-blue-100 border-blue-300' };
      case 'Sust Neta':
        return { icon: '🐌', color: 'text-orange-950 bg-orange-100 border-orange-300' };
      case 'Jumla Champion':
        return { icon: '🤡', color: 'text-purple-950 bg-purple-100 border-purple-300' };
      default:
        return { icon: '💀', color: 'text-rose-950 bg-rose-100 border-rose-300' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-brand-50/80 to-purple-100/50 border border-brand-200 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-900 font-extrabold text-xs uppercase tracking-wider font-mono mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-100 border border-brand-300">🏛️ PUBLIC REPRESENTATIVE DIRECTORY</span>
              <span>•</span>
              <span className="text-emerald-800 font-black">4-PILLAR AUDIT SCORES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-['Outfit']">
              Elected Leaders & Scorecards
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-2 max-w-2xl leading-relaxed">
              Track attendance from PRS India, asset disclosures from MyNeta affidavits, criminal records, and AI-audited promise completion.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPoliticiansList()}
              placeholder="Search politician name, seat..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-bold"
            />
          </div>

          {/* House */}
          <div>
            <select
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
            >
              {HOUSES.map((h) => (
                <option key={h} value={h}>House: {h}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>State: {s}</option>
              ))}
            </select>
          </div>

          {/* Party */}
          <div>
            <select
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
            >
              {PARTIES.map((p) => (
                <option key={p} value={p}>Party: {p}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-black"
            >
              <option value="score_desc">🏆 Highest Impact Score</option>
              <option value="score_asc">💀 Lowest Impact Score</option>
              <option value="attendance_desc">🏛️ Highest Attendance</option>
              <option value="asset_growth_desc">📈 Highest Asset Growth %</option>
              <option value="criminal_cases_desc">⚖️ Criminal Cases Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Politicians */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin text-3xl mb-3 text-brand-600">🏛️</div>
          <p className="text-xs text-slate-600 font-extrabold font-mono">Loading verified politician scorecards...</p>
        </div>
      ) : politicians.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white border border-brand-200 shadow-md">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-slate-900 mt-3 font-['Outfit']">No politicians found</h3>
          <p className="text-xs text-slate-600 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {politicians.map((p) => {
            const badge = getBadgeStyle(p.badgeTier);
            return (
              <div
                key={p._id}
                className="p-7 rounded-3xl bg-white border border-brand-200 shadow-md hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200 shadow-sm bg-brand-50 shrink-0"
                      />
                      <div>
                        <h3 className="text-lg font-black text-slate-900 font-['Outfit'] leading-snug">
                          {p.name}
                        </h3>
                        <p className="text-xs text-brand-900 font-bold mt-0.5">
                          {p.party} • <span className="font-mono">{p.partySymbol}</span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {p.constituency}, {p.state} ({p.house})
                        </p>
                      </div>
                    </div>

                    {/* Impact Score Pill */}
                    <div className="text-right shrink-0">
                      <div className={`px-3 py-1.5 rounded-2xl border flex flex-col items-center shadow-xs ${badge.color}`}>
                        <span className="text-xl font-black font-mono leading-none">{p.impactScore}</span>
                        <span className="text-[9px] uppercase font-black tracking-wider mt-0.5">
                          {badge.icon} {p.badgeTier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rotten Tomatoes Divergence Alert */}
                  {p.divergence?.hasDivergence && (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                      <p className="font-black flex items-center space-x-1.5 text-rose-950">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                        <span>Sentiment–Performance Mismatch</span>
                      </p>
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span>Kaam Score: <strong className="text-slate-900">{p.divergence.kaamScore}</strong></span>
                        <span>Janta Voice: <strong className="text-brand-800">{p.divergence.jantaVoice}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Key Metrics Bento Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-brand-50/70 border border-brand-200">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">Attendance</span>
                      <span className="font-black font-mono text-slate-900 text-sm">
                        {p.metrics?.attendanceRate}%
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] uppercase font-mono text-emerald-900 block font-bold">Fund Utilization</span>
                      <span className="font-black font-mono text-emerald-800 text-sm">
                        {p.metrics?.fundUtilizationPct}%
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">Criminal Cases</span>
                      <span className={`font-black font-mono text-sm ${p.metrics?.criminalCasesPending > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {p.metrics?.criminalCasesPending || 0} Pending
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                      <span className="text-[10px] uppercase font-mono text-purple-900 block font-bold">5-Yr Asset Growth</span>
                      <span className={`font-black font-mono text-sm ${p.assets?.assetGrowthAnomaly ? 'text-rose-600' : 'text-purple-900'}`}>
                        +{p.assets?.assetGrowthPct}% {p.assets?.assetGrowthAnomaly && '🚩'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-4 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    Promises: <strong className="text-slate-900 font-bold">{p.promiseStats?.completed || 0}/{p.promiseStats?.total || 0} Delivered</strong>
                  </span>
                  <Link
                    to={`/politicians/${p._id}`}
                    className="flex items-center space-x-1 text-xs font-black text-brand-700 hover:text-brand-900 font-['Outfit'] group"
                  >
                    <span>Full Audit Profile</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
