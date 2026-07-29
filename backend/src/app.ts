// Express Application Assembly: Middleware registration, route mounting, health check, and error handlers.
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { buildSuccess, buildError } from './utils';
import { AppError } from './errors';

dotenv.config();

export const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
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

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json(buildError(`Route ${req.originalUrl} not found`));
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[Error] ${statusCode} - ${message}`);
  res.status(statusCode).json(buildError(message, err.errors));
});
