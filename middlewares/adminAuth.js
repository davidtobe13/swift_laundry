const regModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticateAdmin = async (req, res, next) => {
    try {
        // Get the token and split it from the bearer
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                error: "Authorization failed: token not found"
            });
        }
        // Check the validity of the token
        const decodeToken = jwt.verify(token, process.env.JWT_KEY);
        // Get the user with the token
        const user = await regModel.findById(decodeToken.userId);
        if (!user) {
            return res.status(404).json({
                error: "This user does not exist in this platform"
            });
        }
        if (user.blackList.includes(token)) {
            return res.status(400).json({
                error: "User logged out"
            });
        }
        // Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({
                error: "Unauthorized: User is not an admin"
            });
        }
        req.user = decodeToken;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                error: "Session Timeout"
            });
        }
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = authenticateAdmin;
