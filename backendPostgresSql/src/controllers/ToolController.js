import pool from "../config/db.js";

export const getTools = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM fn_tools_get_all()"
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

export const getToolById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM fn_tools_get_by_id($1)",
            [id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({ message: "Tool not Found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createTool = async (req, res) => {
    const { name, description, risk_level, total_stock , status} = req.body;
    try {
        await pool.query(
            "CALL sp_tools_create($1, $2, $3, $4, $5)",
            [name, description, risk_level, total_stock, status]
        );

        res.status(201).json({ message: "Tool created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateTool = async (req, res) => {
    const { id } = req.params;
    const { name, description, risk_level, total_stock, available_stock, status } = req.body;

    try {
        await pool.query(
            "CALL sp_tools_update($1, $2, $3, $4, $5, $6, $7)",
            [id, name, description, risk_level, total_stock, available_stock, status]
        );

        res.json({ message: "Tool updated" });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};

export const deleteTool = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            "CALL sp_tools_deactivate($1)",
            [id]
        );

        res.json({ message: "Tool deactivated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};