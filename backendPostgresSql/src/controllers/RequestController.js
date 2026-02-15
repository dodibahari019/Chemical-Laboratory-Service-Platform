import pool from "../config/db.js";

export const createRequest = async (req, res) => {
    const { notes } = req.body;
    const userId = req.user.user_id;

    try {
        await pool.query(
            "CALL sp_request_create($1, $2)",
            [userId, notes]
        );

        res.status(201).json({ message: "Request created" });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

export const addToolToRequest = async (req, res) => {
    const {tool_id, qty} = req.body;

    try {
        await pool.query(
            "CALL sp_request_add_tool($1, $2, $3)",
            [req.params.id, tool_id, qty]
        );

        res.json({ message: "Tool Added" });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

export const addReagentToRequest = async (req, res) => {
    const { reagent_id, qty } = req.body;

    try{
        await pool.query(
            "CALL sp_request_reagents_add($1, $2, $3)",
            [req.params.id, reagent_id, qty]
        );

        res.json({ message: "Reagent Added" });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

export const getMyRequests = async (req, res) => {
    try{
        result = await pool.query(
            "SELECT * FROM fn_request_by_user($1)",
            [req.user.user_id]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}