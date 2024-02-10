const shopModel = require("../models/shopModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const dynamicHtml = require("../helpers/html")
const { sendEmail } = require("../helpers/email")
const { resetFunc } = require("../helpers/resetHTML")
const port = process.env.PORT 

exports.registerShop = async(req,res)=>{
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
            userId:newshop._id,
            email:newshop.email,
            businessName: newshop.businessName
        },process.env.JWT_KEY,{expiresIn:"6000s"})

            const link = `http://localhost:${port}/verify-shop/${newshop.id}/${token}`
            const html = dynamicHtml(link, businessName)
            sendEmail({
            email:newshop.email,
            subject:"Click on the button below to verify your email", 
            html
            })
        // throw a failure message
        if(!newshop){
            return res.status(400).json({
                error:"error creating your account"
            })
        }
        if(shopModel.isVerified === false){
            return res.status(400).json({
                error: 'Unable to create this user'
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
          const token = req.params.token
          
          await jwt.verify(token, process.env.JWT_KEY )

       const updatedUser = await shopModel.findByIdAndUpdate(id, {isVerified: true}, {new: true})
   
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
exports.signInShop = async(req,res)=>{
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

//Function for the user incase password is forgotten
exports.forgotShopPassword = async (req, res) => {
    try {
        const checkShop = await shopModel.findOne({ email: req.body.email });
        if (!checkShop) {
            return res.status(404).json({
                message: 'Email does not exist'
            });
        }
        else {
            const subject = 'Kindly reset your password'
            const link = `http://localhost:${port}/shop-reset/${checkShop.id}`
            const html = resetFunc(checkShop.businessName, link)
            sendEmail({
                email: checkShop.email,
                html,
                subject
            })
            return res.status(200).json({
                message: "Kindly check your email to reset your password",
            })
        }
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
    }

//Funtion to send the reset Password page to the server
exports.resetShopPasswordPage = async (req, res) => {
    try {
        const id = req.params.id;
        const resetPage = resetFunc(id);

        // Send the HTML page as a response to the user
        res.send(resetPage);
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
    }



//Function to reset the user password
exports.resetShopPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const password = req.body.password;

        if (!password) {
            return res.status(400).json({
                message: "Password cannot be empty",
            });
        }

        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        const reset = await shopModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });
        return res.status(200).json({
            message: "Password reset successfully",
        });
    }catch(err){
        res.status(500).json({
            error: err.message
        }) 
    }
    }