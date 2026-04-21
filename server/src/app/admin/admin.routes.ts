import express from 'express'
import type { Router } from 'express'

import { asyncHandler } from '../utils/asyncHandler .js';
import { authPlugins } from 'mysql2';
import { authenticate } from '../middleware/auth.middleware.js';
import AdminController from './admin.controller.js';

export const adminRouter: Router = express.Router()

const adminController = new AdminController();

adminRouter.get('/getSchemeData', authenticate(), asyncHandler(adminController.getSchemesData));