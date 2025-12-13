// Admin Routes
// Administrative endpoints like log viewing

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /admin/logs - Get application logs
router.get('/logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logPath = path.join(__dirname, '../../logs/app.log');

    // Check if log file exists
    if (!fs.existsSync(logPath)) {
      res.json(successResponse({ logs: [] }));
      return;
    }

    // Read log file
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const logLines = logContent.trim().split('\n');

    // Get last 100 lines
    const recentLogs = logLines.slice(-100);

    // Parse JSON logs
    const parsedLogs = recentLogs
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line };
        }
      })
      .reverse(); // Most recent first

    res.json(successResponse({ logs: parsedLogs }));
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to retrieve logs'
      )
    );
  }
});

// GET /admin/stats - Get system statistics
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    res.json(successResponse(stats));
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to retrieve stats'
      )
    );
  }
});

export default router;
