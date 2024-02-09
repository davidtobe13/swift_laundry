const regModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
require('dotenv').config()

const authenticate = async(req,res,next)=>{
    try {

        // get the token and split it from the bearer
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            return res.status(404).json({
                error:"Authorization failed: token not found"
            })
        }
        // check the validity of the token
        const decodeToken = jwt.verify(token,process.env.JWT_KEY)
        // get the user with the token
        const user = await regModel.findById(decodeToken.userId)
        if (!user) {
            return res.status(404).json({
                error:"this user does not exist in this platform"
            })
        }
        if (user.blackList.includes(token)) {
            return res.status(400).json({
                error:"user loggedOut"
            })
        }
        req.user = decodeToken
        next()
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                error:"session TimeOut"
            })
        }
        res.status(500).json({
            error:error.message
        })
    }
}

module.exports = authenticate