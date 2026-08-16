import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-700' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500 text-amber-700' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-700' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res && res.success) {
        setSuccess(true);
        toast.success('Password has been reset successfully! Logging you in.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-white/95 backdrop-blur-2xl border border-purple-100 p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Brand Emblem */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <Landmark className="w-6 h-6 stroke-[2.2]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
            {success ? 'Password Reset Complete' : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {success
              ? 'Your password was updated securely. Redirecting to your console...'
              : 'Choose a strong new password for your JanAudit account.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['Outfit'] transition-all shadow-md"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Strength:</span>
                    <span className={`font-bold ${strength.color.split(' ')[1]}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength.score >= 1 ? strength.color.split(' ')[0] : 'bg-transparent'
                      } w-1/3`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength.score >= 2 ? strength.color.split(' ')[0] : 'bg-transparent'
                      } w-1/3`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength.score >= 3 ? strength.color.split(' ')[0] : 'bg-transparent'
                      } w-1/3`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-['Outfit'] transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Password & Sign In →</span>}
            </button>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-violet-700 font-bold hover:underline">
                ← Cancel and return home
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
