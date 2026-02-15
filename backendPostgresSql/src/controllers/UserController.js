import pool from '../config/db.js';
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM fn_users_get_all()"
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM fn_users_get_by_id($1)",
            [id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ messages: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createUser = async (req, res) => {
    const { user_id, name, email, password, role, auth_provider, status } = req.body;
    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        await pool.query(
            "CALL sp_users_create($1, $2, $3, $4, $5)",
            [name, email, hashedPassword, role, auth_provider]
        );
        res.status(201).json({message: "User created"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const {name, email, role, status} = req.body;

    try {
        await pool.query(
            "CALL sp_users_update($1, $2, $3, $4, $5)",
            [id, name, email, role, status]
        );
        res.json({ message: "User updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try{
        await pool.query(
            "CALL sp_users_deactivate($1)",
            [id]
        );
        res.json({ message: "User deactivated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};