import db from "../config/db.js";

export const testDB = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    res.json({ db: "connected", result: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
