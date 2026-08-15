import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPoliticiansTicker } from '../../services/api';
import { TrendingUp, TrendingDown, Flame, ShieldAlert, Award, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function WallOfShameTicker() {
  const [tickerData, setTickerData] = useState({ wallOfFame: [], wallOfShame: [] });
  const scrollerRef = useRef(null);
  const socket = useSocket();

  const fetchTicker = async () => {
    try {
      const res = await getPoliticiansTicker();
      if (res.data.success) {
        setTickerData({
          wallOfFame: res.data.wallOfFame || [],
          wallOfShame: res.data.wallOfShame || [],
        });
      }
    } catch (err) {
      console.warn('Ticker fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchTicker();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('ticker_score_changed', () => {
      fetchTicker();
    });
    return () => socket.off('ticker_score_changed');
  }, [socket]);

  const handleScrollLeft = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-white via-[#F5F2FF] to-white border-b border-purple-100/90 text-xs py-1.5 overflow-hidden select-none shadow-[0_1px_4px_rgba(124,58,237,0.03)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between space-x-2">
        {/* Ticker Header Tag */}
        <div className="flex items-center space-x-2 shrink-0 pr-3 sm:pr-4 border-r border-purple-200/70">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
          </span>
          <span className="font-mono font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200/80 flex items-center space-x-1">
            <span>LIVE AUDIT</span>
          </span>
        </div>

        {/* Scroll Left Arrow Button */}
        <button
          onClick={handleScrollLeft}
          title="Scroll Left"
          className="p-1 rounded-md bg-white/90 hover:bg-purple-100/80 border border-purple-200/70 text-purple-700 hover:text-purple-950 shadow-xs transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Marquee Scroller */}
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto no-scrollbar space-x-4 px-2 whitespace-nowrap items-center flex-1 scroll-smooth"
        >
          {/* Wall of Fame */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="font-black text-emerald-800 flex items-center space-x-1 font-['Outfit'] text-[11px] uppercase tracking-wide">
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Top 5:</span>
            </span>
            {tickerData.wallOfFame.map((p, idx) => (
              <Link
                key={p._id || idx}
                to={`/politicians/${p._id}`}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/90 hover:bg-emerald-50/90 border border-purple-200/60 hover:border-emerald-300 text-slate-800 shadow-xs hover:shadow-sm transition-all"
              >
                <span className="font-bold text-slate-900 text-[11px]">{idx + 1}. {p.name}</span>
                <span className="text-emerald-700 font-mono font-black text-[11px]">{p.impactScore}</span>
                <span className="text-[10px] text-emerald-600 font-bold">({p.trendChange >= 0 ? `+${p.trendChange}` : p.trendChange}↑)</span>
              </Link>
            ))}
          </div>

          <span className="text-purple-300 font-light">|</span>

          {/* Wall of Shame */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="font-black text-rose-800 flex items-center space-x-1 font-['Outfit'] text-[11px] uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Bottom 5:</span>
            </span>
            {tickerData.wallOfShame.map((p, idx) => (
              <Link
                key={p._id || idx}
                to={`/politicians/${p._id}`}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/90 hover:bg-rose-50/90 border border-purple-200/60 hover:border-rose-300 text-slate-800 shadow-xs hover:shadow-sm transition-all"
              >
                <span className="font-bold text-slate-900 text-[11px]">{idx + 1}. {p.name}</span>
                <span className="text-rose-700 font-mono font-black text-[11px]">{p.impactScore}</span>
                <span className="text-[10px] text-rose-600 font-bold">({p.trendChange}↓)</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll Right Arrow Button */}
        <button
          onClick={handleScrollRight}
          title="Scroll Right"
          className="p-1 rounded-md bg-white/90 hover:bg-purple-100/80 border border-purple-200/70 text-purple-700 hover:text-purple-950 shadow-xs transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
