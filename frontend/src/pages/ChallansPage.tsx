import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Challan, ChallanStatus } from '../types';
import { Table, Column } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { FilePlus, Search, Eye, Edit, CheckCircle, XCircle, Printer } from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchChallans = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res: any = await api.get('/challans', { params });
      setChallans(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch sales challans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans(1);
  }, [search, statusFilter]);

  const columns: Column<Challan>[] = [
    {
      header: 'Challan Number',
      cell: (ch) => (
        <div>
          <span className="font-mono font-bold text-sky-700 block text-sm">{ch.challanNumber}</span>
          <span className="text-[11px] text-slate-400">{new Date(ch.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (ch) => (
        <div>
          <span className="font-bold text-slate-900 block">{ch.customer?.customerName}</span>
          <span className="text-xs text-slate-500">{ch.customer?.businessName || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Total Items / Qty',
      cell: (ch) => (
        <span className="text-xs font-semibold text-slate-800">
          {ch.items?.length || 0} SKUs ({ch.totalQuantity} units)
        </span>
      ),
    },
    {
      header: 'Total Value',
      cell: (ch) => <span className="font-extrabold text-slate-900">₹{(ch.totalAmount || 0).toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Status',
      cell: (ch) => (
        <Badge
          variant={
            ch.status === 'CONFIRMED'
              ? 'success'
              : ch.status === 'DRAFT'
              ? 'warning'
              : 'error'
          }
        >
          {ch.status}
        </Badge>
      ),
    },
    {
      header: 'Created By',
      cell: (ch) => <span className="text-xs text-slate-600 font-medium">{ch.creator?.name || 'Staff'}</span>,
    },
    {
      header: 'Actions',
      cell: (ch) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/challans/${ch.id}`)}
            title="View & Print Challan"
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {ch.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
            <button
              onClick={() => navigate(`/challans/${ch.id}/edit`)}
              title="Edit Draft"
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sales Challans Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create delivery notes, confirm stock deductions, and print A4 challans</p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button
            onClick={() => navigate('/challans/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            Create Sales Challan
          </button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by challan number or customer..."
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
            <option value="">All Challan Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </Card>

      <Table columns={columns} data={challans} loading={loading} keyExtractor={(ch) => ch.id} />
      <Pagination pagination={pagination} onPageChange={fetchChallans} />
    </div>
  );
};
