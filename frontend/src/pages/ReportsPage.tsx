import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { BarChart3, Calendar, DollarSign, Package, Users, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const { showToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/reports', {
        params: { startDate, endDate },
      });
      setReportData(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch business reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  if (loading || !reportData) return <LoadingSkeleton rows={6} />;

  const { summary, invoices, lowStockProducts, challans } = reportData;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Operations & Financial Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive analytics, sales performance, and inventory health summaries</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:ring-0"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:ring-0"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-sky-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Gross Sales Revenue</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">₹{summary.totalSales.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">₹{summary.paidSales.toLocaleString('en-IN')} Collected</p>
            </div>
            <DollarSign className="w-6 h-6 text-sky-600" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending Receivables</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">₹{summary.pendingSales.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-amber-600 mt-0.5 font-medium">Awaiting payment settlement</p>
            </div>
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Inventory Value</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">₹{summary.totalStockValue.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-purple-600 mt-0.5 font-medium">{summary.lowStockCount} Low stock SKUs</p>
            </div>
            <Package className="w-6 h-6 text-purple-600" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Registered Customers</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{summary.newCustomersCount} Total</h3>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">{summary.activeCount} Active Accounts</p>
            </div>
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
        </Card>
      </div>

      {/* Low Stock Report Section */}
      <Card title="Inventory Low-Stock Replenishment Report" subtitle="Products requiring stock replenishment">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Warehouse</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-3 text-right">Min Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500 text-xs">No low stock items. All inventory levels healthy.</td>
                </tr>
              ) : (
                lowStockProducts.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="py-2.5 px-3 text-xs">{p.category?.name}</td>
                    <td className="py-2.5 px-3 text-xs">{p.warehouse?.name}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-rose-600">{p.currentStock} units</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-500">{p.minimumStock} units</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Financial Summary Table */}
      <Card title="Period Financial Invoice Log" subtitle="Filtered by selected date range">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Subtotal</th>
                <th className="py-2.5 px-3">GST Tax</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.customer?.customerName}</td>
                  <td className="py-2.5 px-3">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3">₹{inv.tax.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIAL' ? 'warning' : 'info'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
