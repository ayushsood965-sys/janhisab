import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Users,
  CheckCircle,
  FileText,
  Flag,
  MapPin,
  Smile,
  Music,
  CreditCard,
  Target,
  Radio,
  Scale,
  Shield,
  PlusCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Award,
  Landmark,
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';

const navItems = [
  { name: 'Voice Wall', path: '/', icon: MessageSquare },
  { name: 'Politicians', path: '/politicians', icon: Users },
  { name: 'Wada Tracker', path: '/promises', icon: CheckCircle },
  { name: 'RTI Factory', path: '/rti-factory', icon: FileText },
  { name: 'Petitions', path: '/petitions', icon: Flag },
  { name: 'Constituency Map', path: '/constituency-map', icon: MapPin },
  { name: 'Meme Studio', path: '/meme-studio', icon: Smile },
  { name: 'Awaaz Jukebox', path: '/protest-jukebox', icon: Music },
  { name: 'Neta Cards', path: '/neta-cards', icon: CreditCard },
  { name: 'Bounty Board', path: '/bounties', icon: Target },
  { name: 'Andolan 48h', path: '/andolan', icon: Radio, highlight: true },
  { name: 'Grievance', path: '/grievance', icon: Scale },
  { name: 'CMS Admin', path: '/cms-admin', icon: Shield },
];

export default function Navbar({ onOpenCreatePost }) {
  const { user, isAuthenticated, logout, verifyUpi } = useAuth();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getKarmaBadge = (tier) => {
    switch (tier) {
      case 'guardian':
        return { label: 'Guardian 🟡', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
      case 'prabhari':
        return { label: 'Prabhari 🔵', color: 'bg-blue-100 text-blue-900 border-blue-300 font-bold' };
      case 'sakriya':
        return { label: 'Sakriya 🟢', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
      default:
        return { label: 'Nagrik 🟤', color: 'bg-purple-100 text-purple-900 border-purple-300 font-bold' };
    }
  };

  const karmaBadge = getKarmaBadge(user?.karmaTier || 'nagrik');

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-brand-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link to="/" className="flex items-center space-x-3 group">
                {/* Visual Civic Emblem Badge */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white group-hover:scale-105 transition-all p-2.5 border border-purple-300/50 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #4F46E5 100%)' }}
                >
                  <Landmark className="w-7 h-7 text-white stroke-[2.5]" style={{ color: '#FFFFFF' }} />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black tracking-tight text-slate-900 font-['Outfit'] group-hover:text-brand-700 transition-colors">
                      Jan<span className="text-brand-600">Hisab</span>
                    </span>
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wide font-mono uppercase shadow-sm"
                      style={{ backgroundColor: '#6D28D9', color: '#FFFFFF' }}
                    >
                      JANTA KA BOSS
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono -mt-0.5">
                    India's Civic Audit Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1.5">
              {navItems.slice(0, 7).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-purple-glow'
                        : 'text-slate-700 hover:text-brand-700 hover:bg-brand-50'
                    } ${item.highlight ? 'text-rose-600 font-extrabold' : ''}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* More Dropdown Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-colors">
                  <span>More Modules</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute right-0 mt-1 w-56 rounded-2xl p-2 hidden group-hover:block bg-white/95 backdrop-blur-2xl border border-brand-200/90 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  {navItems.slice(7).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-700 hover:text-brand-700 hover:bg-brand-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-600" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Right Action CTA & User Account */}
            <div className="flex items-center space-x-3">
              {/* Quick Post CTA */}
              <button
                onClick={onOpenCreatePost}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-cta text-white shadow-purple-glow hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all font-['Outfit']"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Raise Issue</span>
              </button>

              {/* User Account / Auth CTA */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* Dedicated Role Dashboard Button */}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-brand-50 border border-brand-200 text-brand-900 hover:bg-brand-100 hover:border-brand-300 transition-all font-['Outfit'] shadow-xs"
                  >
                    <span className="text-sm">
                      {user.role === 'superadmin' ? '👑' : user.role === 'representative' ? '🏛️' : user.role === 'moderator' ? '⚖️' : '👤'}
                    </span>
                    <span className="hidden sm:inline capitalize">{user.role} Console</span>
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-2xl bg-brand-50/80 border border-brand-200 hover:border-brand-400 shadow-xs transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm font-mono">
                        {user.handle ? user.handle.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div className="hidden md:block text-left text-xs">
                        <p className="font-extrabold text-slate-900 leading-tight truncate max-w-[100px]">{user.handle}</p>
                        <p className="text-[10px] text-brand-700 font-mono font-bold">{user.jantaPoints || 0} XP</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 rounded-3xl p-4 z-50 bg-white/95 backdrop-blur-2xl border border-brand-200/90 shadow-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="pb-3 border-b border-brand-100">
                          <p className="text-sm font-black text-slate-900 font-['Outfit']">{user.handle}</p>
                          <p className="text-xs text-slate-600">{user.constituency}, {user.state}</p>
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${karmaBadge.color}`}>
                              {karmaBadge.label}
                            </span>
                            <span className="text-xs font-mono text-brand-700 font-extrabold">
                              {user.jantaPoints} Janta Points
                            </span>
                          </div>
                        </div>

                        {!user.verifiedNagrik && (
                          <div className="py-2.5 border-b border-brand-100">
                            <button
                              onClick={async () => {
                                await verifyUpi();
                                alert('🎉 ₹11 Verified Nagrik badge activated! 3x voting power enabled.');
                              }}
                              className="w-full text-left p-2.5 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              <p className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Verify Nagrik (₹11 UPI)</span>
                              </p>
                              <p className="text-[10px] text-amber-800 mt-0.5">
                                Add economic trust signal & 3x quadratic voting weight.
                              </p>
                            </button>
                          </div>
                        )}

                        <div className="pt-2.5 space-y-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-brand-600" />
                            <span>Open {user.role?.toUpperCase()} Console</span>
                          </Link>
                          <Link
                            to="/neta-cards"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                          >
                            <Award className="w-4 h-4 text-brand-600" />
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
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 bg-white border border-brand-200 shadow-xs transition-all"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all shadow-xs"
                  >
                    Join Anon
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-white border border-brand-200 text-slate-700 hover:text-brand-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-brand-100 px-4 pt-2 pb-4 shadow-xl">
            <div className="grid grid-cols-2 gap-2 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-700 hover:bg-brand-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
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
