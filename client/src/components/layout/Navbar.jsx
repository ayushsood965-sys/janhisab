import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquareQuote,
  Users,
  CheckCircle2,
  FileText,
  MapPin,
  Sparkles,
  ChevronDown,
  Plus,
  LogOut,
  Menu,
  X,
  Shield,
  Scale,
  Building2,
  Flame,
  Music2,
  Smile,
  Layers,
  Radio,
  Landmark,
  ShieldCheck,
  Flag,
  Award,
  BookOpen,
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';

export default function Navbar({ onOpenCreatePost }) {
  const { user, isAuthenticated, logout, verifyUpi } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Primary top-level navigation items
  const primaryNav = [
    { name: 'Voice Wall', path: '/', icon: MessageSquareQuote },
    { name: 'Politicians', path: '/politicians', icon: Users },
    { name: 'Wada Tracker', path: '/promises', icon: CheckCircle2 },
    { name: 'RTI Factory', path: '/rti-factory', icon: FileText },
    { name: 'Constituency Map', path: '/constituency-map', icon: MapPin },
  ];

  // Action & Civic modules dropdown
  const exploreModules = [
    {
      name: 'Petitions Center',
      path: '/petitions',
      icon: Flag,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      desc: 'Digital citizen campaigns & mass petitions',
    },
    {
      name: 'Institutions Directory',
      path: '/institutions',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      desc: 'Audit PWD, Jal Board, Police & Municipal offices',
    },
    {
      name: 'Bounty Board',
      path: '/bounties',
      icon: Flame,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
      desc: 'Fact-finding bounties & open evidence bounties',
    },
    {
      name: 'Grievance Cell',
      path: '/grievance',
      icon: Scale,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      desc: 'Section 79 IT Rules 2021 statutory redressal',
    },
  ];

  // Culture & Live Engagement dropdown
  const cultureModules = [
    {
      name: 'Meme Studio',
      path: '/meme-studio',
      icon: Smile,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      desc: 'Create satirical civic memes & roast netas',
    },
    {
      name: 'Protest Jukebox',
      path: '/protest-jukebox',
      icon: Music2,
      color: 'text-pink-600 bg-pink-50 border-pink-100',
      desc: 'Civic protest tracks & masked whistleblower audio',
    },
    {
      name: 'Neta Cards',
      path: '/neta-cards',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      desc: 'Collectible report cards & politician power stats',
    },
    {
      name: 'Andolan 48h Live',
      path: '/andolan',
      icon: Radio,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      desc: 'Ephemeral 48-hour coordinated protest rooms',
      isLive: true,
    },
    {
      name: 'Scoring Algorithm',
      path: '/about',
      icon: BookOpen,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      desc: '100% open formulas, equations & OGD sources',
    },
  ];

  const getKarmaBadge = (tier) => {
    switch (tier) {
      case 'guardian':
        return { label: 'Guardian 🟡', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'prabhari':
        return { label: 'Prabhari 🔵', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'sakriya':
        return { label: 'Sakriya 🟢', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'Nagrik 🟤', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
  };

  const karmaBadge = getKarmaBadge(user?.karmaTier || 'nagrik');

  const isExploreActive = exploreModules.some((m) => location.pathname === m.path);
  const isCultureActive = cultureModules.some((m) => location.pathname === m.path);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-purple-100/80 shadow-[0_2px_12px_rgba(124,58,237,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left Section: Logo + Navigation Links */}
            <div className="flex items-center space-x-8 lg:space-x-10">
              {/* 1. Brand Logo */}
              <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-all">
                  <Landmark className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 font-['Outfit'] group-hover:text-violet-700 transition-colors">
                  Jan<span className="text-violet-600">Audit</span>
                </span>
              </Link>

              {/* 2. Desktop Navigation Center */}
              <nav className="hidden xl:flex items-center space-x-1.5">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-violet-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                );
              })}

              {/* Action Dropdown (Petitions, Institutions, Grievance, Bounties) */}
              <div className="relative group">
                <button
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isExploreActive
                      ? 'bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/60 border border-transparent'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isExploreActive ? 'text-violet-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                  <span className="whitespace-nowrap">Accountability</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                <div className="absolute left-0 mt-2 w-72 rounded-2xl p-2 hidden group-hover:block bg-white/95 backdrop-blur-2xl border border-purple-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900/60">
                    Governance & Legal Action
                  </div>
                  <div className="space-y-1">
                    {exploreModules.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-start space-x-2.5 p-2 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-violet-50/80 border border-violet-100'
                              : 'hover:bg-purple-50/50 border border-transparent'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">{item.name}</p>
                            <p className="text-[11px] text-slate-500 font-normal leading-tight line-clamp-1">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Culture & Media Dropdown (Meme, Jukebox, Neta Cards, Andolan) */}
              <div className="relative group">
                <button
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isCultureActive
                      ? 'bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/60 border border-transparent'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isCultureActive ? 'text-violet-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                  <span className="whitespace-nowrap">Civic Lab</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                <div className="absolute right-0 mt-2 w-72 rounded-2xl p-2 hidden group-hover:block bg-white/95 backdrop-blur-2xl border border-purple-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900/60">
                    Culture, Satire & Community
                  </div>
                  <div className="space-y-1">
                    {cultureModules.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-start space-x-2.5 p-2 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-violet-50/80 border border-violet-100'
                              : 'hover:bg-purple-50/50 border border-transparent'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <p className="text-xs font-bold text-slate-900 leading-snug">{item.name}</p>
                              {item.isLive && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal leading-tight line-clamp-1">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* 3. Right Action Controls */}
            <div className="flex items-center space-x-2.5 shrink-0">
              {/* Primary CTA: Raise Issue */}
              <button
                onClick={onOpenCreatePost}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all font-['Outfit'] whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400 stroke-[2.5]" />
                <span>Raise Issue</span>
              </button>

              {/* User Account / Auth Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* Quick Console Link */}
                  <Link
                    to="/dashboard"
                    className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-purple-950 transition-colors whitespace-nowrap"
                  >
                    <span>
                      {user.role === 'superadmin' ? '👑' : user.role === 'representative' ? '🏛️' : user.role === 'moderator' ? '⚖️' : '👤'}
                    </span>
                    <span className="capitalize">{user.role} Console</span>
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-xl bg-purple-50/80 hover:bg-purple-100/70 border border-purple-200/80 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs font-mono">
                        {user.handle ? user.handle.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div className="hidden sm:block text-left text-xs">
                        <p className="font-bold text-slate-900 leading-tight truncate max-w-[90px]">{user.handle}</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl p-3 z-50 bg-white/95 backdrop-blur-2xl border border-purple-100 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="pb-3 border-b border-slate-100">
                          <p className="text-sm font-black text-slate-900 font-['Outfit']">{user.handle}</p>
                          <p className="text-xs text-slate-500">{user.constituency}, {user.state}</p>
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${karmaBadge.color}`}>
                              {karmaBadge.label}
                            </span>
                            <span className="text-xs font-mono text-violet-700 font-extrabold">
                              {user.jantaPoints || 0} XP
                            </span>
                          </div>
                        </div>

                        {!user.verifiedNagrik && (
                          <div className="py-2 border-b border-slate-100">
                            <button
                              onClick={async () => {
                                await verifyUpi();
                                toast.success('₹11 Verified Nagrik badge activated! 3x voting power enabled.', 'Verification Active');
                              }}
                              className="w-full text-left p-2 rounded-xl bg-amber-50/80 border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              <p className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Verify Nagrik (₹11 UPI)</span>
                              </p>
                              <p className="text-[10px] text-amber-800 mt-0.5">
                                Add economic trust signal & 3x voting multiplier.
                              </p>
                            </button>
                          </div>
                        )}

                        <div className="pt-2 space-y-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-violet-600" />
                            <span>Open {user.role?.toUpperCase()} Console</span>
                          </Link>
                          <Link
                            to="/neta-cards"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                          >
                            <Award className="w-4 h-4 text-violet-600" />
                            <span>My Neta Cards Deck</span>
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-violet-700 hover:bg-violet-50/70 border border-slate-200/80 transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                Core Navigation
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-violet-600" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                Accountability & Action
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {exploreModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-violet-600" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                Culture, Satire & Live Lab
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {cultureModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-violet-600" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
}
