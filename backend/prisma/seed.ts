import { PrismaClient, Role, CustomerType, CustomerStatus, StockMovementType, ChallanStatus, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const salesPassword = await bcrypt.hash('Sales@123', saltRounds);
  const warehousePassword = await bcrypt.hash('Warehouse@123', saltRounds);
  const accountsPassword = await bcrypt.hash('Accounts@123', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Sales Manager',
      email: 'sales@example.com',
      passwordHash: salesPassword,
      role: Role.SALES,
      isActive: true,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Walter Warehouse Lead',
      email: 'warehouse@example.com',
      passwordHash: warehousePassword,
      role: Role.WAREHOUSE,
      isActive: true,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Alice Accounts Officer',
      email: 'accounts@example.com',
      passwordHash: accountsPassword,
      role: Role.ACCOUNTS,
      isActive: true,
    },
  });

  console.log('✅ Created Seed Users');

  // Categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics & Hardware' } });
  const industrial = await prisma.category.create({ data: { name: 'Industrial Tools' } });
  const packaging = await prisma.category.create({ data: { name: 'Packaging Materials' } });

  // Warehouses
  const mainWh = await prisma.warehouse.create({
    data: { name: 'Central Warehouse - Mumbai', location: 'Bhiwandi, Maharashtra' },
  });
  const northWh = await prisma.warehouse.create({
    data: { name: 'North Regional Hub - Delhi', location: 'Okhla Phase III, New Delhi' },
  });

  console.log('✅ Created Seed Categories & Warehouses');

  // Products (15 realistic products)
  const productsData = [
    { name: 'Industrial Steel Fasteners Set (M8)', sku: 'SKU-FAS-M8-100', categoryId: industrial.id, unitPrice: 450.0, currentStock: 150, minimumStock: 30, warehouseId: mainWh.id },
    { name: 'Heavy Duty Power Drill 800W', sku: 'SKU-DRL-HD-800', categoryId: industrial.id, unitPrice: 3200.0, currentStock: 45, minimumStock: 10, warehouseId: mainWh.id },
    { name: 'Digital Vernier Caliper 150mm', sku: 'SKU-CAL-DIG-150', categoryId: industrial.id, unitPrice: 1250.0, currentStock: 25, minimumStock: 5, warehouseId: mainWh.id },
    { name: 'Polyethylene Stretch Film Roll 500mm', sku: 'SKU-PKG-STR-500', categoryId: packaging.id, unitPrice: 380.0, currentStock: 200, minimumStock: 50, warehouseId: mainWh.id },
    { name: 'Corrugated 5-Ply Master Box (Pack of 50)', sku: 'SKU-PKG-BOX-5PLY', categoryId: packaging.id, unitPrice: 1100.0, currentStock: 80, minimumStock: 20, warehouseId: northWh.id },
    { name: 'Heavy Duty Thermal Barcode Printer', sku: 'SKU-ELE-PRN-BAR', categoryId: electronics.id, unitPrice: 14500.0, currentStock: 12, minimumStock: 3, warehouseId: mainWh.id },
    { name: 'Handheld 2D Wireless Barcode Scanner', sku: 'SKU-ELE-SCN-2DW', categoryId: electronics.id, unitPrice: 2800.0, currentStock: 4, minimumStock: 10, warehouseId: mainWh.id }, // LOW STOCK
    { name: 'Industrial Weighing Scale 300kg', sku: 'SKU-ELE-SCL-300', categoryId: electronics.id, unitPrice: 6500.0, currentStock: 8, minimumStock: 2, warehouseId: northWh.id },
    { name: 'Hydraulic Hand Pallet Truck 2.5 Ton', sku: 'SKU-IND-PLT-25T', categoryId: industrial.id, unitPrice: 18500.0, currentStock: 3, minimumStock: 5, warehouseId: mainWh.id }, // LOW STOCK
    { name: 'Bubble Wrap Protective Roll 100m', sku: 'SKU-PKG-BBL-100', categoryId: packaging.id, unitPrice: 620.0, currentStock: 120, minimumStock: 30, warehouseId: northWh.id },
    { name: 'Safety Work Boots Steel Toe Size 9', sku: 'SKU-IND-BOT-SZ9', categoryId: industrial.id, unitPrice: 1400.0, currentStock: 60, minimumStock: 15, warehouseId: mainWh.id },
    { name: 'High Visibility Reflective Safety Jacket', sku: 'SKU-IND-JKT-HIV', categoryId: industrial.id, unitPrice: 350.0, currentStock: 180, minimumStock: 40, warehouseId: northWh.id },
    { name: 'Pneumatic Impact Wrench Kit 1/2"', sku: 'SKU-IND-WNC-P12', categoryId: industrial.id, unitPrice: 4800.0, currentStock: 15, minimumStock: 5, warehouseId: mainWh.id },
    { name: 'Uninterrupted Power Supply 2kVA UPS', sku: 'SKU-ELE-UPS-2KV', categoryId: electronics.id, unitPrice: 11200.0, currentStock: 6, minimumStock: 2, warehouseId: northWh.id },
    { name: 'Heavy Duty Strapping Machine Semi-Auto', sku: 'SKU-PKG-STR-MCH', categoryId: packaging.id, unitPrice: 24000.0, currentStock: 2, minimumStock: 3, warehouseId: mainWh.id }, // LOW STOCK
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  console.log(`✅ Created ${createdProducts.length} Seed Products`);

  // Customers (10 realistic B2B/Retail customers)
  const customersData = [
    {
      customerName: 'Apex Machinery & Tools Pvt Ltd',
      mobileNumber: '9820011223',
      email: 'procurement@apexmachinery.com',
      businessName: 'Apex Machinery & Tools Pvt Ltd',
      gstNumber: '27AAACA12341Z1',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, MIDC Industrial Area, Thane West, MH 400604',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-15'),
      notes: 'Key distributor for West Zone. Quarterly bulk order expected.',
    },
    {
      customerName: 'Metro Hardware Enterprises',
      mobileNumber: '9811099887',
      email: 'contact@metrohardware.in',
      businessName: 'Metro Hardware Enterprises',
      gstNumber: '07BBBPM56782Z2',
      customerType: CustomerType.WHOLESALE,
      address: 'Shop 12, Chawri Bazar, Delhi 110006',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-12'),
      notes: 'Requests 30-day payment terms for fast-moving tools.',
    },
    {
      customerName: 'Nexus Packaging Logistics',
      mobileNumber: '9744033221',
      email: 'orders@nexuspack.com',
      businessName: 'Nexus Logistics Solutions',
      gstNumber: '29CCCCL90123Z3',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Peenya Industrial Area 2nd Stage, Bengaluru, KA 560058',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-18'),
      notes: 'Regular buyer of stretch film rolls and corrugated master boxes.',
    },
    {
      customerName: 'Rajesh Traders',
      mobileNumber: '9845012345',
      email: 'rajesh.traders@gmail.com',
      businessName: 'Rajesh Hardware Store',
      gstNumber: '33DDDPR43214Z4',
      customerType: CustomerType.RETAIL,
      address: '108 Broadway Main Road, Chennai, TN 600108',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-20'),
      notes: 'Prefers WhatsApp updates on new stock arrival.',
    },
    {
      customerName: 'Vanguard Industrial Suppliers',
      mobileNumber: '9988776655',
      email: 'sales@vanguardind.com',
      businessName: 'Vanguard Industrial Corporation',
      gstNumber: '24EEEPV67895Z5',
      customerType: CustomerType.WHOLESALE,
      address: 'GIDC Estate, Makarpura, Vadodara, GJ 390010',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-11'),
      notes: 'New lead interested in pallet trucks and safety boots.',
    },
    {
      customerName: 'Precision Engineering Works',
      mobileNumber: '9123456789',
      email: 'info@precisionengg.co.in',
      businessName: 'Precision Engineering Works',
      gstNumber: '27FFFPE34566Z6',
      customerType: CustomerType.WHOLESALE,
      address: 'Bhosari Industrial Estate, Pune, MH 411026',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-25'),
      notes: 'Inquired about digital vernier calipers and pneumatic impact wrenches.',
    },
    {
      customerName: 'Sunlight Retails & Store',
      mobileNumber: '9876543210',
      email: 'sunlightretail@yahoo.com',
      businessName: 'Sunlight Retail Chain',
      gstNumber: null,
      customerType: CustomerType.RETAIL,
      address: 'MG Road, Commercial Street, Pune, MH 411001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-14'),
      notes: 'Lead requested catalog and price list for protective boots.',
    },
    {
      customerName: 'Global Automation & Warehousing',
      mobileNumber: '9000100020',
      email: 'purchase@globalauto.com',
      businessName: 'Global Automation Systems Ltd',
      gstNumber: '36GGGGA11227Z7',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'HITEC City Phase 2, Hyderabad, TS 500081',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-16'),
      notes: 'Large corporate client. High credit rating.',
    },
    {
      customerName: 'Sunrise Packaging Depot',
      mobileNumber: '9898011223',
      email: 'sunrisepack@outlook.com',
      businessName: 'Sunrise Depot',
      gstNumber: null,
      customerType: CustomerType.RETAIL,
      address: 'Station Road, Jaipur, RJ 302006',
      status: CustomerStatus.INACTIVE,
      followUpDate: null,
      notes: 'Account inactive since early 2025. Follow up needed for revival.',
    },
    {
      customerName: 'Kolkata Industrial Mart',
      mobileNumber: '9830055443',
      email: 'kolkatamart@gmail.com',
      businessName: 'Kolkata Mart B2B',
      gstNumber: '19HHHHK99888Z9',
      customerType: CustomerType.WHOLESALE,
      address: 'Strand Road, Burrabazar, Kolkata, WB 700007',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-13'),
      notes: 'Promising lead from Kolkata trade expo.',
    },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  console.log(`✅ Created ${createdCustomers.length} Seed Customers`);

  // FollowUps for customers
  await prisma.followUp.create({
    data: {
      customerId: createdCustomers[0].id,
      note: 'Discussed annual maintenance contract and bulk discount rates for M8 fasteners.',
      followUpDate: new Date('2026-08-01'),
      createdBy: salesUser.id,
    },
  });

  await prisma.followUp.create({
    data: {
      customerId: createdCustomers[0].id,
      note: 'Client confirmed order for 20 units of power drills and 100 boxes.',
      followUpDate: new Date('2026-08-05'),
      createdBy: salesUser.id,
    },
  });

  await prisma.followUp.create({
    data: {
      customerId: createdCustomers[4].id,
      note: 'Initial phone call. Sent product brochure and price list for pallet trucks.',
      followUpDate: new Date('2026-08-08'),
      createdBy: salesUser.id,
    },
  });

  console.log('✅ Created Seed FollowUps');

  // Stock Movements (Initial stock additions)
  for (const prod of createdProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.currentStock,
        movementType: StockMovementType.IN,
        reason: 'Initial inventory load upon system setup',
        createdBy: warehouseUser.id,
      },
    });
  }

  console.log('✅ Created Seed Stock Movements');

  // Seed Challan 1: CONFIRMED (with Invoice)
  const custApex = createdCustomers[0];
  const prodFas = createdProducts[0];
  const prodDrl = createdProducts[1];

  const item1Qty = 10;
  const item1Price = Number(prodFas.unitPrice);
  const item1Total = item1Qty * item1Price;

  const item2Qty = 2;
  const item2Price = Number(prodDrl.unitPrice);
  const item2Total = item2Qty * item2Price;

  const confirmedChallan = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-000001',
      customerId: custApex.id,
      totalQuantity: item1Qty + item2Qty,
      status: ChallanStatus.CONFIRMED,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: prodFas.id,
            productNameSnapshot: prodFas.name,
            skuSnapshot: prodFas.sku,
            unitPriceSnapshot: prodFas.unitPrice,
            quantity: item1Qty,
            totalPrice: item1Total,
          },
          {
            productId: prodDrl.id,
            productNameSnapshot: prodDrl.name,
            skuSnapshot: prodDrl.sku,
            unitPriceSnapshot: prodDrl.unitPrice,
            quantity: item2Qty,
            totalPrice: item2Total,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Out stock movements for Confirmed Challan
  await prisma.stockMovement.create({
    data: {
      productId: prodFas.id,
      quantity: item1Qty,
      movementType: StockMovementType.OUT,
      reason: `Challan Confirmation ${confirmedChallan.challanNumber}`,
      createdBy: salesUser.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: prodDrl.id,
      quantity: item2Qty,
      movementType: StockMovementType.OUT,
      reason: `Challan Confirmation ${confirmedChallan.challanNumber}`,
      createdBy: salesUser.id,
    },
  });

  // Generate Invoice for Confirmed Challan
  const subtotal = item1Total + item2Total;
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + tax;

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-000001',
      challanId: confirmedChallan.id,
      customerId: custApex.id,
      subtotal: subtotal,
      tax: tax,
      totalAmount: totalAmount,
      status: InvoiceStatus.PAID,
    },
  });

  // Seed Challan 2: DRAFT
  const custMetro = createdCustomers[1];
  const prodBox = createdProducts[4];

  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-000002',
      customerId: custMetro.id,
      totalQuantity: 5,
      status: ChallanStatus.DRAFT,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: prodBox.id,
            productNameSnapshot: prodBox.name,
            skuSnapshot: prodBox.sku,
            unitPriceSnapshot: prodBox.unitPrice,
            quantity: 5,
            totalPrice: 5 * Number(prodBox.unitPrice),
          },
        ],
      },
    },
  });

  console.log('✅ Created Seed Challans & Invoices');

  // Activity Logs
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'SYSTEM',
      description: 'System seeded with default users, products, and operational records.',
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: salesUser.id,
      action: 'CHALLAN_CONFIRMED',
      entity: 'CHALLAN',
      entityId: confirmedChallan.id,
      description: `Confirmed sales challan CH-2026-000001 for customer ${custApex.customerName}`,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: accountsUser.id,
      action: 'INVOICE_UPDATED',
      entity: 'INVOICE',
      description: 'Marked invoice INV-2026-000001 status as PAID.',
    },
  });

  console.log('✅ Created Seed Activity Logs');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
