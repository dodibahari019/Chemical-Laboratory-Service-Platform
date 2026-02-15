import db from "../config/db.js";
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_get_all_users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "CALL sp_get_user_by_id(?)",
      [req.params.id]
    );

    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const [rows] = await db.query(
      "CALL sp_search_users(?)",
      [keyword]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const createUser = async (req, res) => {
  const { name, email, username, password, no_hp, role, auth_provider } = req.body;

  try {
    const saltRounds = 10; // tingkat kompleksitas hash
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.query(
      "CALL sp_create_user(?,?,?,?,?,?,?)",
      [name, email, username, hashedPassword, no_hp, role, auth_provider]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({
      error: err.sqlMessage
    });
  }
};

export const updateUser = async (req, res) => {
  const { name, email, username, no_hp, password, role } = req.body;

  try {
    let hashedPassword = null;

    if (password && password.trim() !== '') {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    await db.query(
      "CALL sp_update_user(?,?,?,?,?,?,?)",
      [req.params.id, name, email, username, no_hp, hashedPassword, role]
    );

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await db.query(
      "CALL sp_deactivate_user(?)",
      [req.params.id]
    );

    res.json({ message: "User deactivated" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};
