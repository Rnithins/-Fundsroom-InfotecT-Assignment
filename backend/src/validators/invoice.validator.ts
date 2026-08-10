import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(InvoiceStatus, { errorMap: () => ({ message: 'Invalid invoice status' }) }),
  }),
});
