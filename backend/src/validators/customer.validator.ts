import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    mobileNumber: z.string().regex(/^[0-9+\-\s]{8,15}$/, 'Invalid mobile number format'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    businessName: z.string().optional().or(z.literal('')),
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').optional().or(z.literal('')),
    customerType: z.nativeEnum(CustomerType).optional(),
    address: z.string().optional().or(z.literal('')),
    status: z.nativeEnum(CustomerStatus).optional(),
    followUpDate: z.string().datetime().optional().or(z.literal('')).transform(val => val ? new Date(val) : undefined),
    notes: z.string().optional().or(z.literal('')),
  }),
});

export const updateCustomerSchema = createCustomerSchema.deepPartial();

export const createFollowUpSchema = z.object({
  body: z.object({
    note: z.string().min(2, 'Follow-up note is required'),
    followUpDate: z.string().datetime({ message: 'Valid ISO date required for follow-up date' }).transform(val => new Date(val)),
  }),
});
