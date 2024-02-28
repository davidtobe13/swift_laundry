// const userModel = require("../models/userModel")
// const jwt = require("jsonwebtoken")
// require('dotenv').config()

// const authenticate = async(req,res,next)=>{
//     try {

//         // get the token and split it from the bearer
//         const token = req.headers.authorization.split(" ")[1]
//         if (!token) {
//             return res.status(404).json({
//                 error:"Authorization failed: token not found"
//             })
//         }
//         // check the validity of the token
//         const decodeToken = jwt.verify(token,process.env.JWT_KEY)
//         // get the user with the token
//         const user = await userModel.findById(decodeToken.userId)
//         if (!user) {
//             return res.status(404).json({
//                 error:"this user does not exist in this platform"
//             })
//         }
//         if (user.blackList.includes(token)) {
//             return res.status(400).json({
//                 error:"user loggedOut"
//             })
//         }
//         req.user = decodeToken
//         next()
        
//     } catch (error) {
//         if (error instanceof jwt.JsonWebTokenError) {
//             return res.status(400).json({
//                 error:"session TimeOut"
//             })
//         }
//         res.status(500).json({
//             error:error.message
//         })
//     }
// }

// module.exports = authenticate


// const userModel = require("../models/userModel");
// const shopModel = require("../models/shopModel");
// const jwt = require("jsonwebtoken");
// require('dotenv').config();

// const authenticate = async (req, res, next) => {
//     try {
//         // Get the token and split it from the bearer
//         const token = req.headers.authorization.split(" ")[1];
//         if (!token) {
//             return res.status(404).json({
//                 error: "Authorization failed: token not found"
//             });
//         }
//         // Check the validity of the token
//         const decodedToken = jwt.verify(token, process.env.JWT_KEY);
//         // Find user by ID in userModel
//         let user = await userModel.findById(decodedToken.userId);
//         if (!user) {
//             // If not found, find in shopModel
//             user = await shopModel.findById(decodedToken.userId);
//         }
//         if (!user) {
//             return res.status(404).json({
//                 error: "User not found"
//             });
//         }
//         // Check if the token is blacklisted
//         if (user.blackList.includes(token)) {
//             return res.status(400).json({
//                 error: "User logged out"
//             });
//         }
//         // Store the user object in the request object
//         req.user = user;
        
//         // Check if the user is an admin
//         if (user.isAdmin) {
//             req.isAdmin = true;
//         } else {
//             req.isAdmin = false;
//         }

//         next();
//     } catch (error) {
//         if (error instanceof jwt.JsonWebTokenError) {
//             return res.status(400).json({
//                 error: "Session Timeout"
//             });
//         }
//         res.status(500).json({
//             error: error.message
//         });
//     }
// };

// module.exports = authenticate;




const userModel = require("../models/userModel");
const shopModel = require("../models/shopModel");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        // Get the token and split it from the bearer
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                error: "Authorization failed: token not found"
            });
        }
        // Check the validity of the token
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        // Find user by ID in userModel
        let user = await userModel.findById(decodedToken.userId);
        if (!user) {
            // If not found, find in shopModel
            user = await shopModel.findById(decodedToken.userId);
        }
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        // Check if the token is blacklisted
        if (user.blackList.includes(token)) {
            return res.status(400).json({
                error: "Unable to perform this action: User is logged out"
            });
        }
        // Store the user object in the request object
        req.user = {
            userId: user._id,
            isAdmin: user.isAdmin
        };
                if (user.isAdmin) {
                        req.isAdmin = true;
                    } else {
                        req.isAdmin = false;
                    }

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

module.exports = authenticate;
