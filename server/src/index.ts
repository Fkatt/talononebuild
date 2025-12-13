// TalonForge Backend Server
// Entry point for the Express application

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './config';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '3.0',
    },
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'TalonForge API Server',
      version: '3.0',
      docs: '/api/docs',
    },
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import instanceRoutes from './routes/instance.routes';
import migrationRoutes from './routes/migration.routes';
import backupRoutes from './routes/backup.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';

// Register routes
app.use('/auth', authRoutes);
app.use('/instances', instanceRoutes);
app.use('/migrate', migrationRoutes);
app.use('/backups', backupRoutes);
app.use('/ai', aiRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware (will be enhanced in Phase 2)
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 TalonForge API Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
