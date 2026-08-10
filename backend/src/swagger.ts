import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Mini ERP + CRM Operations Portal API',
    version: '1.0.0',
    description: 'REST API documentation for wholesale operations, CRM follow-ups, stock management, sales challans, and invoices.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate user and get JWT token',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@example.com' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Authentication'],
        responses: { 200: { description: 'User profile payload' } },
      },
    },
    '/customers': {
      get: {
        summary: 'List customers with pagination and filtering',
        tags: ['CRM Customers'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['LEAD', 'ACTIVE', 'INACTIVE'] } },
        ],
        responses: { 200: { description: 'Customer list' } },
      },
      post: {
        summary: 'Create a new customer',
        tags: ['CRM Customers'],
        responses: { 201: { description: 'Customer created' } },
      },
    },
    '/products': {
      get: {
        summary: 'List inventory products',
        tags: ['Products & Inventory'],
        responses: { 200: { description: 'Products list' } },
      },
      post: {
        summary: 'Create a new product',
        tags: ['Products & Inventory'],
        responses: { 201: { description: 'Product created' } },
      },
    },
    '/products/{id}/stock-in': {
      post: {
        summary: 'Perform Stock IN operation',
        tags: ['Products & Inventory'],
        responses: { 200: { description: 'Stock updated' } },
      },
    },
    '/challans': {
      get: { summary: 'List sales challans', tags: ['Sales Challans'] },
      post: { summary: 'Create draft sales challan', tags: ['Sales Challans'] },
    },
    '/challans/{id}/confirm': {
      post: {
        summary: 'Confirm sales challan (reduces stock atomically, generates invoice)',
        tags: ['Sales Challans'],
        responses: { 200: { description: 'Challan confirmed' }, 400: { description: 'Insufficient stock error' } },
      },
    },
    '/challans/{id}/cancel': {
      post: {
        summary: 'Cancel sales challan (restores stock if confirmed)',
        tags: ['Sales Challans'],
        responses: { 200: { description: 'Challan cancelled' } },
      },
    },
    '/invoices': {
      get: { summary: 'List invoices', tags: ['Invoices'] },
    },
    '/invoices/{id}/status': {
      put: { summary: 'Update invoice payment status', tags: ['Invoices'] },
    },
    '/dashboard': {
      get: { summary: 'Executive dashboard metrics and charts payload', tags: ['Dashboard'] },
    },
  },
};

const router = Router();
router.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpec));

export default router;
