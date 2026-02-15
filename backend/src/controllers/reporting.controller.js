import db from "../config/db.js";

// Helper function to parse date range
const parseDateRange = (range) => {
  const today = new Date();
  let startDate, endDate;

  switch (range) {
    case 'today':
      startDate = endDate = today.toISOString().split('T')[0];
      break;
    case 'this_week':
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      startDate = weekStart.toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
      break;
    case 'this_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
      break;
    case 'last_month':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startDate = lastMonth.toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      break;
    case 'this_year':
      startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
      break;
    default:
      // Default to this month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
  }

  return { startDate, endDate };
};

// ==========================================
// 1. GET SUMMARY STATISTICS
// ==========================================

export const getSummaryStats = async (req, res) => {
  try {
    const range = req.query.range || 'this_month';
    const { startDate, endDate } = parseDateRange(range);

    const [rows] = await db.query(
      "CALL sp_get_summary_stats(?, ?)",
      [startDate, endDate]
    );

    const data = rows[0][0] || {};
    
    // Calculate percentage changes
    const transactions_change = data.prev_total_transactions > 0
      ? ((data.total_transactions - data.prev_total_transactions) / data.prev_total_transactions * 100).toFixed(1)
      : 0;
    
    const revenue_change = data.prev_total_revenue > 0
      ? ((data.total_revenue - data.prev_total_revenue) / data.prev_total_revenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        ...data,
        transactions_change,
        revenue_change,
        date_range: { startDate, endDate }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 2. GET CATEGORY STATISTICS
// ==========================================

export const getCategoryStats = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_tool_category_stats");
    
    // Calculate percentages
    const total = rows.reduce((sum, row) => sum + parseInt(row.request_count), 0);
    const data = rows.map(row => ({
      ...row,
      percentage: total > 0 ? ((row.request_count / total) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 3. GET REAGENT USAGE REPORT
// ==========================================

export const getReagentUsageReport = async (req, res) => {
  try {
    const range = req.query.range || 'this_month';
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = parseDateRange(range);

    const [rows] = await db.query(
      "CALL sp_get_reagent_usage_report(?, ?, ?)",
      [startDate, endDate, limit]
    );

    res.json({
      success: true,
      data: rows[0] || [],
      date_range: { startDate, endDate }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 4. GET TOP USERS REPORT
// ==========================================

export const getTopUsersReport = async (req, res) => {
  try {
    const range = req.query.range || 'this_month';
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = parseDateRange(range);

    const [rows] = await db.query(
      "CALL sp_get_top_users_report(?, ?, ?)",
      [startDate, endDate, limit]
    );

    res.json({
      success: true,
      data: rows[0] || [],
      date_range: { startDate, endDate }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 5. GET WEEKLY ACTIVITY
// ==========================================

export const getWeeklyActivity = async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 1;

    const [rows] = await db.query(
      "CALL sp_get_weekly_activity(?)",
      [weeks]
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
// 6. GET FINANCIAL REPORT
// ==========================================

export const getFinancialReport = async (req, res) => {
  try {
    const range = req.query.range || 'this_month';
    const { startDate, endDate } = parseDateRange(range);

    const [rows] = await db.query(
      "CALL sp_get_financial_report(?, ?)",
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: rows[0] || [],
      date_range: { startDate, endDate }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 7. GET INVENTORY REPORT
// ==========================================

export const getInventoryReport = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_inventory_report()");

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
// 8. GET BORROWING REPORT
// ==========================================

export const getBorrowingReport = async (req, res) => {
  try {
    const range = req.query.range || 'this_month';
    const { startDate, endDate } = parseDateRange(range);

    const [rows] = await db.query(
      "CALL sp_get_borrowing_report(?, ?)",
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: rows[0] || [],
      date_range: { startDate, endDate }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 9. GET MONTHLY COMPARISON
// ==========================================

export const getMonthlyComparison = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;

    const [rows] = await db.query(
      "CALL sp_get_monthly_comparison(?)",
      [months]
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
// 10. GENERATE REPORT (Mock - untuk development)
// ==========================================

export const generateReport = async (req, res) => {
  try {
    const { reportType, dateRange, format } = req.body;
    const { startDate, endDate } = parseDateRange(dateRange || 'this_month');
    
    // Mock user ID - in production, get from auth session
    const userId = "USR035"; // Admin user
    
    const reportName = `Laporan ${reportType} - ${startDate} to ${endDate}`;
    
    // Insert log
    const [result] = await db.query(
      "CALL sp_insert_report_log(?, ?, ?, ?, ?, ?, @log_id)",
      [reportType, reportName, userId, startDate, endDate, format || 'PDF']
    );
    
    // Get the log_id
    const [[{ log_id }]] = await db.query("SELECT @log_id as log_id");
    
    // Mock: Update status to completed (in production, this would be done after actual file generation)
    await db.query(
      "UPDATE report_logs SET status = 'completed', file_size = '2.4 MB', file_path = ? WHERE log_id = ?",
      [`/reports/${reportName}.${format?.toLowerCase() || 'pdf'}`, log_id]
    );

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        log_id,
        report_name: reportName,
        status: 'completed'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 11. GET RECENT REPORTS
// ==========================================

export const getRecentReports = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [rows] = await db.query(
      "CALL sp_get_recent_reports(?)",
      [limit]
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
// 12. GET COMPLETE REPORTING DATA
// ==========================================

export const getCompleteReportingData = async (req, res) => {
  try {
    const range = req.query.range || 'this_month';
    const { startDate, endDate } = parseDateRange(range);

    // Get all data in parallel
    const [
      summaryResult,
      categoryResult,
      reagentResult,
      topUsersResult,
      weeklyResult,
      recentReportsResult
    ] = await Promise.all([
      db.query("CALL sp_get_summary_stats(?, ?)", [startDate, endDate]),
      db.query("SELECT * FROM v_tool_category_stats"),
      db.query("CALL sp_get_reagent_usage_report(?, ?, ?)", [startDate, endDate, 5]),
      db.query("CALL sp_get_top_users_report(?, ?, ?)", [startDate, endDate, 5]),
      db.query("CALL sp_get_weekly_activity(?)", [1]),
      db.query("CALL sp_get_recent_reports(?)", [5])
    ]);

    const summaryData = summaryResult[0][0][0] || {};
    const transactions_change = summaryData.prev_total_transactions > 0
      ? ((summaryData.total_transactions - summaryData.prev_total_transactions) / summaryData.prev_total_transactions * 100).toFixed(1)
      : 0;
    
    const revenue_change = summaryData.prev_total_revenue > 0
      ? ((summaryData.total_revenue - summaryData.prev_total_revenue) / summaryData.prev_total_revenue * 100).toFixed(1)
      : 0;

    // Calculate category percentages
    const categoryRows = categoryResult[0];
    const categoryTotal = categoryRows.reduce((sum, row) => sum + parseInt(row.request_count), 0);
    const categoryData = categoryRows.map(row => ({
      ...row,
      percentage: categoryTotal > 0 ? ((row.request_count / categoryTotal) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: {
        summary: {
          ...summaryData,
          transactions_change,
          revenue_change
        },
        categories: categoryData,
        reagent_usage: reagentResult[0][0] || [],
        top_users: topUsersResult[0][0] || [],
        weekly_activity: weeklyResult[0][0] || [],
        recent_reports: recentReportsResult[0][0] || [],
        date_range: { startDate, endDate }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};