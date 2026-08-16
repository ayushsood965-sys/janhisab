import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { checkUsernameAvailability } from '../../services/api';
import {
  X,
  ShieldCheck,
  RefreshCw,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const INDIAN_STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Himachal Pradesh',
  'Kerala', 'Tamil Nadu', 'Gujarat', 'Punjab', 'Rajasthan', 'West Bengal', 'Bihar'
];

export default function AuthModal({ mode = 'login', onClose, onSwitchMode }) {
  const { login, signup, forgotPassword, resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Tab / Screen Mode: 'login' | 'signup' | 'forgot' | 'verification_sent'
  const [activeTab, setActiveTab] = useState(mode === 'register' ? 'signup' : mode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [role, setRole] = useState('citizen');
  const [state, setState] = useState('Delhi');
  const [constituency, setConstituency] = useState('New Delhi');
  const [credentialsDoc, setCredentialsDoc] = useState('');

  // Real-time username availability state
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // { available: boolean, message: string, suggestions: [] }
  const debounceTimerRef = useRef(null);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Verification sent confirmation state
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time debounced username check
  useEffect(() => {
    if (activeTab !== 'signup') return;

    const trimmed = handle.trim();
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus(null);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(trimmed);
        if (res.data.success) {
          setUsernameStatus(res.data);
        }
      } catch (err) {
        console.warn('Username check error:', err.message);
      } finally {
        setCheckingUsername(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [handle, activeTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res && res.success) {
        toast.success(`Welcome back, @${res.user.handle}!`);
        onClose();
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

    if (usernameStatus && !usernameStatus.available) {
      setError('Please choose an available username before proceeding.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        fullName,
        handle: handle.trim(),
        email: email.trim(),
        password,
        role,
        state,
        constituency,
        credentialsDoc,
      });

      if (res && res.success) {
        setRegisteredEmail(res.email || email);
        setActiveTab('verification_sent');
        toast.success('Registration successful! Verification link sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotSent(true);
      toast.success('Password reset link dispatched to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      await resendVerification(registeredEmail);
      toast.success('Fresh verification link dispatched!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resending verification link');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-lg w-full p-7 sm:p-9 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-2xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 rounded-2xl shadow-md shadow-violet-500/20 mb-3 text-white">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
            {activeTab === 'login' && 'Sign In to JanAudit'}
            {activeTab === 'signup' && 'Create Your Citizen Account'}
            {activeTab === 'forgot' && 'Reset Your Password'}
            {activeTab === 'verification_sent' && 'Verify Your Email'}
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {activeTab === 'login' && 'Access verified civic data, citizen ballots & audits'}
            {activeTab === 'signup' && 'Zero-PII pseudonymous governance • Cryptographically verified'}
            {activeTab === 'forgot' && 'Enter your email to receive a secure password recovery link'}
            {activeTab === 'verification_sent' && `We sent an activation link to ${registeredEmail}`}
          </p>
        </div>

        {/* Main Tab Switcher (Visible on Login / Signup) */}
        {(activeTab === 'login' || activeTab === 'signup') && (
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-purple-50/70 border border-purple-100 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-violet-700 shadow-sm border border-purple-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-violet-700 shadow-sm border border-purple-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: SIGN IN */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="name@example.com or username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setError('');
                  }}
                  className="text-[11px] text-violet-700 font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-['Outfit'] transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In to Dashboard →</span>}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CREATE ACCOUNT (WITH REAL-TIME USERNAME AVAILABILITY & SUGGESTIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {/* Full Name & Real-time Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Username / Handle</label>
                  {checkingUsername ? (
                    <span className="text-[10px] text-violet-600 font-mono flex items-center space-x-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Checking...</span>
                    </span>
                  ) : usernameStatus ? (
                    usernameStatus.available ? (
                      <span className="text-[10px] text-emerald-700 font-bold">✓ Available</span>
                    ) : (
                      <span className="text-[10px] text-rose-600 font-bold">✕ Taken</span>
                    )
                  ) : null}
                </div>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. rahul_nagrik"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none transition-all ${
                    usernameStatus
                      ? usernameStatus.available
                        ? 'bg-emerald-50/40 border border-emerald-300 text-slate-900 focus:border-emerald-500'
                        : 'bg-rose-50/40 border border-rose-300 text-slate-900 focus:border-rose-500'
                      : 'bg-purple-50/40 border border-purple-100 text-slate-900 focus:border-violet-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Smart Username Suggestions if handle taken */}
            {usernameStatus && !usernameStatus.available && usernameStatus.suggestions?.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                <p className="text-[11px] font-bold text-rose-900">
                  That username is taken. Try one of these available suggestions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {usernameStatus.suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setHandle(sug)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-violet-800 text-[11px] font-mono font-bold hover:bg-violet-50 hover:border-violet-300 transition-all shadow-2xs"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3.5 pr-8 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Select Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'citizen'
                      ? 'bg-violet-50 border-violet-400 text-violet-950 font-black ring-2 ring-violet-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base block mb-0.5">👤</span>
                  <span className="text-xs font-bold block">Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('representative')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'representative'
                      ? 'bg-violet-50 border-violet-400 text-violet-950 font-black ring-2 ring-violet-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base block mb-0.5">🏛️</span>
                  <span className="text-xs font-bold block">Representative</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('moderator')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === 'moderator'
                      ? 'bg-violet-50 border-violet-400 text-violet-950 font-black ring-2 ring-violet-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base block mb-0.5">⚖️</span>
                  <span className="text-xs font-bold block">Lokpal Jury</span>
                </button>
              </div>
            </div>

            {/* State & Constituency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Constituency</label>
                <input
                  type="text"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (usernameStatus && !usernameStatus.available)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-['Outfit'] transition-all shadow-md flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Account & Send Link →</span>}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {activeTab === 'forgot' && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-100 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Mail className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Password Reset Link Sent
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an account exists for <strong>{forgotEmail}</strong>, we have sent a secure password reset link valid for 1 hour.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setForgotSent(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-['Outfit'] transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions →</span>}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs text-violet-700 font-bold hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VERIFICATION LINK SENT CONFIRMATION */}
        {/* ========================================================================= */}
        {activeTab === 'verification_sent' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 border border-purple-200 text-violet-700 flex items-center justify-center shadow-xs">
              <Mail className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 font-['Outfit']">
                Check Your Inbox
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                We sent an activation link to <strong>{registeredEmail}</strong>. Click the link in your email to activate your account.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-violet-800 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
              >
                {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Resend Verification Link</span>}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Close & Return to Platform
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
