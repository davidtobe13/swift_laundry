const userModel = require("../models/userModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { resetFunc } = require("../helpers/resetHTML")

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

//Function for the user incase password is forgotten
exports.forgotPassword = async (req, res) => {
    try {
        const checkUser = await userModel.findOne({ email: req.body.email });
        if (!checkUser) {
            return res.status(404).json({
                error: 'Email does not exist'
            });
        }
        else {
            const subject = 'Kindly reset your password'
            const link = `http://localhost:${port}/user-reset/${checkUser.id}`
            const html = resetFunc(checkUser.fullName, link)
            sendEmail({
                email: checkUser.email,
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
exports.resetPasswordPage = async (req, res) => {
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
exports.resetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const password = req.body.password;

        if (!password) {
            return res.status(400).json({
                error: "Password cannot be empty",
            });
        }

        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        const reset = await userModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });
        return res.status(200).json({
            message: "Password reset successfully",
        });
    }catch(err){
        res.status(500).json({
            error: err.message
        }) 
    }
    }

    // const updateUser = async (req, res) => {
    //     const id = req.user.userId
    //     const {
    //         firstName,
    //         lastName,
    //         phoneNumber,
    //         address,
    //         profileImage     
    //     } = req.body
    //     const file = req.file.filename
    //     const result = await cloudinary.uploader.upload(file)

    //     const updateProfile = await userModel.findByIdAndUpdate(id, {profileImage: result.secure_url}, {new:true})

    //     if(!updateProfile){
    //         return res.status(403).json({
    //             error: `Unable to update this user`
    //         })
    //     }

    //     res.status(200).json({
    //         message: 'Successfully updated your profile'
    //     })
    // }

    const updateUser = async (req, res) => {
        const id = req.user.userId;
        const {
            firstName,
            lastName,
            phoneNumber,
            address,
        } = req.body;
        
        let profileImage;
        if (req.file) {
            // If a file is uploaded, upload it to Cloudinary
            const file = req.file.path;
            const result = await cloudinary.uploader.upload(file);
            profileImage = result.secure_url;
        }
    
        // Prepare the update object with updated fields
        const updateObject = {
            firstName,
            lastName,
            phoneNumber,
            address,
        };
    
        // Add profileImage to updateObject if it exists
        if (profileImage) {
            updateObject.profileImage = profileImage;
        }
    
        try {
            // Update the user document in the database
            const updatedUser = await userModel.findByIdAndUpdate(id, updateObject, { new: true });
    
            if (!updatedUser) {
                return res.status(404).json({
                    error: `User with not found`
                });
            }
    
            res.status(200).json({
                message: 'Successfully updated your profile',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    };
    