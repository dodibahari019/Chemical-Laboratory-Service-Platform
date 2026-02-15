import db from "../config/db.js";

export const getAllSchedules = async (req, res) => {
  try {
    // Auto-update completed schedules
    await db.query(`
      UPDATE schedules
      SET status = 'completed'
      WHERE status = 'scheduled'
      AND end_date < NOW()
      AND end_date IS NOT NULL
    `);

    const [rows] = await db.query("SELECT * FROM v_get_all_schedules");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const [results] = await db.query(
      "CALL sp_get_schedule_by_id(?)",
      [req.params.id]
    );
    
    if (!results[0] || results[0].length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const scheduleData = {
      ...results[0][0],
      tools: results[1] || [],
      reagents: results[2] || []
    };

    res.json(scheduleData);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const searchSchedules = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const [rows] = await db.query(
      "CALL sp_search_schedules(?)",
      [keyword]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const getSchedulesByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required" });
    }

    // Auto-update completed schedules
    await db.query(`
      UPDATE schedules
      SET status = 'completed'
      WHERE status = 'scheduled'
      AND end_date < NOW()
      AND end_date IS NOT NULL
    `);

    const [rows] = await db.query(
      "CALL sp_get_schedules_by_date(?,?)",
      [start_date, end_date]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const updateScheduleStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ 
      status: 'error',
      message: "Status is required" 
    });
  }

  // Validate status
  const validStatuses = ['scheduled', 'cancelled', 'completed', 'no_show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      status: 'error',
      message: "Invalid status" 
    });
  }

  try {
    console.log('📝 Updating schedule status:', {
      schedule_id: req.params.id,
      new_status: status
    });

    const [results] = await db.query(
      "CALL sp_update_schedule_status(?, ?)",
      [req.params.id, status]
    );

    const result = results[0][0];

    console.log('✅ Schedule status updated successfully');

    res.json({ 
      status: result.status,
      message: result.message 
    });
  } catch (err) {
    console.error('❌ Update schedule status error:', err);
    res.status(400).json({ 
      status: 'error',
      message: err.sqlMessage || err.message 
    });
  }
};

export const getScheduleStats = async (req, res) => {
  try {
    // Auto-update completed schedules
    await db.query(`
      UPDATE schedules
      SET status = 'completed'
      WHERE status = 'scheduled'
      AND end_date < NOW()
      AND end_date IS NOT NULL
    `);

    const [rows] = await db.query("CALL sp_get_schedule_stats()");
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};