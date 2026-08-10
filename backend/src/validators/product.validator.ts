import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU is required'),
    categoryId: z.string().uuid('Valid Category ID required'),
    unitPrice: z.number().min(0, 'Price must be >= 0'),
    currentStock: z.number().int().min(0, 'Current stock must be >= 0').optional().default(0),
    minimumStock: z.number().int().min(0, 'Minimum stock must be >= 0').optional().default(0),
    warehouseId: z.string().uuid('Valid Warehouse ID required'),
  }),
});

export const updateProductSchema = createProductSchema.deepPartial();

export const stockInSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    reason: z.string().min(2, 'Reason for stock-in is required'),
  }),
});
