export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type StockMovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export type InvoiceStatus = 'GENERATED' | 'PAID' | 'PARTIAL' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followUps: number;
    challans: number;
    invoices: number;
  };
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdBy: string;
  createdAt: string;
  creator?: { id: string; name: string; email: string };
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category?: Category;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseId: string;
  warehouse?: Warehouse;
  stockStatus?: 'IN STOCK' | 'LOW STOCK';
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
  createdBy: string;
  creator?: { id: string; name: string; email: string; role: Role };
  createdAt: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  product?: Product;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  totalQuantity: number;
  totalAmount?: number;
  status: ChallanStatus;
  createdBy: string;
  creator?: { id: string; name: string; role: Role };
  items: ChallanItem[];
  invoices?: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  challanId: string;
  challan?: Challan;
  customerId: string;
  customer?: Customer;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  user?: { name: string; role: Role } | null;
  action: string;
  entity: string;
  entityId?: string | null;
  description: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: Pagination;
  error?: {
    code: string;
    details?: any;
  };
}
