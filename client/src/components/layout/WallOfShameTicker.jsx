import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPoliticiansTicker } from '../../services/api';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function WallOfShameTicker() {
  const [tickerData, setTickerData] = useState({ wallOfFame: [], wallOfShame: [] });
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

  return (
    <div className="bg-gradient-to-r from-brand-50/90 via-white/95 to-brand-50/90 border-b border-brand-100/80 text-xs py-2 overflow-hidden select-none shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Ticker Header Tag */}
        <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-brand-200">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
          </span>
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-brand-900 font-mono flex items-center space-x-1">
            <span>LIVE AUDIT TICKER</span>
          </span>
        </div>

        {/* Marquee Scroller */}
        <div className="flex overflow-x-auto no-scrollbar space-x-6 pl-4 text-xs whitespace-nowrap items-center">
          {/* Wall of Fame */}
          <div className="flex items-center space-x-3 shrink-0">
            <span className="font-bold text-emerald-800 flex items-center space-x-1 font-['Outfit'] text-[11px] uppercase tracking-wide">
              <span>🏆 Top 5 (Wall of Fame):</span>
            </span>
            {tickerData.wallOfFame.map((p, idx) => (
              <Link
                key={p._id || idx}
                to={`/politicians/${p._id}`}
                className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 transition-all shadow-xs"
              >
                <span className="font-bold text-textPrimary text-[11px]">{idx + 1}. {p.name}</span>
                <span className="text-emerald-700 font-mono font-extrabold text-[11px]">{p.impactScore}</span>
                <span className="text-[10px] text-emerald-600 font-medium">({p.trendChange >= 0 ? `+${p.trendChange}` : p.trendChange}↑)</span>
              </Link>
            ))}
          </div>

          <span className="text-brand-200 font-light">|</span>

          {/* Wall of Shame */}
          <div className="flex items-center space-x-3 shrink-0">
            <span className="font-bold text-rose-800 flex items-center space-x-1 font-['Outfit'] text-[11px] uppercase tracking-wide">
              <span>💀 Bottom 5 (Wall of Shame):</span>
            </span>
            {tickerData.wallOfShame.map((p, idx) => (
              <Link
                key={p._id || idx}
                to={`/politicians/${p._id}`}
                className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50/90 border border-rose-200/80 text-rose-900 hover:bg-rose-100/80 transition-all shadow-xs"
              >
                <span className="font-bold text-textPrimary text-[11px]">{idx + 1}. {p.name}</span>
                <span className="text-rose-700 font-mono font-extrabold text-[11px]">{p.impactScore}</span>
                <span className="text-[10px] text-rose-600 font-medium">({p.trendChange}↓)</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
