import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldCheck,
  RefreshCw,
  Lock,
  UserCheck,
  Key,
  Sparkles,
  Mail,
  User,
  MapPin,
  Building,
  Scale,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const INDIAN_STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Himachal Pradesh', 'Kerala', 'Tamil Nadu', 'Gujarat', 'Punjab', 'Rajasthan'];

export default function AuthModal({ mode = 'login', onClose, onSwitchMode }) {
  const { login, signup, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(mode); // 'login' | 'signup'
  const [step, setStep] = useState('form'); // 'form' | 'otp'

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [state, setState] = useState('Delhi');
  const [constituency, setConstituency] = useState('New Delhi');
  const [credentialsDoc, setCredentialsDoc] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const generateRandomHandle = () => {
    const prefixes = ['AngryAloo', 'ChaiPeCharcha', 'DeshBhaktNagrik', 'RtiWarrior', 'JantaKaBoss', 'PotholeHunter', 'VikasSeeker', 'LokpalJury'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setHandle(`${prefix}_${num}`);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res && res.success) {
        onClose();
        // Redirect to role-specific dashboard
        if (res.user.role === 'superadmin') navigate('/dashboard/admin');
        else if (res.user.role === 'representative') navigate('/dashboard/representative');
        else if (res.user.role === 'moderator') navigate('/dashboard/moderator');
        else navigate('/dashboard/citizen');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signup({
        fullName,
        handle: handle || `Nagrik_${Math.floor(1000 + Math.random() * 9000)}`,
        email,
        password,
        role,
        state,
        constituency,
        credentialsDoc,
      });

      if (res && res.success) {
        setSimulatedOtp(res.otp);
        setRegisteredEmail(res.email || email);
        setStep('otp');
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyEmail(registeredEmail || email || handle, otp);
      if (res && res.success) {
        onClose();
        if (res.user.role === 'superadmin') navigate('/dashboard/admin');
        else if (res.user.role === 'representative') navigate('/dashboard/representative');
        else if (res.user.role === 'moderator') navigate('/dashboard/moderator');
        else navigate('/dashboard/citizen');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset login helper for testing
  const handleQuickLogin = (presetHandle, presetPassword, presetRole) => {
    setLoginIdentifier(presetHandle);
    setLoginPassword(presetPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-brand-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl hover:bg-brand-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-brand-700 to-indigo-600 rounded-2xl shadow-purple-glow mb-3 text-white">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
            {step === 'otp'
              ? 'Verify 6-Digit Email Code'
              : activeTab === 'login'
              ? 'Welcome to JanAudit'
              : 'Join the Accountability Movement'}
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {step === 'otp'
              ? `Enter the verification code sent to ${registeredEmail}`
              : activeTab === 'login'
              ? 'Access your role dashboard and public ledger'
              : 'Zero Plaintext PII Retained • 2-Tier Role Verification'}
          </p>
        </div>

        {/* Navigation Tabs (if on form step) */}
        {step === 'form' && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-brand-50/80 border border-brand-200 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'login'
                  ? 'bg-brand-600 text-white shadow-purple-glow'
                  : 'text-slate-700 hover:text-brand-700 font-bold'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'signup'
                  ? 'bg-brand-600 text-white shadow-purple-glow'
                  : 'text-slate-700 hover:text-brand-700 font-bold'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: LOGIN FORM */}
        {/* ========================================================================= */}
        {step === 'form' && activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                Email Address or Pseudonymous Handle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. AngryAloo_42 or admin@janaudit.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-bold shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-bold shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow hover:scale-[1.01] active:scale-[0.99] transition-all font-['Outfit'] flex items-center justify-center space-x-2 shadow-md"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In & Open Dashboard →</span>}
            </button>

            {/* Quick Testing Preset Pills */}
            <div className="pt-4 border-t border-brand-100 space-y-2">
              <p className="text-[10px] uppercase font-mono text-slate-500 font-bold">Quick Dev Presets (Click to autofill):</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('AngryAloo_42', 'password123', 'citizen')}
                  className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left hover:bg-emerald-100 transition-colors"
                >
                  <p className="font-black text-emerald-950 text-[11px]">👤 Citizen (Sakriya)</p>
                  <p className="text-[9px] text-emerald-700 font-mono">AngryAloo_42</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('SuperAdmin_Nagrik', 'password123', 'superadmin')}
                  className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-left hover:bg-purple-100 transition-colors"
                >
                  <p className="font-black text-purple-950 text-[11px]">👑 Super Admin</p>
                  <p className="text-[9px] text-purple-700 font-mono">SuperAdmin_Nagrik</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('MP_VikasKumar', 'password123', 'representative')}
                  className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-left hover:bg-amber-100 transition-colors"
                >
                  <p className="font-black text-amber-950 text-[11px]">🏛️ Representative</p>
                  <p className="text-[9px] text-amber-700 font-mono">MP_VikasKumar</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('Lokpal_Jury_Head', 'password123', 'moderator')}
                  className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-left hover:bg-blue-100 transition-colors"
                >
                  <p className="font-black text-blue-950 text-[11px]">⚖️ Lokpal Jury</p>
                  <p className="text-[9px] text-blue-700 font-mono">Lokpal_Jury_Head</p>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SIGNUP FORM (2-Tier Pipeline) */}
        {/* ========================================================================= */}
        {step === 'form' && activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {/* Full Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-900">Handle (Anon)</label>
                  <button
                    type="button"
                    onClick={generateRandomHandle}
                    className="text-[10px] text-brand-700 font-bold hover:underline flex items-center space-x-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Auto</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. VikasSeeker_99"
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Email (For OTP)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Role Selection with Clear Visual Explanation */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                Select Your Civic Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    role === 'citizen'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-300'
                      : 'bg-white border-brand-200 text-slate-700 hover:bg-brand-50'
                  }`}
                >
                  <span className="text-lg block mb-0.5">👤</span>
                  <span className="text-xs font-bold block">Citizen</span>
                  <span className="text-[9px] text-emerald-800 font-medium block">Instant OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('representative')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    role === 'representative'
                      ? 'bg-purple-50 border-purple-400 text-purple-950 font-black shadow-xs ring-2 ring-purple-300'
                      : 'bg-white border-brand-200 text-slate-700 hover:bg-brand-50'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🏛️</span>
                  <span className="text-xs font-bold block">Representative</span>
                  <span className="text-[9px] text-purple-800 font-medium block">Admin Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('moderator')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    role === 'moderator'
                      ? 'bg-blue-50 border-blue-400 text-blue-950 font-black shadow-xs ring-2 ring-blue-300'
                      : 'bg-white border-brand-200 text-slate-700 hover:bg-brand-50'
                  }`}
                >
                  <span className="text-lg block mb-0.5">⚖️</span>
                  <span className="text-xs font-bold block">Lokpal Jury</span>
                  <span className="text-[9px] text-blue-800 font-medium block">Admin Review</span>
                </button>
              </div>

              {role !== 'citizen' && (
                <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Privileged Role Verification Notice</span>
                  </p>
                  <p className="text-[11px] leading-snug">
                    After email OTP verification, your application is submitted to Lokpal Super Admin for credential authentication. You will have restricted access until verified.
                  </p>
                </div>
              )}
            </div>

            {/* Constituency & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">Constituency</label>
                <input
                  type="text"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Representative / Moderator credentials URL */}
            {role !== 'citizen' && (
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Official ID / Affidavit / Press Card Verification URL (Optional)
                </label>
                <input
                  type="text"
                  value={credentialsDoc}
                  onChange={(e) => setCredentialsDoc(e.target.value)}
                  placeholder="https://eci.gov.in/affidavits/id.pdf"
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-cta text-white font-extrabold text-xs hover:shadow-purple-glow hover:scale-[1.01] active:scale-[0.99] transition-all font-['Outfit'] flex items-center justify-center space-x-2 shadow-md mt-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send 6-Digit Email OTP →</span>}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION SCREEN */}
        {/* ========================================================================= */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-center space-y-2">
              <span className="text-xs text-slate-600 font-bold">Simulated Email OTP Code:</span>
              <div className="flex items-center justify-center space-x-2">
                <span className="px-4 py-1.5 rounded-xl bg-white border border-brand-300 font-mono text-xl font-black text-brand-700 tracking-widest shadow-xs">
                  {simulatedOtp || '123456'}
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(simulatedOtp || '123456')}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
                >
                  Autofill Code
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center px-4 py-3 rounded-2xl bg-brand-50/50 border border-brand-300 text-2xl font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:border-brand-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-cta text-white font-extrabold text-sm hover:shadow-purple-glow hover:scale-[1.01] active:scale-[0.99] transition-all font-['Outfit'] flex items-center justify-center space-x-2 shadow-md"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Launch Role Dashboard →</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full text-center text-xs text-brand-700 font-bold hover:underline"
            >
              ← Back to Registration Form
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
