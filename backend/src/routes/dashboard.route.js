import express from "express";
import {
  getKPIDashboard,
  getRequestFlow,
  getToolUsage,
  getToolStatusDistribution,
  getScheduleStatus,
  getRevenueBreakdown,
  getPaymentStatusDistribution,
  getRevenueTrend,
  getReagentStockAlert,
  getReagentConsumption,
  getReagentConsumptionTrend,
  getUserRoleDistribution,
  getTopUsersByRequest,
  getRecentRequests,
  getCompleteDashboard
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// ==========================================
// 1. HIGH-LEVEL KPI
// ==========================================
router.get("/kpi", getKPIDashboard);

// ==========================================
// 2. OPERATIONAL DASHBOARD
// ==========================================
router.get("/request-flow", getRequestFlow);
router.get("/tool-usage", getToolUsage);
router.get("/tool-status", getToolStatusDistribution);
router.get("/schedule-status", getScheduleStatus);

// ==========================================
// 3. FINANCIAL DASHBOARD
// ==========================================
router.get("/revenue-breakdown", getRevenueBreakdown);
router.get("/payment-status", getPaymentStatusDistribution);
router.get("/revenue-trend", getRevenueTrend);

// ==========================================
// 4. INVENTORY & SAFETY
// ==========================================
router.get("/reagent-alert", getReagentStockAlert);
router.get("/reagent-consumption", getReagentConsumption);
router.get("/reagent-consumption/:reagentId", getReagentConsumptionTrend);

// ==========================================
// 5. USER & BEHAVIOR
// ==========================================
router.get("/user-distribution", getUserRoleDistribution);
router.get("/top-users", getTopUsersByRequest);

// ==========================================
// 6. RECENT ACTIVITY
// ==========================================
router.get("/recent-requests", getRecentRequests);

// ==========================================
// 7. COMPLETE DASHBOARD (All in One)
// ==========================================
router.get("/complete", getCompleteDashboard);

export default router;