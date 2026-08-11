import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back! Login successful.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your network connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Mini ERP + CRM Platform
            </span>
            <span className="block text-[10px] text-sky-400 font-mono tracking-wider uppercase">OpsCommand Standard</span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home Page
        </Link>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Title & Badge */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-500/30">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign In</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">Sign in to manage operations, inventory & invoicing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>Click to fill demo accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@example.com', 'Admin@123')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-left font-medium transition-colors flex items-center justify-between"
              >
                <span>👑 ADMIN</span>
                <span className="text-[10px] opacity-60">Full Control</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('sales@example.com', 'Sales@123')}
                className="p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-800/50 text-left font-medium transition-colors flex items-center justify-between"
              >
                <span>💼 SALES</span>
                <span className="text-[10px] opacity-60">CRM & Orders</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('warehouse@example.com', 'Warehouse@123')}
                className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 text-left font-medium transition-colors flex items-center justify-between"
              >
                <span>📦 WAREHOUSE</span>
                <span className="text-[10px] opacity-60">Inventory</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('accounts@example.com', 'Accounts@123')}
                className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 text-left font-medium transition-colors flex items-center justify-between"
              >
                <span>💳 ACCOUNTS</span>
                <span className="text-[10px] opacity-60">Invoices</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-2">
        © 2026 OpsCommand. All rights reserved. v1.0.0
      </footer>
    </div>
  );
};

export default LoginPage;
