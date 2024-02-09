const shopModel = require("../models/shopModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

exports.registershop = async(req,res)=>{
    try {

        // get the requirement for the registration
        const {businessName, address, email, phoneNumber, password, confirmPassword}  = req.body
        // check if theemai already exist
        const emailExist = await shopModel.findOne({email})
        if (emailExist) {
            return res.status(400).json({
                error: "email already in use by another shop"
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
        // register the shop
        const newshop = await shopModel.create({
            businessName:businessName.toLowerCase().charAt(0).toUpperCase() + businessName.slice(1),
            address:address,
            email:email.toLowerCase(),
            phoneNumber,
            password:hashPass,
            confirmPassword:hashPass
        })

        // generate a token for the shop 
        const token = jwt.sign({
            userId:shopModel._id,
            email:shopModel.email,
        },process.env.JWT_KEY,{expiresIn:"7d"})

            const link = `http://localhost:${port}/verify-user/${shopModel.id}/${token}`
            const html = dynamicHtml(link, shopModel.firstName)
            sendEmail({
            email:shopModel.email,
            subject:"Click on the button below to verify your email", 
            html
            })
        // throw a failure message
        if(!newshop){
            return res.status(400).json({
                error:"error creating your account"
            })
        }
        // success message
        res.status(200).json({
            message:`HELLO👋 ${newshop.businessName.toUpperCase()} YOUR ACCOUNT HAS BEEN CREATED SUCCESSFULLY🎉🥳`,
            data: newshop 
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}
exports.verify = async (req,res)=>{
    try{
       
          const  id = req.params.id
          const userToken = req.params.userToken
       
       const updatedUser = await myModel.findByIdAndUpdate(id, {isVerified: true}, {new: true})
       await jwt.verify(userToken, process.env.secret )
   
       res.status(200).json({
           message:`user with emmail:${updatedUser.email} is now verified`,
           data: updatedUser
       })
    }catch(err){
       res.status(500).json({
           error: err.message
       })
    }
   
   }
exports.signIn = async(req,res)=>{
    try {

        // get the requirement
        const {email,password} = req.body
        // check if the shop is existing on the platform
        const shopExist = await shopModel.findOne({email:email.toLowerCase()})
        if(!shopExist){
            return res.status(404).json({
                error:"email does not exist"
            })
        }
        // check for password
        const checkPassword = bcrypt.compareSync(password,shopExist.password)
        if(!checkPassword){
            return res.status(400).json({
                error:"incorrect password"
            })
        }
        // generate a token for the shop 
        const token = jwt.sign({
            userId:shopExist._id,
            email:shopExist.email,
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

        // get the shops token
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            return res.status(400).json({
                error:"Authorization failed: token not found"
            })
        }
        // get the shops id
        const id = req.user.userId
        // find the user
        const shop = await shopModel.findById(id)
        // push the shop to the black list and save
        shop.blackList.push(token)
        await shop.save()
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