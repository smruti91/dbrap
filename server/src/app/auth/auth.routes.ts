import express from 'express'
import type { Router } from 'express'
import AuthController from './auth.controller.js'
import { asyncHandler } from '../utils/asyncHandler .js';
import { authenticate } from '../middleware/auth.middleware.js';

const authenticationController = new AuthController();

export const authRouter: Router = express.Router()

authRouter.post('/sign-up', asyncHandler(authenticationController.handleSignup));
authRouter.post('/sign-in', asyncHandler(authenticationController.handleSignIn))
authRouter.post('/refresh-token', asyncHandler(authenticationController.handleRefreshToken) )
authRouter.get('/me', authenticate(), asyncHandler(authenticationController.handleMe))
authRouter.post('/logout', authenticate(), asyncHandler(authenticationController.handleLogout))
