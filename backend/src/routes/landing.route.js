import express from "express";
import {
  getLandingStats,
  getCatalogTools,
  getCatalogReagents,
  getFeaturedTools,
  getFeaturedReagents,
  searchCatalog,
  submitContactForm,
  getAvailabilityCalendar,
  getSystemMetrics,
  subscribeNewsletter,
  getCompleteLandingData
} from "../controllers/landing.controller.js";

const router = express.Router();

// ==========================================
// LANDING PAGE ENDPOINTS
// ==========================================

// Stats & Metrics
router.get("/stats", getLandingStats);                    // GET /landing/stats
router.get("/metrics", getSystemMetrics);                 // GET /landing/metrics

// Catalog
router.get("/catalog/tools", getCatalogTools);            // GET /landing/catalog/tools?limit=6
router.get("/catalog/reagents", getCatalogReagents);      // GET /landing/catalog/reagents?limit=6
router.get("/catalog/search", searchCatalog);             // GET /landing/catalog/search?q=mikroskop&type=all

// Featured Items
router.get("/featured/tools", getFeaturedTools);          // GET /landing/featured/tools?limit=6
router.get("/featured/reagents", getFeaturedReagents);    // GET /landing/featured/reagents?limit=6

// Availability
router.get("/availability/:tool_id", getAvailabilityCalendar); // GET /landing/availability/T001?start_date=2026-02-01&days=14

// Forms
router.post("/contact", submitContactForm);               // POST /landing/contact
router.post("/newsletter", subscribeNewsletter);          // POST /landing/newsletter

// Complete Data (All in One)
router.get("/complete", getCompleteLandingData);          // GET /landing/complete?limit=6

export default router;