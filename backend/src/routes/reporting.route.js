import express from "express";
import {
  getSummaryStats,
  getCategoryStats,
  getReagentUsageReport,
  getTopUsersReport,
  getWeeklyActivity,
  getFinancialReport,
  getInventoryReport,
  getBorrowingReport,
  getMonthlyComparison,
  generateReport,
  getRecentReports,
  getCompleteReportingData
} from "../controllers/reporting.controller.js";

const router = express.Router();

// ==========================================
// REPORTING ENDPOINTS
// ==========================================

// Summary & Overview
router.get("/summary", getSummaryStats);              // GET /reporting/summary?range=this_month
router.get("/categories", getCategoryStats);           // GET /reporting/categories

// Detailed Reports
router.get("/reagent-usage", getReagentUsageReport);  // GET /reporting/reagent-usage?range=this_month&limit=10
router.get("/top-users", getTopUsersReport);          // GET /reporting/top-users?range=this_month&limit=10
router.get("/weekly-activity", getWeeklyActivity);     // GET /reporting/weekly-activity?weeks=1
router.get("/financial", getFinancialReport);          // GET /reporting/financial?range=this_month
router.get("/inventory", getInventoryReport);          // GET /reporting/inventory
router.get("/borrowing", getBorrowingReport);          // GET /reporting/borrowing?range=this_month
router.get("/monthly-comparison", getMonthlyComparison); // GET /reporting/monthly-comparison?months=6

// Report Generation
router.post("/generate", generateReport);              // POST /reporting/generate
router.get("/recent", getRecentReports);               // GET /reporting/recent?limit=10

// Complete Dashboard Data (All in One)
router.get("/complete", getCompleteReportingData);     // GET /reporting/complete?range=this_month

export default router;