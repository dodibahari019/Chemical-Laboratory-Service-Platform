import db from '../config/db.js';

// ============================================
// DASHBOARD
// ============================================

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [results] = await db.query(
      'CALL sp_get_customer_dashboard_stats(?)',
      [userId]
    );

    res.json({
      status: 'success',
      data: results[0][0]
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getRecentRequests = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const limit = parseInt(req.query.limit) || 5;

    const [results] = await db.query(
      'CALL sp_get_customer_recent_requests(?, ?)',
      [userId, limit]
    );

    res.json({
      status: 'success',
      data: results[0]
    });
  } catch (err) {
    console.error('Error getting recent requests:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getUpcomingSchedules = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const limit = parseInt(req.query.limit) || 5;

    const [results] = await db.query(
      'CALL sp_get_customer_upcoming_schedules(?, ?)',
      [userId, limit]
    );

    res.json({
      status: 'success',
      data: results[0]
    });
  } catch (err) {
    console.error('Error getting upcoming schedules:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// ============================================
// MY REQUESTS
// ============================================

export const getAllMyRequests = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const status = req.query.status || null;
    const search = req.query.search || null;

    const [results] = await db.query(
      'CALL sp_get_all_customer_requests(?, ?, ?)',
      [userId, status, search]
    );

    res.json({
      status: 'success',
      data: results[0]
    });
  } catch (err) {
    console.error('Error getting all requests:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const getRequestDetail = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.user_id;

    const [results] = await db.query(
      'CALL sp_get_request_detail_customer(?)',
      [requestId]
    );

    if (!results[0] || results[0].length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Request tidak ditemukan'
      });
    }

    // Verify ownership
    if (results[0][0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki akses ke request ini'
      });
    }

    res.json({
      status: 'success',
      data: {
        request: results[0][0],
        tools: results[1] || [],
        reagents: results[2] || []
      }
    });
  } catch (err) {
    console.error('Error getting request detail:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.user_id;
    const { reason } = req.body;

    // Verify ownership
    const [request] = await db.query(
      'SELECT user_id, status FROM requests WHERE request_id = ?',
      [requestId]
    );

    if (!request || request.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Request tidak ditemukan'
      });
    }

    if (request[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki akses ke request ini'
      });
    }

    if (request[0].status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Request sudah dibatalkan'
      });
    }

    if (request[0].status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Request yang sudah selesai tidak dapat dibatalkan'
      });
    }

    // Call cancel procedure (if exists) or update directly
    await db.query(
      'UPDATE requests SET status = ? WHERE request_id = ?',
      ['cancelled', requestId]
    );

    // Update schedule if exists
    await db.query(
      'UPDATE schedules SET status = ? WHERE request_id = ?',
      ['cancelled', requestId]
    );

    // Create cancellation record
    const [cancelId] = await db.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(cancellation_id, 4) AS UNSIGNED)), 0) + 1 as next_id FROM cancellations'
    );
    const cancellationId = `CNC${String(cancelId[0].next_id).padStart(7, '0')}`;

    await db.query(
      `INSERT INTO cancellations (cancellation_id, request_id, type, notes) 
       VALUES (?, ?, 'cancelled', ?)`,
      [cancellationId, requestId, reason || 'Dibatalkan oleh customer']
    );

    res.json({
      status: 'success',
      message: 'Request berhasil dibatalkan'
    });
  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const limit = parseInt(req.query.limit) || 10;

    const [notifications] = await db.query(
      `SELECT 
        notification_id,
        messages,
        type,
        status,
        created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    res.json({
      status: 'success',
      data: notifications
    });
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.user_id;

    // Verify ownership
    const [notification] = await db.query(
      'SELECT user_id FROM notifications WHERE notification_id = ?',
      [notificationId]
    );

    if (!notification || notification.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Notifikasi tidak ditemukan'
      });
    }

    if (notification[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki akses ke notifikasi ini'
      });
    }

    await db.query(
      'UPDATE notifications SET status = ? WHERE notification_id = ?',
      ['read', notificationId]
    );

    res.json({
      status: 'success',
      message: 'Notifikasi ditandai sudah dibaca'
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};