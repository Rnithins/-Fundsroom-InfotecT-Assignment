import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Users,
  Package,
  FileText,
  Lock,
  History,
  ShieldCheck,
  ArrowRight,
  Mail,
  UserCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  CheckCircle2,
  Database,
  Layers,
  BarChart3,
} from 'lucide-react';

interface LandingPageProps {
  focusLogin?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ focusLogin = false }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (focusLogin || location.hash === '#login') {
      const el = document.getElementById('login');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [focusLogin, location.hash]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back! Authentication successful.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    scrollToSection('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Banner if already authenticated */}
      {user && (
        <div className="bg-gradient-to-r from-sky-900/80 via-slate-900 to-indigo-900/80 border-b border-sky-500/20 py-2.5 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3">
          <span className="text-sky-300">Logged in as <strong className="text-white">{user.name}</strong> ({user.role})</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-full text-xs font-semibold transition-all shadow-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Go to Operations Dashboard
          </button>
        </div>
      )}

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Mini ERP + CRM Platform
              </span>
              <span className="block text-[10px] text-sky-400 font-mono tracking-wider uppercase">OpsCommand Standard</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-sky-400 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-sky-400 transition-colors">
              Workflow
            </button>
            <button onClick={() => scrollToSection('roles')} className="hover:text-sky-400 transition-colors">
              Roles
            </button>
            <button onClick={() => scrollToSection('login')} className="hover:text-sky-400 transition-colors">
              Sign In
            </button>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scrollToSection('login')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Roles
            </button>
            <button
              onClick={() => scrollToSection('login')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Sign In
            </button>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('login')}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-center text-sm shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-8 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Enterprise Wholesale Suite</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Manage Your Business Operations From Customers to Inventory to Sales.
        </h1>

        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          A modern Operations Portal built specifically for wholesale and distribution businesses to streamline CRM logs, master product catalogs, and verify sales challan fulfillments.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollToSection('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            Access Portal
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all hover:scale-[1.02]"
          >
            Explore Features
          </button>
        </div>

        {/* Hero Visual Banner / Stats preview */}
        <div className="mt-16 p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">Stock Integrity</div>
              <div className="text-2xl font-bold text-white">100% Lock Safe</div>
              <div className="text-[11px] text-slate-400 mt-1">FOR NO KEY UPDATE</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">CRM Audit</div>
              <div className="text-2xl font-bold text-white">Immutable Logs</div>
              <div className="text-[11px] text-slate-400 mt-1">Lead to Active flow</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">Order Challans</div>
              <div className="text-2xl font-bold text-white">Static Snapshots</div>
              <div className="text-[11px] text-slate-400 mt-1">Pricing & Tax locked</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">Security</div>
              <div className="text-2xl font-bold text-white">RBAC Protected</div>
              <div className="text-[11px] text-slate-400 mt-1">4 Distinct Workspaces</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Wholesale & Distribution
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Essential enterprise modules for absolute stock integrity and auditable follow-ups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all hover:shadow-lg hover:shadow-sky-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Customer CRM</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track client lifecycles from Leads to Active. Record immutable follow-up notes and schedule dates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Inventory Catalog</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage master product listings, warehouse locations, alert thresholds, and pricing snapshots.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sales Challans</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Draft dispatch requests, check stock levels, capture static product snapshots, and confirm fulfillment.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Transaction-Safe Operations</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Row-level pessimistic locking (<code className="text-amber-300 font-mono text-xs">FOR NO KEY UPDATE</code>) guarantees stock balances never fall below zero.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Immutable Ledger</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Auditable logs for every manual stock adjustment, return dispatch, or confirmed order fulfillment.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all hover:shadow-lg hover:shadow-rose-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Role-Based Access</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Granular view configurations and route protections for Admins, Sales Agents, Warehouse Ops, and Accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section id="workflow" className="py-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Unified Operations Workflow
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              The seamless progression of customers and orders inside the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connection line behind cards for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 -translate-y-6 z-0" />

            {/* Step 1 */}
            <div className="relative z-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left flex flex-col h-full hover:border-sky-500 transition-all">
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-black text-lg flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">CRM Lead</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Qualify contacts and capture follow-ups.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left flex flex-col h-full hover:border-indigo-500 transition-all">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-black text-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Draft Challan</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Build orders and snapshot catalog items.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left flex flex-col h-full hover:border-amber-500 transition-all">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Stock Locks</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                PostgreSQL locks verify stock levels atomically.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left flex flex-col h-full hover:border-emerald-500 transition-all">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black text-lg flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fulfillment</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Deduct inventory and publish ledger updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section id="roles" className="py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Role-Specific Workspace Views
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Targeted tools to make every business operator faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ADMIN */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 font-extrabold text-xs rounded-md uppercase tracking-wider mb-4 border border-purple-500/30">
                  ADMIN
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Full operational oversight. Catalog editing, user provisioning settings, and global auditing ledger logs.
                </p>
              </div>
              <button
                onClick={() => setDemoCredentials('admin@example.com', 'Admin@123')}
                className="mt-6 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                Sign in as Admin <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SALES */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-sky-500/30 bg-gradient-to-b from-sky-950/20 to-slate-900 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-sky-500/20 text-sky-300 font-extrabold text-xs rounded-md uppercase tracking-wider mb-4 border border-sky-500/30">
                  SALES
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Qualify CRM accounts, insert client communication logs, and build sales drafts for warehouses.
                </p>
              </div>
              <button
                onClick={() => setDemoCredentials('sales@example.com', 'Sales@123')}
                className="mt-6 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                Sign in as Sales <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WAREHOUSE */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-md uppercase tracking-wider mb-4 border border-amber-500/30">
                  WAREHOUSE
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Conduct manual inventory intake adjustments, verify bin locations, and confirm sales dispatches.
                </p>
              </div>
              <button
                onClick={() => setDemoCredentials('warehouse@example.com', 'Warehouse@123')}
                className="mt-6 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                Sign in as Warehouse <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ACCOUNTS */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-md uppercase tracking-wider mb-4 border border-emerald-500/30">
                  ACCOUNTS
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Inspect historical challan snapshots and view inventory levels for financial audits.
                </p>
              </div>
              <button
                onClick={() => setDemoCredentials('accounts@example.com', 'Accounts@123')}
                className="mt-6 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Sign in as Accounts <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-sky-900/60 via-slate-900 to-indigo-900/60 border-t border-slate-800/80 relative text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to simplify your operations?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Sign in to start managing your workflow scenarios.
          </p>
          <div className="mt-8">
            <button
              onClick={() => scrollToSection('login')}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl hover:scale-[1.02] transition-all inline-flex items-center gap-2"
            >
              Access Operations Portal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SIGN IN SECTION / FORM */}
      <section id="login" className="py-20 bg-slate-950 border-t border-slate-800/80 relative scroll-mt-20">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-tr from-sky-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-500/30">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1.5">Enter credentials to access your operational workspace</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
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
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span>Quick Fill Demo Roles:</span>
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
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 OpsCommand. All rights reserved.
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
