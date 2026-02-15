import pool from '../config/db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const {email, password} = req.body;

    try{
        const result = await pool.query(
            "SELECT * FROM fn_auth_login($1)",
            [email]
        );

        if(result.rows.length === 0){
            return res.status(401).json({messages: "Invalid credentials"});
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign(
            {   
                user_id: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};