import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Role } from '../types';
import { Table, Column } from '../components/Table';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { UserPlus, UserCog, ShieldCheck, Edit } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as Role,
    isActive: true,
  });

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'SALES',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      isActive: u.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload: any = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          isActive: userForm.isActive,
        };
        if (userForm.password) payload.password = userForm.password;

        await api.put(`/users/${editingUser.id}`, payload);
        showToast('User account updated successfully', 'success');
      } else {
        if (!userForm.password) {
          showToast('Password is required for new user creation', 'error');
          return;
        }
        await api.post('/users', userForm);
        showToast('User account created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to save user account', 'error');
    }
  };

  const roleVariant = (role: Role) => {
    if (role === 'ADMIN') return 'purple';
    if (role === 'SALES') return 'info';
    if (role === 'WAREHOUSE') return 'warning';
    return 'success';
  };

  const columns: Column<User>[] = [
    {
      header: 'Full Name',
      cell: (u) => (
        <div>
          <span className="font-bold text-slate-900 block">{u.name}</span>
          <span className="text-xs text-slate-500 font-mono">{u.email}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      cell: (u) => <Badge variant={roleVariant(u.role)}>{u.role}</Badge>,
    },
    {
      header: 'Status',
      cell: (u) => (
        <Badge variant={u.isActive ? 'success' : 'error'}>
          {u.isActive ? 'ACTIVE' : 'DISABLED'}
        </Badge>
      ),
    },
    {
      header: 'Registered Date',
      cell: (u) => <span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: 'Actions',
      cell: (u) => (
        <button
          onClick={() => handleOpenEditModal(u)}
          title="Edit User Account"
          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Account Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Admin console to manage team members, access roles, and system credentials</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      <Table columns={columns} data={users} loading={loading} keyExtractor={(u) => u.id} />

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Account' : 'Create Operational User Account'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Password {editingUser && '(Leave empty to keep unchanged)'}
            </label>
            <input
              type="password"
              minLength={6}
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Password (min 6 chars)'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role Permission *</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="ADMIN">ADMIN (Full Access)</option>
              <option value="SALES">SALES (CRM & Challan creation)</option>
              <option value="WAREHOUSE">WAREHOUSE (Stock-IN & Inventory)</option>
              <option value="ACCOUNTS">ACCOUNTS (Billing & Invoices)</option>
            </select>
          </div>

          {editingUser && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={userForm.isActive}
                onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-slate-800">
                Account Active & Enabled
              </label>
            </div>
          )}

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
              {editingUser ? 'Update Account' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
