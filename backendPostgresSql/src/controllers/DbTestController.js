import pool from '../config/db.js';

export const backendCheck = (req, res) => {
    res.json({ status: "Backend is running, darling!!!"});
};

export const databaseTest = async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            success: true,
            time: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database not connected"
        });
    }
}