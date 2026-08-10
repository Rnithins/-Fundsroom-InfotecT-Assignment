import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Customer, FollowUp } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  MessageSquarePlus,
  Receipt,
  UserCheck,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | any>(null);
  const [loading, setLoading] = useState(true);

  // FollowUp Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchCustomerDetails = async () => {
    try {
      const res: any = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerDetails();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/customers/${id}/followups`, {
        note: followUpNote,
        followUpDate: new Date(followUpDate).toISOString(),
      });
      showToast('Follow-up recorded successfully', 'success');
      setIsFollowUpModalOpen(false);
      setFollowUpNote('');
      fetchCustomerDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to record follow-up', 'error');
    }
  };

  if (loading || !customer) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers List
      </button>

      {/* Customer Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{customer.customerName}</h1>
            <Badge variant={customer.status === 'ACTIVE' ? 'success' : customer.status === 'LEAD' ? 'info' : 'neutral'}>
              {customer.status}
            </Badge>
            <Badge variant="purple">{customer.customerType}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">{customer.businessName || 'Individual Retail Account'}</p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Add Follow-Up Note
          </button>
        )}
      </div>

      {/* Grid Layout: Contact & Business Details + FollowUp Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Contact Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card title="Customer Contact Profile">
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Business Name</span>
                  <span className="font-semibold">{customer.businessName || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Mobile Phone</span>
                  <span className="font-semibold">{customer.mobileNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Email Address</span>
                  <span className="font-semibold">{customer.email || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">GST Identification Number</span>
                  <span className="font-mono font-semibold">{customer.gstNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Full Address</span>
                  <span className="leading-snug">{customer.address || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Next Scheduled Follow-Up</span>
                  <span className="font-semibold text-sky-700">
                    {customer.followUpDate ? new Date(customer.followUpDate).toLocaleString() : 'None scheduled'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {customer.notes && (
            <Card title="Account Notes">
              <p className="text-sm text-slate-600 leading-relaxed italic">"{customer.notes}"</p>
            </Card>
          )}
        </div>

        {/* Right Col: CRM Follow-up Timeline & Related Challans/Invoices */}
        <div className="space-y-6 lg:col-span-2">
          {/* CRM Timeline */}
          <Card title="CRM Follow-Up History & Notes">
            <div className="space-y-4">
              {customer.followUps.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No follow-up interactions logged yet.</p>
              ) : (
                customer.followUps.map((f: FollowUp) => (
                  <div key={f.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-sky-600" />
                        {f.creator?.name || 'Sales Agent'}
                      </span>
                      <span>{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{f.note}</p>
                    <div className="text-[11px] text-sky-700 font-medium">
                      Next Follow-Up Target: {new Date(f.followUpDate).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Related Challans */}
          <Card title="Recent Sales Challans">
            <div className="space-y-2">
              {customer.challans.length === 0 ? (
                <p className="text-sm text-slate-500 py-2 text-center">No sales challans recorded for this customer.</p>
              ) : (
                customer.challans.map((ch: any) => (
                  <div
                    key={ch.id}
                    onClick={() => navigate(`/challans/${ch.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-sm text-sky-700">{ch.challanNumber}</span>
                      <span className="text-xs text-slate-500 block">Items: {ch.items.length} • Qty: {ch.totalQuantity}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant={ch.status === 'CONFIRMED' ? 'success' : ch.status === 'DRAFT' ? 'warning' : 'error'}>
                        {ch.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400 block mt-1">{new Date(ch.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* FollowUp Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Add CRM Follow-Up Log"
        maxWidth="md"
      >
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Follow-Up Note / Conversation Summary *</label>
            <textarea
              required
              rows={4}
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              placeholder="e.g. Spoke with client regarding bulk pricing, requested 100 units next week..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Next Follow-Up Target Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
            >
              Save Follow-Up
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
