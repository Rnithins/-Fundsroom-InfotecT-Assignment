import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Customer, CustomerStatus, CustomerType } from '../types';
import { Table, Column } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, Filter, Eye, Edit, Calendar } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    notes: '',
  });

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res: any = await api.get('/customers', { params });
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter, typeFilter]);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      customerName: c.customerName,
      mobileNumber: c.mobileNumber,
      email: c.email || '',
      businessName: c.businessName || '',
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address || '',
      status: c.status,
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        showToast('Customer details updated successfully', 'success');
      } else {
        await api.post('/customers', formData);
        showToast('Customer created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      showToast(err.message || 'Failed to save customer', 'error');
    }
  };

  const statusVariant = (status: CustomerStatus) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'LEAD') return 'info';
    return 'neutral';
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer Name',
      cell: (c) => (
        <div>
          <span className="font-bold text-slate-900 block">{c.customerName}</span>
          <span className="text-xs text-slate-500 font-mono">{c.email || 'No email'}</span>
        </div>
      ),
    },
    {
      header: 'Business Name',
      cell: (c) => (
        <div>
          <span className="font-medium text-slate-800">{c.businessName || '—'}</span>
          {c.gstNumber && <span className="block text-[11px] text-slate-400 font-mono">GST: {c.gstNumber}</span>}
        </div>
      ),
    },
    { header: 'Mobile', accessorKey: 'mobileNumber' },
    {
      header: 'Type',
      cell: (c) => <Badge variant="purple">{c.customerType}</Badge>,
    },
    {
      header: 'Status',
      cell: (c) => <Badge variant={statusVariant(c.status)}>{c.status}</Badge>,
    },
    {
      header: 'Next Follow-Up',
      cell: (c) => (
        c.followUpDate ? (
          <span className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            {new Date(c.followUpDate).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-xs text-slate-400">None</span>
        )
      ),
    },
    {
      header: 'Actions',
      cell: (c) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/customers/${c.id}`)}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {hasRole('ADMIN', 'SALES') && (
            <button
              onClick={() => handleOpenEditModal(c)}
              title="Edit Customer"
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
          <h1 className="text-2xl font-extrabold text-slate-900">Customer CRM Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage clients, wholesale accounts, leads, and follow-up timelines</p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, GST, business..."
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
            <option value="">All Statuses</option>
            <option value="LEAD">LEAD</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Customer Types</option>
            <option value="RETAIL">RETAIL</option>
            <option value="WHOLESALE">WHOLESALE</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
          </select>
        </div>
      </Card>

      {/* Data Table */}
      <Table columns={columns} data={customers} loading={loading} keyExtractor={(c) => c.id} />

      <Pagination pagination={pagination} onPageChange={fetchCustomers} />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Information' : 'Register New Customer'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">GST Number</label>
              <input
                type="text"
                placeholder="27AAACA12341Z1"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Customer Type</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              >
                <option value="RETAIL">RETAIL</option>
                <option value="WHOLESALE">WHOLESALE</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              >
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Billing Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
            >
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
