import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Mini ERP + CRM Business Logic & Stock Integration Tests', () => {
  let adminToken: string;
  let salesToken: string;
  let warehouseToken: string;
  let customerId: string;
  let categoryId: string;
  let warehouseId: string;
  let productId: string;

  beforeAll(async () => {
    // Ensure clean test setup if needed
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Tests', () => {
    it('1. Login with valid Admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');

      adminToken = res.body.data.token;
    });

    it('2. Login with invalid password returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Login as Sales User', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sales@example.com', password: 'Sales@123' });

      expect(res.status).toBe(200);
      salesToken = res.body.data.token;
    });

    it('Login as Warehouse User', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'warehouse@example.com', password: 'Warehouse@123' });

      expect(res.status).toBe(200);
      warehouseToken = res.body.data.token;
    });
  });

  describe('Customer CRM Tests', () => {
    it('3. Create Customer via Sales role', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerName: 'Test Corp B2B',
          mobileNumber: '9998887770',
          email: 'test@corp.com',
          businessName: 'Test Corporation',
          customerType: 'WHOLESALE',
          status: 'LEAD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      customerId = res.body.data.id;
    });
  });

  describe('Product & Stock Tests', () => {
    it('4. Create Product via Admin role', async () => {
      const cats = await prisma.category.findMany();
      const whs = await prisma.warehouse.findMany();
      categoryId = cats[0].id;
      warehouseId = whs[0].id;

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Industrial Bolt Kit',
          sku: `TEST-SKU-BOLT-${Date.now()}`,
          categoryId,
          unitPrice: 150.0,
          currentStock: 20,
          minimumStock: 5,
          warehouseId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentStock).toBe(20);
      productId = res.body.data.id;
    });

    it('5. Stock IN operation increases currentStock', async () => {
      const res = await request(app)
        .post(`/api/products/${productId}/stock-in`)
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({
          quantity: 10,
          reason: 'Routine warehouse shipment arrival',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.currentStock).toBe(30);
    });

    it('6. Sales role cannot create products (Role Authorization 403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'Unauthorized Product',
          sku: 'UNAUTH-SKU',
          categoryId,
          unitPrice: 100,
          warehouseId,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Sales Challan & Stock Transaction Engine Tests', () => {
    let draftChallanId: string;

    it('7. Create Draft Sales Challan', async () => {
      const res = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId,
          items: [{ productId, quantity: 5 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('DRAFT');
      draftChallanId = res.body.data.id;
    });

    it('8. Draft Challan DOES NOT reduce stock', async () => {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      expect(prod?.currentStock).toBe(30); // Unchanged from 30
    });

    it('9. Confirming Challan reduces stock atomically and generates invoice', async () => {
      const res = await request(app)
        .post(`/api/challans/${draftChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.invoice).toBeDefined();

      const prod = await prisma.product.findUnique({ where: { id: productId } });
      expect(prod?.currentStock).toBe(25); // 30 - 5 = 25
    });

    it('10. Insufficient stock prevents confirmation and rolls back atomically', async () => {
      // Create a draft challan requesting 100 units (we only have 25)
      const draftRes = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId,
          items: [{ productId, quantity: 100 }],
        });

      const overChallanId = draftRes.body.data.id;

      const confirmRes = await request(app)
        .post(`/api/challans/${overChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(400);
      expect(confirmRes.body.success).toBe(false);
      expect(confirmRes.body.error.code).toBe('INSUFFICIENT_STOCK');

      // Verify stock remained unchanged at 25
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      expect(prod?.currentStock).toBe(25);
    });

    it('11. Challan cancellation restores stock', async () => {
      const cancelRes = await request(app)
        .post(`/api/challans/${draftChallanId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('CANCELLED');

      // Stock should be restored back to 30 (25 + 5)
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      expect(prod?.currentStock).toBe(30);
    });
  });
});
