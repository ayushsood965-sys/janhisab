import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Mail,
  Landmark,
} from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyEmailByToken, resendVerification } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'no_token'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no_token');
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      try {
        const res = await verifyEmailByToken(token);
        if (isMounted) {
          setStatus('success');
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          toast.success('Email successfully verified! Welcome to JanAudit.');
          setTimeout(() => {
            if (res?.user?.role === 'superadmin') navigate('/dashboard/admin');
            else if (res?.user?.role === 'representative') navigate('/dashboard/representative');
            else if (res?.user?.role === 'moderator') navigate('/dashboard/moderator');
            else navigate('/dashboard/citizen');
          }, 2500);
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResending(true);
    try {
      await resendVerification(resendEmail.trim());
      setResendSuccess(true);
      toast.success('New verification link sent! Please check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resending verification link');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-white/95 backdrop-blur-2xl border border-purple-100 p-8 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Brand Emblem */}
        <div className="flex justify-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <Landmark className="w-6 h-6 stroke-[2.2]" />
            </div>
          </Link>
        </div>

        {/* 1. Loading / Verifying State */}
        {status === 'verifying' && (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <RefreshCw className="w-10 h-10 text-violet-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
                Verifying Email Address
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Authenticating cryptographic token with JanAudit security ledger...
              </p>
            </div>
          </div>
        )}

        {/* 2. Success State */}
        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Email Verified Successfully!
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Your civic identity is activated. Redirecting you to your role console...
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['Outfit'] transition-all shadow-md"
              >
                <span>Open Dashboard Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 3. Error / Expired Token State */}
        {status === 'error' && (
          <div className="space-y-4 py-2 text-left">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
                Verification Link Expired
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {errorMessage || 'This verification link is invalid or has passed its 24-hour validity window.'}
              </p>
            </div>

            {/* Resend Form */}
            {resendSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <p className="text-xs font-bold text-emerald-900">Verification Link Resent!</p>
                <p className="text-[11px] text-emerald-700">Please check your inbox and click the new link.</p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Enter your email to receive a new link:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-['Outfit'] transition-all flex items-center justify-center space-x-2"
                >
                  {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Resend Verification Link</span>}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-violet-700 font-bold hover:underline">
                ← Return to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* 4. No Token in URL */}
        {status === 'no_token' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
              <Mail className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
                Check Your Email
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                We sent a verification link to your email address. Please click the link in your inbox to complete verification.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center space-x-1.5 text-xs text-violet-700 font-bold hover:underline"
              >
                <span>Back to JanAudit</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
