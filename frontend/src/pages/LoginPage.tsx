import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Lock, Mail, UserCheck } from 'lucide-react';

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
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-800">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-900/40">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mini ERP + CRM Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage operations, inventory & invoicing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-3">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Click to fill demo accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setDemoCredentials('admin@example.com', 'Admin@123')}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-left font-medium transition-colors"
            >
              👑 ADMIN
            </button>
            <button
              onClick={() => setDemoCredentials('sales@example.com', 'Sales@123')}
              className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-left font-medium transition-colors"
            >
              💼 SALES
            </button>
            <button
              onClick={() => setDemoCredentials('warehouse@example.com', 'Warehouse@123')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-left font-medium transition-colors"
            >
              📦 WAREHOUSE
            </button>
            <button
              onClick={() => setDemoCredentials('accounts@example.com', 'Accounts@123')}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left font-medium transition-colors"
            >
              💳 ACCOUNTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
