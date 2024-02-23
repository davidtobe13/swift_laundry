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

exports.verifyShop = async (req,res)=>{
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

exports.signOutShop = async(req,res)=>{
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

    
exports.updateShop = async (req, res) => {
        const userId = req.user.userId;
        const {
            businessName,
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
            businessName,
            phoneNumber,
            address,
        };
    
        // Add profileImage to updateObject if it exists
        if (profileImage) {
            updateObject.profileImage = profileImage;
        }
    
        try {
            // Update the user document in the database
            const updatedShop = await shopModel.findByIdAndUpdate(userId, updateObject, { new: true });
    
            if (!updatedShop) {
                return res.status(404).json({
                    error: `Shop with not found`
                });
            }
    
            res.status(200).json({
                message: 'Successfully updated your profile',
                data: updatedShop
            });
        } catch (error) {
            console.error('Error updating shop:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    };
    

    
    exports.getShopOrders = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        
        // Find the shop by its ID
        const shop = await shopModel.findById(shopId).populate('users');

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Initialize an array to store all orders in the shop
        const shopOrders = [];

        // Iterate through each user in the shop
        for (const user of shop.users) {
            // Push each user's orders to the shopOrders array
            shopOrders.push(...user.orders);
        }

        res.status(200).json({
            message: `List of orders made in the shop`,
            data: shopOrders
        });
    } catch (error) {
        console.error('Error getting shop orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getShopPendingOrders = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        
        // Find the shop by its ID
        const shop = await shopModel.findById(shopId).populate('users');

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Initialize an array to store pending orders in the shop
        const pendingOrders = [];

        // Iterate through each user in the shop
        for (const user of shop.users) {
            // Filter each user's orders to include only pending orders
            const userPendingOrders = user.orders.filter(order => order.status === 'pending');
            // Push filtered pending orders to the pendingOrders array
            pendingOrders.push(...userPendingOrders);
        }

        if(pendingOrders.length === 0) {
            return res.status(403).json({
                error: `You do not have any pending order`
            })
        }

        res.status(200).json({
            message: `You have ${pendingOrders.length} pending orders made in the shop`,
            data: pendingOrders
        });
    } catch (error) {
        console.error('Error getting shop pending orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getShopCompletedOrders = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        
        // Find the shop by its ID
        const shop = await shopModel.findById(shopId).populate('users');

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Initialize an array to store pending orders in the shop
        const completedOrders = [];

        // Iterate through each user in the shop
        for (const user of shop.users) {
            // Filter each user's orders to include only completed orders
            const userCompletedOrders = user.orders.filter(order => order.status === 'completed');
            // Push filtered completed orders to the completedOrders array
            completedOrders.push(...userCompletedOrders);
        }
        if(completedOrders.length === 0) {
            return res.status(403).json({
                error: `You do not have any completed order`
            })
        }

        res.status(200).json({
            message: `You have ${completedOrders.length} completed orders made in the shop`,
            data: completedOrders
        });
    } catch (error) {
        console.error('Error getting shop completed orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

   
// Get One User
exports.getOneUser = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        const userId = req.params.userId;

        // Fetch shop by ID to ensure it exists
        const shop = await shopModel.findById(shopId).populate('users');
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Find the user within the shop's users array
        const user = shop.users.find(user => user._id.toString() === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found in this shop' });
        }

        res.status(200).json({
            message: 'User fetched successfully',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const shopId = req.params.shopId;

        // Fetch shop by ID to ensure it exists
        const shop = await shopModel.findById(shopId).populate('users');
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        res.status(200).json({
            message: 'All users fetched successfully',
            data: shop.users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// User subscription
exports.shopSilverPlan = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Fetch user by ID and populate their orders
        const shop = await shopModel.findById(userId);
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
exports.shopGoldPlan = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch user by ID and populate their orders
        const shop = await shopModel.findById(userId);
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


exports.updateOrderStatusToCompleted = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        const orderId = req.params.orderId;

        // Find the shop by its ID
        const shop = await shopModel.findById(shopId).populate('users');
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Iterate through each user in the shop
        for (const user of shop.users) {
            // Find the order within the user's orders
            const orderIndex = user.orders.findIndex(order => order._id.toString() === orderId);
            if (orderIndex !== -1) {
                // Update the status of the order to "completed"
                user.orders[orderIndex].status = 'completed';
                // Save the changes to the user
                await user.save();
                return res.status(200).json({ message: 'Order status updated to completed' });
            }
        }

        // If the order is not found in any user's orders
        return res.status(404).json({ error: 'Order not found in any user\'s orders' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


