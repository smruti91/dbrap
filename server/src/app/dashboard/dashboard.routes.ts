import express from 'express'
import type { Router } from 'express'
import DashboardController from './dashboard.controller.js'
import { asyncHandler } from '../utils/asyncHandler .js';
import { authPlugins } from 'mysql2';
import { authenticate } from '../middleware/auth.middleware.js';

export const router: Router = express.Router()

const dashboardController = new DashboardController();

router.get('/schemes', authenticate(), asyncHandler(dashboardController.getSchemes));