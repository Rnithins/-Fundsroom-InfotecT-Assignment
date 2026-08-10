import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Product, StockMovement } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Boxes, Warehouse as WarehouseIcon, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | any>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res: any = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err: any) {
        showToast(err.message || 'Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading || !product) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6 pb-10">
      <button
        onClick={() => navigate('/products')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Product Catalog
      </button>

      {/* Product Summary Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{product.name}</h1>
            <Badge variant={product.stockStatus === 'LOW STOCK' ? 'error' : 'success'}>
              {product.stockStatus}
            </Badge>
          </div>
          <p className="text-sm font-mono text-slate-500 mt-1">SKU: {product.sku}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Current Stock</span>
          <span className="text-3xl font-extrabold text-slate-900">{product.currentStock} units</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Specs */}
        <Card title="Product Specifications">
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Category</span>
              <span className="font-semibold">{product.category?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Assigned Warehouse</span>
              <span className="font-semibold">{product.warehouse?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Unit Price</span>
              <span className="font-bold text-slate-900">₹{product.unitPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Minimum Threshold</span>
              <span className="font-semibold text-amber-600">{product.minimumStock} units</span>
            </div>
          </div>
        </Card>

        {/* Right Col: Stock Movements Log */}
        <div className="lg:col-span-2">
          <Card title="Product Stock Movements Log" subtitle="History of IN / OUT inventory transactions">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {product.stockMovements.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No stock movements logged for this product.</p>
              ) : (
                product.stockMovements.map((sm: StockMovement) => (
                  <div key={sm.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          sm.movementType === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {sm.movementType === 'IN' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {sm.movementType === 'IN' ? '+' : '-'}{sm.quantity} units
                        </h4>
                        <p className="text-xs text-slate-500">{sm.reason}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-slate-700 font-medium block">{sm.creator?.name || 'Staff'}</span>
                      <span className="text-slate-400">{new Date(sm.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
