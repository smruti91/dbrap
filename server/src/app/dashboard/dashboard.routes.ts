import express from 'express'
import type { Router } from 'express'
import DashboardController from './dashboard.controller.js'
import { asyncHandler } from '../utils/asyncHandler .js';
import { authPlugins } from 'mysql2';
import { authenticate } from '../middleware/auth.middleware.js';

export const router: Router = express.Router()

const dashboardController = new DashboardController();


router.get('/schemes', authenticate(), asyncHandler(dashboardController.getSchemes));


router.get('/stats', authenticate(), asyncHandler(dashboardController.getSchemesstats));

router.get('/stats/:schemeId', asyncHandler(dashboardController.getSchemeStatsById));
router.get('/PendingTransactions/:schemeId', asyncHandler(dashboardController.getSchemePendingTransactionsById));
router.get('/SanctionTransactions/:schemeId', asyncHandler(dashboardController.getSchemeSanctionTransactionsById));
router.get('/DisbursementTransactions/:schemeId', asyncHandler(dashboardController.getSchemeDisbursementTransactionsById));
router.get('/RejectedTransactions/:schemeId', asyncHandler(dashboardController.getSchemeRejectedTransactionsById));
//router.get("/dashboard/beneficiary-details",dashboardController.getBeneficiaryDetails);
router.get("/beneficiary-details",asyncHandler(dashboardController.getBeneficiaryDetails));
router.get("/scheme-wise-summary",asyncHandler(dashboardController.getSchemeWiseSummary));
router.get("/status-breakdown",asyncHandler(dashboardController.getStatusBreakdown));
router.get('/getDistrictData', authenticate(), asyncHandler(dashboardController.getDistricts));
router.get('/PendingTransactions/:schemeId/district/:districtId', asyncHandler(dashboardController.getDistrictSchemePendingTransactionsById));
