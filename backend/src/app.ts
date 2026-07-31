// Express Application Assembly: Middleware registration, route mounting, health check, and error handlers.
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { buildSuccess, buildError } from './utils';
import { authRoutes } from './routes/auth.routes';
import { claimRoutes } from './routes/claim.routes';
import { reviewerRoutes } from './routes/reviewer.routes';
import { adminRoutes } from './routes/admin.routes';

import { serveSwaggerUI, openApiSpec } from './config/swagger';

dotenv.config();

export const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Interactive Swagger / OpenAPI Documentation Routes
app.get('/api-docs', serveSwaggerUI);
app.get('/api-docs/json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  res.status(200).json(
    buildSuccess(
      {
        status: 'ok',
        db: dbState,
        timestamp: new Date().toISOString(),
      },
      'Health check successful'
    )
  );
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json(buildError(`Route ${req.originalUrl} not found`));
});

// Global Error Handling Middleware
app.use(
  (
    err: Error & { statusCode?: number; status?: number; errors?: unknown },
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[Error] ${statusCode} - ${message}`);
    res.status(statusCode).json(buildError(message, err.errors));
  }
);
