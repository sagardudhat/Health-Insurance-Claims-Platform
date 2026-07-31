import { Request, Response } from 'express';

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ClaimCare Health Insurance Claims API',
    version: '1.0.0',
    description:
      'Production RESTful API for Health Insurance Claims Processing, Adjudication Workflows, Policy Engine, and Audit Management.',
    contact: {
      name: 'ClaimCare Engineering Team',
      email: 'support@claimcare.health',
    },
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
        description: 'Provide your JWT bearer token obtained from POST /api/auth/login',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Invalid credentials or resource not found' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
      LineItem: {
        type: 'object',
        required: ['description', 'quantity', 'unitCost'],
        properties: {
          description: { type: 'string', example: 'Diagnostic Lab Test' },
          quantity: { type: 'number', example: 1 },
          unitCost: { type: 'number', example: 250 },
          isDenied: { type: 'boolean', example: false },
        },
      },
      Claim: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a6a665daee765cca2724b2f' },
          patient: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'John Doe' },
              policyNumber: { type: 'string', example: 'POL-992014' },
              dob: { type: 'string', format: 'date', example: '1990-05-15' },
            },
          },
          procedure: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Cardiac Evaluation' },
              code: { type: 'string', example: 'CPT-99214' },
              dateOfService: { type: 'string', format: 'date', example: '2026-07-20' },
            },
          },
          items: { type: 'array', items: { $ref: '#/components/schemas/LineItem' } },
          totalClaimed: { type: 'number', example: 1250.0 },
          coveredAmount: { type: 'number', example: 1000.0 },
          patientResponsibility: { type: 'number', example: 250.0 },
          status: {
            type: 'string',
            enum: [
              'SUBMITTED',
              'UNDER_REVIEW',
              'APPROVED',
              'PARTIALLY_APPROVED',
              'REJECTED',
              'NEEDS_REVISION',
              'PAID',
            ],
            example: 'SUBMITTED',
          },
          flagged: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PolicyConfig: {
        type: 'object',
        properties: {
          year: { type: 'number', example: 2026 },
          annualLimit: { type: 'number', example: 10000 },
          deductible: { type: 'number', example: 500 },
          coverageRate: { type: 'number', example: 0.8 },
          isActive: { type: 'boolean', example: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'User registration, login, and profile operations' },
    {
      name: 'Claims (Provider)',
      description: 'Claim submission, history, and revision resubmission',
    },
    { name: 'Reviewer Workflow', description: 'Queue management and claim status adjudication' },
    {
      name: 'Administrator Operations',
      description: 'Platform analytics, fraud flags, user status management',
    },
    {
      name: 'System Configuration',
      description: 'Policy engine constants and dynamic deductible settings',
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Dr. Sarah Connor' },
                  email: { type: 'string', example: 'sarah@hospital.org' },
                  password: { type: 'string', example: 'SecurePassword123!' },
                  role: {
                    type: 'string',
                    enum: ['provider', 'reviewer', 'admin'],
                    example: 'provider',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
            },
          },
          400: {
            description: 'Validation error or email already in use',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate and obtain JWT bearer token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'provider@claimcare.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
            },
          },
          401: {
            description: 'Invalid email or password',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get authenticated user profile',
        responses: {
          200: { description: 'Profile retrieved successfully' },
          401: { description: 'Unauthorized token' },
        },
      },
    },
    '/claims': {
      post: {
        tags: ['Claims (Provider)'],
        summary: 'Submit a new insurance claim with documents',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  patientName: { type: 'string' },
                  policyNumber: { type: 'string' },
                  patientDob: { type: 'string', format: 'date' },
                  procedureName: { type: 'string' },
                  procedureCode: { type: 'string' },
                  dateOfService: { type: 'string', format: 'date' },
                  items: { type: 'string', description: 'JSON stringified array of line items' },
                  documents: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Claim submitted successfully' },
        },
      },
    },
    '/claims/my-claims': {
      get: {
        tags: ['Claims (Provider)'],
        summary: 'Get paginated list of claims submitted by current user',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Claims list fetched' } },
      },
    },
    '/claims/{id}': {
      get: {
        tags: ['Claims (Provider)'],
        summary: 'Get detailed claim view and immutable audit trail by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Claim details fetched' },
          404: { description: 'Claim not found' },
        },
      },
    },
    '/reviewer/queue': {
      get: {
        tags: ['Reviewer Workflow'],
        summary: 'Get shared reviewer queue of pending claims',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Review queue fetched' } },
      },
    },
    '/reviewer/claims/{id}/transition': {
      post: {
        tags: ['Reviewer Workflow'],
        summary: 'Adjudicate claim status (APPROVED, PARTIALLY_APPROVED, REJECTED, NEEDS_REVISION)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['toStatus'],
                properties: {
                  toStatus: {
                    type: 'string',
                    enum: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'NEEDS_REVISION', 'PAID'],
                  },
                  note: {
                    type: 'string',
                    example: 'Approved after verification of medical codes.',
                  },
                  deniedItemIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Status transitioned and audit log generated' } },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Administrator Operations'],
        summary: 'Get platform-wide statistics and financial breakdown',
        parameters: [
          {
            name: 'range',
            in: 'query',
            schema: { type: 'string', enum: ['today', 'week', 'month', 'custom'] },
          },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Dashboard analytics fetched' } },
      },
    },
    '/admin/config': {
      get: {
        tags: ['System Configuration'],
        summary: 'Get active policy configuration rules for a given year',
        parameters: [{ name: 'year', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Policy configuration fetched' } },
      },
      put: {
        tags: ['System Configuration'],
        summary: 'Update or create policy rules (Deductible, Coverage Rate, Annual Limit)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PolicyConfig' },
            },
          },
        },
        responses: { 200: { description: 'Policy configuration updated' } },
      },
    },
  },
};

/**
 * Returns HTML page with Swagger UI connected to our OpenAPI spec
 */
export function serveSwaggerUI(req: Request, res: Response) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ClaimCare REST API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-family: sans-serif; font-weight: 800; color: #0284c7; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;
  res.send(html);
}
