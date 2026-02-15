import db from "../config/db.js";

export const getTopTools = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_top_tools()");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTopReagents = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_top_reagents()");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCatalogTools = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_catalog_tools()");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCatalogReagents = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_catalog_reagents()");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};