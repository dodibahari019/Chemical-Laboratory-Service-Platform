import db from "../config/db.js";

// ==========================================
// 1. GET LANDING PAGE STATS
// ==========================================

export const getLandingStats = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_landing_stats()");
    
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
// 2. GET CATALOG TOOLS
// ==========================================

export const getCatalogTools = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const [rows] = await db.query(
      "CALL sp_get_catalog_tools(?)",
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
// 3. GET CATALOG REAGENTS
// ==========================================

export const getCatalogReagents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const [rows] = await db.query(
      "CALL sp_get_catalog_reagents(?)",
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
// 4. GET FEATURED TOOLS
// ==========================================

export const getFeaturedTools = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const [rows] = await db.query(
      "SELECT * FROM v_featured_tools LIMIT ?",
      [limit]
    );
    
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

// ==========================================
// 5. GET FEATURED REAGENTS
// ==========================================

export const getFeaturedReagents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const [rows] = await db.query(
      "SELECT * FROM v_featured_reagents LIMIT ?",
      [limit]
    );
    
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

// ==========================================
// 6. SEARCH CATALOG
// ==========================================

export const searchCatalog = async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const type = req.query.type || 'all'; // 'tools', 'reagents', or 'all'
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      });
    }
    
    const [rows] = await db.query(
      "CALL sp_search_catalog(?, ?)",
      [searchTerm, type]
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
// 7. SUBMIT CONTACT FORM
// ==========================================

export const submitContactForm = async (req, res) => {
  try {
    const { full_name, email, company, service_type, message } = req.body;
    
    // Validation
    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nama dan email wajib diisi'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format email tidak valid'
      });
    }
    
    const [result] = await db.query(
      "CALL sp_submit_contact_form(?, ?, ?, ?, ?, @submission_id)",
      [full_name, email, company || null, service_type || null, message || null]
    );
    
    // Get the submission_id
    const [[{ submission_id }]] = await db.query("SELECT @submission_id as submission_id");
    
    res.json({
      success: true,
      message: 'Pesan berhasil dikirim. Tim kami akan menghubungi Anda segera.',
      data: {
        submission_id
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
// 8. GET AVAILABILITY CALENDAR
// ==========================================

export const getAvailabilityCalendar = async (req, res) => {
  try {
    const { tool_id } = req.params;
    const startDate = req.query.start_date || new Date().toISOString().split('T')[0];
    const days = parseInt(req.query.days) || 14;
    
    const [rows] = await db.query(
      "CALL sp_get_availability_calendar(?, ?, ?)",
      [tool_id, startDate, days]
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
// 9. GET SYSTEM METRICS
// ==========================================

export const getSystemMetrics = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_system_metrics");
    
    res.json({
      success: true,
      data: rows[0] || {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 10. SUBSCRIBE NEWSLETTER
// ==========================================

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email wajib diisi'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format email tidak valid'
      });
    }
    
    const [result] = await db.query(
      "CALL sp_subscribe_newsletter(?, @success, @message)",
      [email]
    );
    
    // Get the output parameters
    const [[{ success, message }]] = await db.query(
      "SELECT @success as success, @message as message"
    );
    
    if (success) {
      res.json({
        success: true,
        message
      });
    } else {
      res.status(400).json({
        success: false,
        error: message
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ==========================================
// 11. GET COMPLETE LANDING PAGE DATA
// ==========================================

export const getCompleteLandingData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    // Get all data in parallel
    const [
      statsResult,
      toolsResult,
      reagentsResult,
      metricsResult
    ] = await Promise.all([
      db.query("CALL sp_get_landing_stats()"),
      db.query("CALL sp_get_catalog_tools(?)", [limit]),
      db.query("CALL sp_get_catalog_reagents(?)", [limit]),
      db.query("SELECT * FROM v_system_metrics")
    ]);
    
    res.json({
      success: true,
      data: {
        stats: statsResult[0][0][0] || {},
        tools: toolsResult[0][0] || [],
        reagents: reagentsResult[0][0] || [],
        metrics: metricsResult[0][0] || {}
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};