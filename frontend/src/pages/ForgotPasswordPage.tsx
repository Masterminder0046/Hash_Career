import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your email to reset your password</p>
      </div>

      {sent ? (
        <div className="glass-card p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">Check your email for the password reset link.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="you@college.edu.in" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
      )}

      <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
    </div>
  );
}
