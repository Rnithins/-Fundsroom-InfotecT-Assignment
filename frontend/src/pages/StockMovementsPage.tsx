import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StockMovement, StockMovementType } from '../types';
import { Table, Column } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useToast } from '../context/ToastContext';
import { Boxes, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

export const StockMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { showToast } = useToast();

  const fetchMovements = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (typeFilter) params.movementType = typeFilter;

      const res: any = await api.get('/inventory/stock-movements', { params });
      setMovements(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch stock movements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements(1);
  }, [typeFilter]);

  const columns: Column<StockMovement>[] = [
    {
      header: 'Product',
      cell: (m) => (
        <div>
          <span className="font-bold text-slate-900 block">{m.product?.name || '—'}</span>
          <span className="text-xs text-slate-500 font-mono">SKU: {m.product?.sku}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (m) => (
        <Badge variant={m.movementType === 'IN' ? 'success' : 'error'}>
          {m.movementType === 'IN' ? 'STOCK IN (+)' : 'STOCK OUT (-)'}
        </Badge>
      ),
    },
    {
      header: 'Quantity',
      cell: (m) => <span className="font-extrabold text-slate-900 text-sm">{m.quantity} units</span>,
    },
    {
      header: 'Reason / Reference',
      cell: (m) => <span className="text-xs text-slate-700">{m.reason}</span>,
    },
    {
      header: 'Executed By',
      cell: (m) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{m.creator?.name || 'System'}</span>
          <span className="text-[10px] text-slate-400">{m.creator?.role}</span>
        </div>
      ),
    },
    {
      header: 'Timestamp',
      cell: (m) => <span className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Warehouse Inventory & Stock Movements</h1>
        <p className="text-sm text-slate-500 mt-0.5">Audit log of all physical stock additions (IN) and outbound challan dispatch (OUT)</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 uppercase">Movement Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Movements (IN & OUT)</option>
            <option value="IN">STOCK IN Only</option>
            <option value="OUT">STOCK OUT Only</option>
          </select>
        </div>
      </Card>

      <Table columns={columns} data={movements} loading={loading} keyExtractor={(m) => m.id} />
      <Pagination pagination={pagination} onPageChange={fetchMovements} />
    </div>
  );
};
