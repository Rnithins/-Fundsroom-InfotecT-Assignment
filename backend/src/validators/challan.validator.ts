import { z } from 'zod';

export const challanItemSchema = z.object({
  productId: z.string().uuid('Valid Product ID required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Valid Customer ID required'),
    items: z.array(challanItemSchema).min(1, 'At least one product item is required'),
  }),
});

export const updateChallanSchema = createChallanSchema.deepPartial();
