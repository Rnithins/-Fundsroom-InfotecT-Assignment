import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Customer, Product } from '../types';
import { Card } from '../components/Card';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Plus, Trash2, Save, ShoppingBag } from 'lucide-react';

interface SelectedLineItem {
  productId: string;
  quantity: number;
}

export const ChallanFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If editing existing draft
  const isEditing = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedLineItem[]>([
    { productId: '', quantity: 1 },
  ]);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initData = async () => {
      try {
        const [custRes, prodRes]: [any, any] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
        ]);

        setCustomers(custRes.data);
        setProducts(prodRes.data);

        if (custRes.data.length > 0 && !isEditing) {
          setSelectedCustomerId(custRes.data[0].id);
        }

        if (prodRes.data.length > 0 && !isEditing) {
          setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
        }

        if (isEditing && id) {
          const challanRes: any = await api.get(`/challans/${id}`);
          const ch = challanRes.data;
          if (ch.status !== 'DRAFT') {
            showToast('Only DRAFT challans can be edited', 'error');
            navigate('/challans');
            return;
          }
          setSelectedCustomerId(ch.customerId);
          setItems(
            ch.items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
            }))
          );
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to initialize form data', 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEditing]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([...items, { productId: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('Challan must contain at least 1 product item', 'info');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SelectedLineItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Totals calculations
  let calculatedSubtotal = 0;
  let totalQuantitySum = 0;

  items.forEach((item) => {
    const p = productMap.get(item.productId);
    if (p) {
      calculatedSubtotal += p.unitPrice * item.quantity;
      totalQuantitySum += item.quantity;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }

    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      showToast('Please specify valid products and quantities', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items,
      };

      if (isEditing && id) {
        await api.put(`/challans/${id}`, payload);
        showToast('Draft challan updated successfully', 'success');
      } else {
        await api.post('/challans', payload);
        showToast('Sales challan saved as DRAFT', 'success');
      }
      navigate('/challans');
    } catch (err: any) {
      showToast(err.message || 'Failed to save sales challan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/challans')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Challans List
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isEditing ? 'Edit Draft Sales Challan' : 'Create New Sales Challan'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Select customer and products. Saving creates a DRAFT challan (stock remains unreserved until confirmed).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selector Card */}
        <Card title="1. Select Customer Account">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Customer / Client *</label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerName} ({c.businessName || 'Individual'}) — {c.mobileNumber}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Dynamic Line Items Card */}
        <Card title="2. Add Product Items">
          <div className="space-y-3">
            {items.map((item, idx) => {
              const currentProduct = productMap.get(item.productId);
              const lineTotal = currentProduct ? currentProduct.unitPrice * item.quantity : 0;
              const hasEnoughStock = currentProduct ? currentProduct.currentStock >= item.quantity : true;

              return (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Product SKU</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku}) — ₹{p.unitPrice}/unit [In Stock: {p.currentStock}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="w-full md:w-36 text-right">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Line Total</label>
                    <span className="text-sm font-extrabold text-slate-900 block py-1.5">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Product Line
          </button>
        </Card>

        {/* Challan Summary Card */}
        <Card className="bg-slate-900 text-white border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Challan Summary</p>
              <h3 className="text-xl font-bold mt-0.5">{totalQuantitySum} Total Items Selected</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Estimated Subtotal</span>
              <span className="text-2xl font-black text-sky-400">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/challans')}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {submitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save className="w-4 h-4" />}
            Save Challan Draft
          </button>
        </div>
      </form>
    </div>
  );
};
