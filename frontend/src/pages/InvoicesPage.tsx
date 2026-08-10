import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Invoice, InvoiceStatus } from '../types';
import { Table, Column } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useToast } from '../context/ToastContext';
import { Search, Eye, Printer, Receipt } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res: any = await api.get('/invoices', { params });
      setInvoices(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [search, statusFilter]);

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice Number',
      cell: (inv) => (
        <div>
          <span className="font-mono font-bold text-sky-700 block text-sm">{inv.invoiceNumber}</span>
          <span className="text-[11px] text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: 'Challan Ref',
      cell: (inv) => <span className="font-mono text-xs text-slate-700">{inv.challan?.challanNumber || '—'}</span>,
    },
    {
      header: 'Customer Account',
      cell: (inv) => (
        <div>
          <span className="font-bold text-slate-900 block">{inv.customer?.customerName}</span>
          <span className="text-xs text-slate-500">{inv.customer?.businessName || 'Individual'}</span>
        </div>
      ),
    },
    {
      header: 'Subtotal / Tax',
      cell: (inv) => (
        <span className="text-xs text-slate-600 block">
          Sub: ₹{inv.subtotal.toLocaleString('en-IN')} + GST: ₹{inv.tax.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      cell: (inv) => <span className="font-black text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Payment Status',
      cell: (inv) => (
        <Badge
          variant={
            inv.status === 'PAID'
              ? 'success'
              : inv.status === 'PARTIAL'
              ? 'warning'
              : inv.status === 'GENERATED'
              ? 'info'
              : 'error'
          }
        >
          {inv.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (inv) => (
        <button
          onClick={() => navigate(`/invoices/${inv.id}`)}
          title="View & Print Invoice"
          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Financial Invoices & Billing</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage generated sales invoices, GST computations, and track payment receipts</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by invoice number, customer, or challan number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="GENERATED">GENERATED</option>
            <option value="PAID">PAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </Card>

      <Table columns={columns} data={invoices} loading={loading} keyExtractor={(inv) => inv.id} />
      <Pagination pagination={pagination} onPageChange={fetchInvoices} />
    </div>
  );
};
