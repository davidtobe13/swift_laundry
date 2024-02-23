const userModel = require("../models/userModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { resetFunc } = require("../helpers/resetHTML")
const mainOrderModel = require("../models/mainOrderModel")

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
    
    exports.getAllOrders = async (req, res) =>{
        try{ 
            // Find user by ID
            const userId = req.user.userId;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const orders = await mainOrderModel.find().populate('order')

            if(orders.length === 0){
                return res.status(400).json({
                    error: "no orders placed yet"
                })
            }

            res.status(200).json({
                message: `You have ${orders.length} orders`,
                data: orders
            })
        }
        catch(error){
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }

    exports.getAllPendingOrders = async (req, res) => {
        try {
            // Find user by ID
            const userId = req.user.userId;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Find pending orders
            const pendingOrders = await mainOrderModel.find({ status: 'pending' }).populate('order');
    
            if (pendingOrders.length === 0) {
                return res.status(404).json({ error: 'You have no pending orders' });
            }
    
            res.status(200).json({
                message: `You have ${pendingOrders.length} pending orders`,
                data: pendingOrders
            });
        } catch (error) {
            console.error('Error getting pending orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    

    exports.getAllCompletedOrders = async (req, res) => {
        try {
            // Find user by ID
            const userId = req.user.userId;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Find completed orders
            const completedOrders = await mainOrderModel.find({ status: 'completed' }).populate('order');
    
            if (completedOrders.length === 0) {
                return res.status(404).json({ error: 'You have no completed orders' });
            }
    
            res.status(200).json({
                message: `You have ${completedOrders.length} completed orders`,
                data: completedOrders
            });
        } catch (error) {
            console.error('Error getting completed orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };


exports.getOneOrder = async(req, res) =>{
    try{
        const userId = req.user.userId
        const orderId = req.params.orderId

        const user = await userModel.findById(userId)

        if(!user){
            res.status(404).json({
                error: 'User not found'
            })
        }

        const order = await mainOrderModel.findById(orderId).populate('order')
        if(!order){
            return res.status(404).json({
                error: 'Order not found'
            })
        }

        res.status(200).json({
            message: 'Order fetched successfully',
            data: order
        })
    }catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get One Shop
exports.getOneShop = async (req, res) => {
    try {
        const userId = req.user.userId;
        const shopId = req.params.shopId;

        // Fetch user by ID and populate their orders
        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch user by ID and populate their orders
        const shop = await shopModel.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.status(201).json({
            message: 'Shop Fatched successfully',
            data: shop
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// Get One Shop
exports.getAllShop = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch user by ID and populate their orders
        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch user by ID and populate their orders
        const shop = await shopModel.find();
        if (!shop) {
            return res.status(404).json({ error: 'Shops not found' });
        }
        res.status(201).json({
            message: `There are ${shop.length} shops around you`,
            data: shop
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// User subscription
exports.userSilverPlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const shopId = req.params.shopId;

        // Fetch user by ID and populate their orders
        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch user by ID and populate their orders
        const shop = await shopModel.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        const silver = user.subscribed
        const subscribe = await userModel.findByIdAndUpdate(userId, {silver:'silver'}, {new: true});

        if(!subscribe){
            return res.status(403).json({
                error: 'Unable to subscribe for this plan'
            })
        }
        res.status(201).json({
            message: 'You have successfully subscribed to this plan',
            data: subscribe
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// User subscription
exports.userGoldPlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const shopId = req.params.shopId;

        // Fetch user by ID and populate their orders
        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch user by ID and populate their orders
        const shop = await shopModel.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        const gold = user.subscribed
        const subscribe = await userModel.findByIdAndUpdate(userId, {gold:'gold'}, {new: true});

        if(!subscribe){
            return res.status(403).json({
                error: 'Unable to subscribe for this plan'
            })
        }
        res.status(201).json({
            message: 'You have successfully subscribed to this plan',
            data: subscribe
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
