const shopModel = require("../models/shopModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const dynamicHtml = require("../helpers/html")
const { sendEmail } = require("../helpers/email")
const { resetFunc } = require("../helpers/resetHTML")
const cloudinary = require('../utils/cloudinary')
const shopSubscriptionModel = require("../models/shopSubscriptionModel")
const port = process.env.PORT 


// Register shop
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

        // Send email to verify the shop
            const name = businessName
            const link = `${req.protocol}://${req.get('host')}/verify-shop/${newshop.id}/${token}`
            const html = dynamicHtml(link, name)
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

        // success message for the verified shop
        res.status(200).json({
            message:`Welcome, ${newshop.businessName.toUpperCase()}. You have succesfully registered your business.`,
            data: newshop,
            token
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}


// function to verify the shop
exports.verifyShop = async (req,res)=>{
    try{  
          const  id = req.params.id
          const token = req.params.token
          
          await jwt.verify(token, process.env.JWT_KEY )

       const updatedUser = await shopModel.findByIdAndUpdate(id, {isVerified: true}, {new: true})
       res.redirect ("https://www.google.com")
   
       res.status(200).json({
           message:`user with emmail:${updatedUser.email} is now verified`,
       })
    }catch(err){
       res.status(500).json({
           error: err.message
       })
    }
   
   }


   // Sign in shop function
   exports.signInShop = async (req,res)=>{
    try {
        // get the requirement
        const {email,password} = req.body
        // check if the shop is existing on the platform
        const shopExist = await shopModel.findOne({email:email})
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

        //check if the registered shop is verified
        if(shopExist.isVerified === false){
            return res.status(403).json({
                error: "user is not verified. Click to enter email and resend verification message"
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


//resend verification message
exports.reverify = async (req, res) =>{
    try{
        const {email} = req.body
        const emailExist = await shopModel.findOne({email})
        if(!emailExist){
            return res.status(404).json({
                error: `Shop with email: ${emailExist.email} does not exists`
            })
        }       
        // generate a token for the shop 
        const token = jwt.sign({
            userId:emailExist._id,
            email:emailExist.email,
            businessName: emailExist.businessName
        },process.env.JWT_KEY,{expiresIn:"5mins"})

        // Send email to verify the shop
            const name = businessName
            const link = `${req.protocol}://${req.get('host')}/verify-shop/${emailExist.id}/${token}`
            const html = dynamicHtml(link, name)
            sendEmail({
            email:emailExist.email,
            subject:"Click on the button below to verify your email", 
            html
            })
    }
    catch(error){
        res.status(500).json({
            error: `Internal error message: ${error.message}`
        })
    }
}

// Shp sign out function
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
        const checkShop = await shopModel.findOne({ email: req.body.email.toLowerCase() });
        if (!checkShop) {
            return res.status(404).json({
                message: 'Email does not exist'
            });
        }
        else {
            const name = checkShop.businessName
            const subject = 'Password reset'
            const link = `${req.protocol}://${req.get('host')}/shop-reset/${checkShop.id}`
            const html = resetFunc(name, link)
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


// shop update function
    exports.updateShop = async (req, res) => {
        try{
        const {userId} = req.user
        // const id = req.params.id
        console.log(userId)
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
    
            // Update the user document in the database
            const updatedShop = await shopModel.findByIdAndUpdate(userId, updateObject, { new: true });
    
            if (!updatedShop) {
                return res.status(404).json({
                    error: `Shop not found`
                });
            }
    
            res.status(200).json({
                message: 'Successfully updated your profile',
                user: updatedShop
            });
        
        } catch (error) {
            console.error('Error updating shop:', error);
            res.status(500).json({
                error: `'Internal server error: ${error.message} `
            });
        }
    }
    

    // get all shop orders
    exports.getShopOrders = async (req, res) => {
    try {
        const {userId} = req.user;
        
        // Find the shop by its ID
        const shop = await shopModel.findById(userId).populate('users');

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


// get all shop pending orders
exports.getShopPendingOrders = async (req, res) => {
    try {
        const {userId} = req.user;
        
        // Find the shop by its ID
        const shop = await shopModel.findById(userId).populate('users');

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


// get all shop completed orders
exports.getShopCompletedOrders = async (req, res) => {
    try {
        const {userId} = req.user;
        
        // Find the shop by its ID
        const shop = await shopModel.findById(userId).populate('users');

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

   
// Get One User under the shop
exports.getOneUser = async (req, res) => {
    try {
        const {userId} = req.user;
        const id = req.params.id;

        // Fetch shop by ID to ensure it exists
        const shop = await shopModel.findById(userId).populate('users');
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Find the user within the shop's users array
        const user = shop.users.find(user => user._id.toString() === id);
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


// Get all users under a shop
exports.getAllUsers = async (req, res) => {
    try {
        const {userId} = req.user;

        // Fetch shop by ID to ensure it exists
        const shop = await shopModel.findById(userId).populate('users');
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



// Subscribe gold plan for shop
exports.shopGoldPlan = async (req, res) => {
    try {
        const { userId } = req.user;

        const myShop = await shopModel.findById(userId);
        if(!myShop){
            return res.status(404).json({
                error: 'Shop not found'
            });
        }

        // Find existing shop subscription or create a new one
        let shopSubscription = await shopSubscriptionModel.findOne({ shop: userId });
        if (!shopSubscription) {
            // Create a new shop subscription if none exists
            shopSubscription = new shopSubscriptionModel({
                plan: 'gold',
                shop: myShop._id,
                price: 200000
            });
        } else {
            // Calculate expiration date (364 days from the current date)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 363);

            // Check if the subscription has expired
            const currentDate = new Date();
            if (shopSubscription.plan === 'gold' && shopSubscription.date && new Date(shopSubscription.date) < currentDate) {
                // Subscription has expired, set plan to null
                shopSubscription.plan = null;
            }

            // Update shop subscription to gold plan with expiration date
            shopSubscription.plan = 'gold';
            shopSubscription.date = expirationDate;
            shopSubscription.price = 200000;

        }

        // Save the shop subscription
        await shopSubscription.save();

        res.status(200).json({
            message: 'Successfully subscribed to gold plan',
            data: shopSubscription
        });
    } catch (error) {
        console.error('Error subscribing to gold plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// Subscribe silver plan for shop
exports.shopSilverPlan = async (req, res) => {
    try {
        const { userId } = req.user;

        const myShop = await shopModel.findById(userId);
        if(!myShop){
            return res.status(404).json({
                error: 'Shop not found'
            });
        }

        // Find existing shop subscription or create a new one
        let shopSubscription = await shopSubscriptionModel.findOne({ shop: userId });
        if (!shopSubscription) {
            // Create a new shop subscription if none exists
            shopSubscription = new shopSubscriptionModel({
                plan: 'silver',
                shop: myShop._id,
                price: 20000
            });
        } else {
            // Calculate expiration date (364 days from the current date)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            // Check if the subscription has expired
            const currentDate = new Date();
            if (shopSubscription.plan === 'silver' && shopSubscription.date && new Date(shopSubscription.date) < currentDate) {
                // Subscription has expired, set plan to null
                shopSubscription.plan = null;
            }

            // Update shop subscription to silver plan with expiration date
            shopSubscription.plan = 'silver';
            shopSubscription.date = expirationDate;
            shopSubscription.price = 20000;

        }

        // Save the shop subscription
        await shopSubscription.save();

        res.status(200).json({
            message: 'Successfully subscribed to silver plan',
            data: shopSubscription
        });
    } catch (error) {
        console.error('Error subscribing to silver plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// update user order to completed
exports.updateOrderStatusToCompleted = async (req, res) => {
    try {
        const {userId} = req.userId;
        const orderId = req.params.orderId;

        // Find the shop by its ID
        const shop = await shopModel.findById(userId).populate('users');
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


