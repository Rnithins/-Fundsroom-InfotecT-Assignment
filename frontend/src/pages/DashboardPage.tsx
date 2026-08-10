import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Users,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Boxes,
  Calendar,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res: any = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) return <LoadingSkeleton rows={6} />;

  const { kpis, charts, recentActivity } = data;

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Operations Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time overview of sales, inventory, CRM leads, and billing</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{kpis.totalSalesValue.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Invoiced sales to date</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Products</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.lowStockProductsCount}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Require stock replenishment</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Customers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.activeCustomers}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Out of {kpis.totalCustomers} total clients</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales Challans</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.confirmedChallansCount}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{kpis.draftChallansCount} draft challans pending</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card title="Sales Revenue Monthly Trend" subtitle="Total invoiced amount (INR)">
          <div className="h-64 w-full">
            {charts.salesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.salesOverTime}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Bar dataKey="sales" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No historical sales data</div>
            )}
          </div>
        </Card>

        {/* Challans Status Distribution */}
        <Card title="Challan Status Breakdown" subtitle="Distribution of DRAFT, CONFIRMED, CANCELLED challans">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.challansByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  label={(entry) => `${entry.status}: ${entry.count}`}
                >
                  {charts.challansByStatus.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Secondary Grid: Low Stock Alert + Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card title="⚠️ Prominent Low Stock Alerts" subtitle="Products at or below minimum threshold">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {recentActivity.lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">All product inventory levels are optimal.</p>
            ) : (
              recentActivity.lowStockProducts.map((prod: any) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{prod.name}</h4>
                    <p className="text-xs text-slate-500">SKU: {prod.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="error" className="text-xs">
                      Stock: {prod.currentStock} / Min: {prod.minimumStock}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card title="⭐ Top Selling Products" subtitle="By total revenue generated">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {charts.topSellingProducts.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No sales records available yet.</p>
            ) : (
              charts.topSellingProducts.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">SKU: {item.sku} • {item.totalQuantity} units sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">₹{item.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Audit Log Activity Feed */}
      <Card title="System Activity Log" subtitle="Recent actions performed across teams">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentActivity.activityLogs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <Activity className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{log.user?.name || 'System'} ({log.user?.role || 'SYSTEM'})</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{log.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
