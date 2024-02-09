const userModel = require("../models/userModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

exports.registerUser = async(req,res)=>{
    try {

        // get the requirement for the registration
        const {firstName, lastName, email, phoneNumber, password, confirmPassword}  = req.body
        // check if theemai already exist
        const emailExist = await userModel.findOne({email})
        if (emailExist) {
            return res.status(400).json({
                error: "email already in use by another user"
            })
        }
        // comfirm if the password corresponds
        if(confirmPassword !== password){
            return res.status(400).json({
                error:"password does not match"
            })
        }
        // hash both password
        const saltPass = bcrypt.genSaltSync(10)
        const hashPass = bcrypt.hashSync(password&&confirmPassword,saltPass)
        // register the user
        const newUser = await userModel.create({
            firstName:firstName.toLowerCase().charAt(0).toUpperCase() + firstName.slice(1),
            lastName:lastName.toLowerCase().charAt(0).toUpperCase() + lastName.slice(1),
            email:email.toLowerCase(),
            phoneNumber,
            password:hashPass,
            confirmPassword:hashPass
        })
        // throw a failure message
        if(!newUser){
            return res.status(400).json({
                error:"error creating your account"
            })
        }
        // success message
        res.status(200).json({
            message:`HELLO👋 ${newUser.firstName.toUpperCase()} ${newUser.lastName.slice(0,1).toUpperCase()} YOUR ACCOUNT HAS BEEN CREATED SUCCESSFULLY🎉🥳`,
            data: newUser 
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

exports.signIn = async(req,res)=>{
    try {

        // get the requirement
        const {email,password} = req.body
        // check if the user is existing on the platform
        const userExist = await userModel.findOne({email:email.toLowerCase()})
        if(!userExist){
            return res.status(404).json({
                error:"email does not exist"
            })
        }
        // check for password
        const checkPassword = bcrypt.compareSync(password,userExist.password)
        if(!checkPassword){
            return res.status(400).json({
                error:"incorrect password"
            })
        }
        // generate a token for the user 
        const token = jwt.sign({
            userId:userExist._id,
            email:userExist.email,
        },process.env.JWT_KEY,{expiresIn:"1d"})

        // throw a success message
        res.status(200).json({
            message:'successfully logged in',
            data:token
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

exports.signOut = async(req,res)=>{
    try {

        // get the users token
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            return res.status(400).json({
                error:"Authorization failed: token not found"
            })
        }
        // get the users id
        const id = req.user.userId
        // find the user
        const user = await userModel.findById(id)
        // push the user to the black list and save
        user.blackList.push(token)
        await user.save()
        // show a success response
        res.status(200).json({
            message:"successfully logged out"
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}