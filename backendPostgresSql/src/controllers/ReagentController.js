import pool from "../config/db.js";

export const getReagents = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM fn_reagents_get_all()"
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getReagentById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM fn_reagents_get_by_id($1)",
            [id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ message: "Reagent not found" });
        }

        res.json(result.rows[0]);
    } catch (err){
        res.status(500).json({ error: err.message });
    }
};

export const createReagent = async (req, res) => {
    const { name, stock_quantity, unit, expired_date, status } = req.body;
    try {
        await pool.query(
            "CALL sp_reagents_create($1, $2, $3, $4, $5)",
            [name, stock_quantity, unit, expired_date, status]
        );

        res.status(201).json({ message: "Reagent created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateReagent = async (req, res) => {
    const { id } = req.params;
    const { name, stock_quantity, unit, expired_date, status } = req.body;

    try {
        await pool.query(
            "CALL sp_reagents_update($1, $2, $3, $4, $5, $6)",
            [id, name, stock_quantity, unit, expired_date, status]
        );

        res.json({ message: "Reagent updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteReagent = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            "CALL sp_reagents_deactivate($1)",
            [id]
        );

        res.json({ message: "Raagent marked as expired" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}