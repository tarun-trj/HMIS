import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // This must run BEFORE you access process.env


const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        console.error("Token error:", err.name, err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
