import db from "../config/db.js";

export const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_get_all_payments");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const [results] = await db.query(
      "CALL sp_get_payment_by_id(?)",
      [req.params.id]
    );
    
    if (!results[0] || results[0].length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Combine all items
    const tools = results[1] || [];
    const reagents = results[2] || [];
    const damages = results[3] || [];
    const penalties = results[4] || [];

    const allItems = [...tools, ...reagents, ...damages, ...penalties];

    const paymentData = {
      ...results[0][0],
      items: allItems,
      isPenalty: penalties.length > 0 || damages.length > 0
    };

    res.json(paymentData);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const searchPayments = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const [rows] = await db.query(
      "CALL sp_search_payments(?)",
      [keyword]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { status, transaction_ref } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    await db.query(
      "CALL sp_update_payment_status(?,?,?)",
      [req.params.id, status, transaction_ref || null]
    );

    res.json({ message: "Payment status updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_payment_stats()");
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};