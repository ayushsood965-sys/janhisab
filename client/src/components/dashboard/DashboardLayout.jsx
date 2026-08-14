import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Landmark,
  Shield,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  ArrowLeft,
  ChevronRight,
  User,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({
  title,
  subtitle,
  roleName,
  roleBadgeColor = 'bg-brand-100 text-brand-900 border-brand-300',
  roleIcon: RoleIcon = User,
  sidebarItems = [],
  activeTab,
  onTabChange,
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPendingApproval = user?.verificationStatus === 'PENDING_ADMIN_VERIFICATION';
  const isRejected = user?.verificationStatus === 'REJECTED';

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================================= */}
      {/* 🏛️ TOP CONSOLE HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-brand-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Dashboard Tag */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-brand-50 text-slate-700 hover:text-brand-700"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center space-x-2.5 group">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white p-2 border border-purple-300/40 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #4F46E5 100%)' }}
                >
                  <Landmark className="w-full h-full text-white stroke-[2.5]" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 font-['Outfit']">
                  Jan<span className="text-brand-600">Hisab</span>
                </span>
              </Link>

              <span className="hidden sm:inline text-slate-300">/</span>

              <div className="hidden sm:flex items-center space-x-2">
                <span className={`text-xs px-3 py-1 rounded-full border font-black uppercase font-mono flex items-center space-x-1 ${roleBadgeColor}`}>
                  <RoleIcon className="w-3.5 h-3.5 mr-1" />
                  <span>{roleName} Console</span>
                </span>

                {isPendingApproval && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold font-mono animate-pulse flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Awaiting Admin Approval</span>
                  </span>
                )}
                {isRejected && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-extrabold font-mono">
                    Application Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Right: Public Portal Link & User Info & Logout */}
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-700 bg-white border border-brand-200 hover:text-brand-700 hover:bg-brand-50 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Public Portal</span>
              </Link>

              {user && (
                <div className="flex items-center space-x-2 pl-2 border-l border-brand-200">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-xs font-mono">
                    {user.handle ? user.handle.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <p className="font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">{user.handle}</p>
                    <p className="text-[10px] text-brand-700 font-mono font-bold">{user.jantaPoints || 0} XP</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                title="Log Out"
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 📐 DASHBOARD BODY WITH LEFT SIDEBAR NAVIGATION */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <aside
          className={`lg:w-64 shrink-0 space-y-4 ${
            mobileSidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* User Mini Profile Card */}
          <div className="p-5 rounded-3xl bg-white border border-brand-200 shadow-md space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-sm font-mono">
                {user?.handle ? user.handle.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate font-['Outfit']">{user?.fullName || user?.handle}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.constituency}, {user?.state}</p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-brand-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-bold">Karma XP</span>
              <span className="font-black text-brand-700 font-mono">{user?.jantaPoints || 0} XP</span>
            </div>
          </div>

          {/* Sidebar Navigation Menu */}
          <div className="p-3 rounded-3xl bg-white border border-brand-200 shadow-md space-y-1">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold px-3 py-2">
              Console Modules
            </p>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-purple-glow'
                      : 'text-slate-700 hover:text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-100 text-brand-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Support / Safe Harbor Box */}
          <div className="p-4 rounded-3xl bg-brand-50/70 border border-brand-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>Democracy Vault</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              All actions are signed and cryptographically immutabilized on the JanHisab audit trail.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 overflow-hidden">
          {/* Top Banner Alert if Verification Pending */}
          {isPendingApproval && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1 shadow-sm animate-in fade-in">
              <div className="flex items-center space-x-2 font-black font-['Outfit'] text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Restricted Mode: Awaiting Lokpal Super Admin Verification</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Your official application for the <strong>{roleName}</strong> role is in the Super Admin Verification Queue. You can preview your console, draft notes, and view constituency issues. Full publishing rights will unlock immediately upon Super Admin authentication.
              </p>
            </div>
          )}

          {/* Dynamic Content View */}
          {children}
        </main>
      </div>
    </div>
  );
}
