import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Product, Category, Warehouse } from '../types';
import { Table, Column } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Eye, Edit, ArrowUpRight, AlertTriangle, Layers } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockInProduct, setStockInProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    warehouseId: '',
  });

  const [stockInForm, setStockInForm] = useState({
    quantity: 1,
    reason: 'Routine Stock IN Addition',
  });

  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (warehouseFilter) params.warehouseId = warehouseFilter;
      if (lowStockFilter) params.lowStockOnly = true;

      const res: any = await api.get('/products', { params });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, whRes]: [any, any] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/warehouses'),
      ]);
      setCategories(catRes.data);
      setWarehouses(whRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryFilter, warehouseFilter, lowStockFilter]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || '',
      unitPrice: 100,
      currentStock: 10,
      minimumStock: 5,
      warehouseId: warehouses[0]?.id || '',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      warehouseId: p.warehouseId,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenStockInModal = (p: Product) => {
    setStockInProduct(p);
    setStockInForm({ quantity: 10, reason: 'Shipment arrival at warehouse' });
    setIsStockInModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
        showToast('Product details updated', 'success');
      } else {
        await api.post('/products', productForm);
        showToast('Product created successfully', 'success');
      }
      setIsProductModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInProduct) return;
    try {
      await api.post(`/products/${stockInProduct.id}/stock-in`, stockInForm);
      showToast(`Added ${stockInForm.quantity} units to ${stockInProduct.name}`, 'success');
      setIsStockInModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.message || 'Failed to add stock', 'error');
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Name',
      cell: (p) => (
        <div>
          <span className="font-bold text-slate-900 block">{p.name}</span>
          <span className="text-xs text-slate-500 font-mono">SKU: {p.sku}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (p) => <span className="text-xs font-semibold text-slate-700">{p.category?.name || '—'}</span>,
    },
    {
      header: 'Warehouse',
      cell: (p) => <span className="text-xs text-slate-600">{p.warehouse?.name || '—'}</span>,
    },
    {
      header: 'Unit Price',
      cell: (p) => <span className="font-bold text-slate-900">₹{p.unitPrice.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Current Stock',
      cell: (p) => (
        <div>
          <span className="font-bold text-slate-900">{p.currentStock} units</span>
          <span className="block text-[11px] text-slate-400">Min threshold: {p.minimumStock}</span>
        </div>
      ),
    },
    {
      header: 'Stock Status',
      cell: (p) => (
        <Badge variant={p.stockStatus === 'LOW STOCK' ? 'error' : 'success'}>
          {p.stockStatus}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/products/${p.id}`)}
            title="View Stock History"
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {hasRole('ADMIN', 'WAREHOUSE') && (
            <button
              onClick={() => handleOpenStockInModal(p)}
              title="Stock IN Addition"
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
          {hasRole('ADMIN') && (
            <button
              onClick={() => handleOpenEditModal(p)}
              title="Edit Product"
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
          <h1 className="text-2xl font-extrabold text-slate-900">Products & Inventory Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage SKU master list, warehouse allocations, and stock IN receipts</p>
        </div>

        {hasRole('ADMIN') && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Product
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
              placeholder="Search product by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>

          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              lowStockFilter
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock Only
          </button>
        </div>
      </Card>

      {/* Data Table */}
      <Table columns={columns} data={products} loading={loading} keyExtractor={(p) => p.id} />

      <Pagination pagination={pagination} onPageChange={fetchProducts} />

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product Catalog' : 'Add New Product to SKU Master'}
        maxWidth="lg"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                required
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit Price (INR) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={productForm.unitPrice}
                onChange={(e) => setProductForm({ ...productForm, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category *</label>
              <select
                required
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Warehouse *</label>
              <select
                required
                value={productForm.warehouseId}
                onChange={(e) => setProductForm({ ...productForm, warehouseId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Current Stock</label>
              <input
                type="number"
                min="0"
                value={productForm.currentStock}
                onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Minimum Alert Threshold</label>
              <input
                type="number"
                min="0"
                value={productForm.minimumStock}
                onChange={(e) => setProductForm({ ...productForm, minimumStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
            >
              {editingProduct ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock IN Modal */}
      <Modal
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        title={`Stock IN Operation — ${stockInProduct?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleStockInSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            Current Stock: <span className="font-bold">{stockInProduct?.currentStock} units</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity to Add (IN) *</label>
            <input
              type="number"
              min="1"
              required
              value={stockInForm.quantity}
              onChange={(e) => setStockInForm({ ...stockInForm, quantity: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Stock Receipt Reason / PO Reference *</label>
            <input
              type="text"
              required
              value={stockInForm.reason}
              onChange={(e) => setStockInForm({ ...stockInForm, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStockInModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Confirm Stock IN
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
