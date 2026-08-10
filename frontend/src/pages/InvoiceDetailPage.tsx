import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Invoice, InvoiceStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Printer, Building2, CreditCard, CheckCircle2 } from 'lucide-react';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | any>(null);
  const [loading, setLoading] = useState(true);

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<InvoiceStatus>('PAID');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchInvoiceDetail = async () => {
    try {
      const res: any = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
      setNewStatus(res.data.status);
    } catch (err: any) {
      showToast(err.message || 'Failed to load invoice details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvoiceDetail();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStatus(true);
    try {
      await api.put(`/invoices/${id}/status`, { status: newStatus });
      showToast(`Invoice payment status updated to ${newStatus}`, 'success');
      setIsStatusModalOpen(false);
      fetchInvoiceDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !invoice) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Action Controls (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Tax Invoice (A4)
          </button>

          {hasRole('ADMIN', 'ACCOUNTS') && invoice.status !== 'CANCELLED' && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Update Payment Status
            </button>
          )}
        </div>
      </div>

      {/* Printable A4 Tax Invoice Document Wrapper */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-sky-700 font-extrabold text-xl uppercase tracking-wider">
              <Building2 className="w-6 h-6" />
              WHOLESALE OPERATIONS DISTRIBUTORS LTD
            </div>
            <p className="text-xs text-slate-500 mt-1">Plot 45, MIDC Logistics Hub, Mumbai, MH 400604</p>
            <p className="text-xs text-slate-500">GSTIN: 27AAACW9988Z1Z5 • Email: billing@operations.com</p>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">TAX INVOICE</h2>
            <span className="font-mono text-lg font-bold text-sky-700 block">{invoice.invoiceNumber}</span>
            <div className="mt-2">
              <Badge
                variant={
                  invoice.status === 'PAID'
                    ? 'success'
                    : invoice.status === 'PARTIAL'
                    ? 'warning'
                    : invoice.status === 'GENERATED'
                    ? 'info'
                    : 'error'
                }
              >
                PAYMENT: {invoice.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer & Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Billed To (Customer)</span>
            <h3 className="font-bold text-slate-900">{invoice.customer?.customerName}</h3>
            <p className="text-xs text-slate-600">{invoice.customer?.businessName}</p>
            <p className="text-xs text-slate-600 mt-1">{invoice.customer?.address || 'Address N/A'}</p>
            <p className="text-xs font-mono text-slate-500 mt-1">GSTIN: {invoice.customer?.gstNumber || 'N/A'}</p>
          </div>

          <div className="text-right space-y-1 text-xs text-slate-600">
            <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Billing References</span>
            <p><strong>Invoice Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><strong>Dispatch Challan Ref:</strong> {invoice.challan?.challanNumber}</p>
            <p><strong>Payment Terms:</strong> Immediate / Net 30</p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 text-xs font-bold uppercase text-slate-700">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Product Description</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3 text-right">Unit Price (₹)</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.challan?.items.map((item: any, idx: number) => (
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
          </table>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 uppercase">Bank Account Payment Details</p>
            <p>Bank: HDFC Bank Ltd • Branch: Fort, Mumbai</p>
            <p>Account No: 50200011223344 • IFSC: HDFC0000001</p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Amount:</span>
              <span className="font-semibold">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Tax (18%):</span>
              <span className="font-semibold">₹{invoice.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
              <span>Grand Total:</span>
              <span className="text-sky-700">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="pt-12 flex justify-between text-center text-xs text-slate-500">
          <div>
            <div className="h-12 border-b border-dashed border-slate-300 w-48 mx-auto mb-2"></div>
            <p className="font-semibold text-slate-700">Customer Acceptance Stamp</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-300 w-48 mx-auto mb-2"></div>
            <p className="font-semibold text-slate-700">For Wholesale Operations Ltd (Authorized)</p>
          </div>
        </div>
      </div>

      {/* Update Payment Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Invoice Payment Status"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Select Payment Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky-500"
            >
              <option value="GENERATED">GENERATED (Pending Payment)</option>
              <option value="PAID">PAID (Payment Fully Received)</option>
              <option value="PARTIAL">PARTIAL (Partial Payment Received)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStatus}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              Update Payment Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
