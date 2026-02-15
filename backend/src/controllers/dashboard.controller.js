import db from "../config/db.js";

// ==========================================
// 1. HIGH-LEVEL KPI DASHBOARD
// ==========================================

export const getKPIDashboard = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_kpi_dashboard()");
    
    res.json({
      success: true,
      data: rows[0][0] || {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 2. OPERATIONAL DASHBOARD
// ==========================================

export const getRequestFlow = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await db.query("CALL sp_get_request_flow(?)", [days]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getToolUsage = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query("CALL sp_get_tool_usage(?)", [limit]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getToolStatusDistribution = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_tool_status_distribution");
    
    res.json({
      success: true,
      data: rows || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getScheduleStatus = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await db.query("CALL sp_get_schedule_status(?)", [days]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 3. FINANCIAL DASHBOARD
// ==========================================

export const getRevenueBreakdown = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const [rows] = await db.query("CALL sp_get_revenue_breakdown(?)", [months]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getPaymentStatusDistribution = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_payment_status_distribution");
    
    res.json({
      success: true,
      data: rows || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getRevenueTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await db.query("CALL sp_get_revenue_trend(?)", [days]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 4. INVENTORY & SAFETY DASHBOARD
// ==========================================

export const getReagentStockAlert = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_reagent_stock_alert");
    
    res.json({
      success: true,
      data: rows || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getReagentConsumption = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query("CALL sp_get_reagent_consumption(?)", [limit]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getReagentConsumptionTrend = async (req, res) => {
  try {
    const reagentId = req.params.reagentId;
    const days = parseInt(req.query.days) || 30;
    
    const [rows] = await db.query(
      "CALL sp_get_reagent_consumption_trend(?, ?)", 
      [reagentId, days]
    );
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 5. USER & BEHAVIOR INSIGHT
// ==========================================

export const getUserRoleDistribution = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_user_role_distribution");
    
    res.json({
      success: true,
      data: rows || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getTopUsersByRequest = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;
    
    const [rows] = await db.query(
      "CALL sp_get_top_users_by_request(?, ?)", 
      [limit, days]
    );
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 6. RECENT ACTIVITY
// ==========================================

export const getRecentRequests = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query("CALL sp_get_recent_requests(?)", [limit]);
    
    res.json({
      success: true,
      data: rows[0] || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 7. COMBINED DASHBOARD
// ==========================================

export const getCompleteDashboard = async (req, res) => {
  try {
    // Get all dashboard data in parallel
    const [kpi] = await db.query("CALL sp_get_kpi_dashboard()");
    const [toolStatus] = await db.query("SELECT * FROM v_tool_status_distribution");
    const [paymentStatus] = await db.query("SELECT * FROM v_payment_status_distribution");
    const [userDist] = await db.query("SELECT * FROM v_user_role_distribution");
    const [reagentAlert] = await db.query("SELECT * FROM v_reagent_stock_alert LIMIT 10");
    const [recentReq] = await db.query("CALL sp_get_recent_requests(5)");
    
    res.json({
      success: true,
      data: {
        kpi: kpi[0][0] || {},
        toolStatus: toolStatus || [],
        paymentStatus: paymentStatus || [],
        userDistribution: userDist || [],
        reagentAlert: reagentAlert || [],
        recentRequests: recentReq[0] || []
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};