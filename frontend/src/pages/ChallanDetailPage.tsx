import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Challan } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Printer, CheckCircle2, XCircle, Building2, Calendar, FileText } from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm / Cancel Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchChallanDetail = async () => {
    try {
      const res: any = await api.get(`/challans/${id}`);
      setChallan(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load challan detail', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchChallanDetail();
  }, [id]);

  const handleConfirmChallan = async () => {
    setActionLoading(true);
    try {
      const res: any = await api.post(`/challans/${id}/confirm`);
      showToast(`Sales challan ${challan.challanNumber} confirmed! Stock deducted and Invoice generated.`, 'success');
      setIsConfirmModalOpen(false);
      fetchChallanDetail();
    } catch (err: any) {
      // If stock error, format friendly message matching UX requirement #37
      if (err.error?.code === 'INSUFFICIENT_STOCK' && err.error?.details) {
        const d = err.error.details;
        showToast(`Unable to confirm challan. Product '${d.productName}' has only ${d.available} units available, but ${d.requested} units were requested.`, 'error');
      } else {
        showToast(err.message || 'Challan confirmation failed', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    setActionLoading(true);
    try {
      await api.post(`/challans/${id}/cancel`);
      showToast(`Sales challan ${challan.challanNumber} cancelled.`, 'info');
      setIsCancelModalOpen(false);
      fetchChallanDetail();
    } catch (err: any) {
      showToast(err.message || 'Challan cancellation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !challan) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Action Controls (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/challans')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales Challans
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Challan (A4)
          </button>

          {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Challan & Deduct Stock
            </button>
          )}

          {challan.status !== 'CANCELLED' && hasRole('ADMIN') && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Challan
            </button>
          )}
        </div>
      </div>

      {/* Printable A4 Document Wrapper */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-sky-700 font-extrabold text-xl uppercase tracking-wider">
              <Building2 className="w-6 h-6" />
              WHOLESALE OPERATIONS DISTRIBUTORS LTD
            </div>
            <p className="text-xs text-slate-500 mt-1">Plot 45, MIDC Logistics Hub, Mumbai, MH 400604</p>
            <p className="text-xs text-slate-500">GSTIN: 27AAACW9988Z1Z5 • Email: dispatch@operations.com</p>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">SALES CHALLAN</h2>
            <span className="font-mono text-lg font-bold text-sky-700 block">{challan.challanNumber}</span>
            <div className="mt-2">
              <Badge variant={challan.status === 'CONFIRMED' ? 'success' : challan.status === 'DRAFT' ? 'warning' : 'error'}>
                STATUS: {challan.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Customer / Consignee Details</span>
            <h3 className="font-bold text-slate-900">{challan.customer?.customerName}</h3>
            <p className="text-xs text-slate-600">{challan.customer?.businessName}</p>
            <p className="text-xs text-slate-600 mt-1">{challan.customer?.address || 'No address specified'}</p>
            <p className="text-xs font-mono text-slate-500 mt-1">Phone: {challan.customer?.mobileNumber} | GST: {challan.customer?.gstNumber || 'N/A'}</p>
          </div>

          <div className="text-right space-y-1 text-xs text-slate-600">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Challan Metadata</span>
            <p><strong>Dispatch Date:</strong> {new Date(challan.createdAt).toLocaleDateString()}</p>
            <p><strong>Issued By:</strong> {challan.creator?.name} ({challan.creator?.role})</p>
            {challan.invoices && challan.invoices.length > 0 && (
              <p className="text-emerald-700 font-bold">
                Linked Invoice: {challan.invoices[0].invoiceNumber} ({challan.invoices[0].status})
              </p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 text-xs font-bold uppercase text-slate-700">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Product Description</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3 text-right">Unit Price (₹)</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {challan.items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="py-3 px-3 font-semibold text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{item.productNameSnapshot}</td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-500">{item.skuSnapshot}</td>
                  <td className="py-3 px-3 text-right font-medium">₹{Number(item.unitPriceSnapshot).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-extrabold text-slate-900">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">₹{Number(item.totalPrice).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 text-sm font-bold bg-slate-50">
                <td colSpan={4} className="py-3 px-3 text-right uppercase">Total Dispatch Volume & Value:</td>
                <td className="py-3 px-3 text-right font-black text-sky-700">{challan.totalQuantity} Units</td>
                <td className="py-3 px-3 text-right font-black text-sky-700">₹{challan.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature Footer */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
          <div>
            <div className="h-12 border-b border-dashed border-slate-300 w-3/4 mx-auto mb-2"></div>
            <p className="font-semibold text-slate-700">Receiver's Seal & Signature</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-300 w-3/4 mx-auto mb-2"></div>
            <p className="font-semibold text-slate-700">Authorized Dispatch Representative</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmChallan}
        title="Confirm Sales Challan & Deduct Stock?"
        message={`Are you sure you want to confirm sales challan ${challan.challanNumber}? This will deduct product stock from inventory and automatically generate a corresponding sales invoice.`}
        confirmText="Confirm & Deduct Stock"
        type="warning"
        loading={actionLoading}
      />

      {/* Cancellation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelChallan}
        title="Cancel Sales Challan?"
        message={`Are you sure you want to cancel sales challan ${challan.challanNumber}? If this challan was previously CONFIRMED, inventory stock will be restored.`}
        confirmText="Cancel Challan"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};
