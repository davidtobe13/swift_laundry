const userModel = require("../models/userModel")
require("dotenv").config()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { resetFunc } = require("../helpers/resetHTML")
const mainOrderModel = require("../models/mainOrderModel")
const dynamicHtml = require("../helpers/html")
const { sendEmail } = require("../helpers/email")
const port = process.env.PORT 
const cloudinary = require('../utils/cloudinary')
const shopModel = require("../models/shopModel")
const subscriptionModel = require("../models/subscriptionModel")
const axios = require('axios');

// Radius of the Earth in kilometers
const EARTH_RADIUS_KM = 6371;
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY


// Register user function
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
        // generate a token for the user 
        const token = jwt.sign({
            userId:newUser._id,
            email:newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName 
        },process.env.JWT_KEY,{expiresIn:"6000s"})

        // send verification email to the user
            const name = `${newUser.firstName.toUpperCase()} . ${newUser.lastName.slice(0,1).toUpperCase()}`
            const link = `${req.protocol}://${req.get('host')}/verify-user/${newUser.id}/${token}`
            const html = dynamicHtml(link, name)
            sendEmail({
            email:newUser.email,
            subject:"Click on the button below to verify your email", 
            html
            })
        // throw a failure message
        if(!newUser){
            return res.status(400).json({
                error:"error creating your account"
            })
        }
        // success message
        res.status(200).json({
            message:`HELLO, ${newUser.firstName.toUpperCase()} ${newUser.lastName.slice(0,1).toUpperCase()} YOUR ACCOUNT HAS BEEN CREATED SUCCESSFULLY`,
            data: newUser 
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}


exports.getOneUser = async (req, res) =>{
    try{
        const userId = req.user.userId
        console.log(userId)
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).send({
                error: `User not found`
            })
        }

        res.status(200).json({
            message: `User found ${user.firstName}`,
            data: user
        })

    }catch(error){
        res.status(500).json({
            error: `Internal server error: ${error.message}`
        })
    }
}


exports.verifyUser = async (req,res)=>{
    try{
       
          const  id = req.params.id
          const token = req.params.token
          
          await jwt.verify(token, process.env.JWT_KEY )

       const updatedUser = await userModel.findByIdAndUpdate(id, {isVerified: true}, {new: true})
       res.redirect ("https://swiftlaundry-app-beta.vercel.app/verifyEmail")

   
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
        // check if the user is existing on the platform
        const userExist = await userModel.findOne({email:email.toLowerCase()})
        if(!userExist){
            return res.status(404).json({
                error:"email does not exist"
            })
        }
        
        //check if the user is verified
        // if(userExist.isVerified === false){
        //     return res.status(403).json({
        //         error: `user is not verified. Click to enter email and resend verification message`
        //     })
        // }
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



//resend verification message
exports.reverifyUser = async (req, res) =>{
    try{
        const {email} = req.body
        const newUser = await userModel.findOne({email})
        if(!newUser){
            return res.status(404).json({
                error: `Shop with email: ${newUser.email} does not exists`
            })
        }       
         // generate a token for the user 
         const token = jwt.sign({
            userId:newUser._id,
            email:newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName 
        },process.env.JWT_KEY,{expiresIn:"6000s"})

        // send verification email to the user
            const name = `${newUser.firstName.toUpperCase()} . ${newUser.lastName.slice(0,1).toUpperCase()}`
            const link = `${req.protocol}://${req.get('host')}/verify-user/${newUser.id}/${token}`
            const html = dynamicHtml(link, name)
            sendEmail({
            email:newUser.email,
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
        const userId = req.user.userId
        // find the user
        const user = await userModel.findById(userId)
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
            const name = checkUser.firstName + ' ' + checkUser.lastName
            const subject = 'Kindly reset your password'
            const link = `http://localhost:${port}/user-reset/${checkUser.id}`
            const html = resetFunc(name, link)
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

    exports.updateUser = async (req, res) => {
        try{
        const {userId} = req.user
        // const id = req.params.id
        console.log(userId)
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
    
            // Update the user document in the database
            const updatedUser = await userModel.findByIdAndUpdate(userId, updateObject, { new: true });
    
            if (!updatedUser) {
                return res.status(404).json({
                    error: `User with id not found`
                });
            }
    
            res.status(200).json({
                message: 'Successfully updated your profile',
                user: updatedUser
            });
        
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                error: `'Internal server error: ${error.message} `
            });
        }
    }


    exports.updateAddress = async (req, res) =>{
        try{
            const {userId} = req.user
            const {address} = req.body

            const user = await userModel.findById(userId)
            if(!user){
                return res.status(404).json({
                    error: `User not found`
                })
            }
            const myAddress = user.address
            const newAddress = await userModel.findByIdAndUpdate(user, {myAddress:address}, {new:true})

            if(!newAddress){
                return res.status(403).json({
                    error: `Add an address`
                })
            }
            res.status(200).json({
                message: 'Address added sucessfully',
                data: newAddress
            })


        }catch(error){
            res.status(500).json({
                error: `Internal server error: ${error.message}`
            })
        }
    }


    // get all orders made by a user
    exports.getAllOrders = async (req, res) =>{
        try{ 
            // Find user by ID
            const {userId} = req.user;
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


    // get all pending orders made by the user
    exports.getAllPendingOrders = async (req, res) => {
        try {
            // Find user by ID
            const {userId} = req.user;
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
    

    // get all completed orders
    exports.getAllCompletedOrders = async (req, res) => {
        try {
            // Find user by ID
            const {userId} = req.user;
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


    // get one order made by the user
exports.getOneOrder = async(req, res) =>{
    try{
        const {userId} = req.user
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
        const {userId} = req.user;
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



// get all shops in order of distance from the users address
exports.getAllShop = async (req, res) => {
    try {
        const { userId } = req.user;

        // Fetch user by ID and populate their orders
        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch all shops from the database
        const shops = await shopModel.find();
        if (!shops || shops.length === 0) {
            return res.status(404).json({ error: 'Shops not found' });
        }

        // Convert user's address to coordinates
        const userCoordinates = await convertAddressToCoordinates(user.address);
        if (!userCoordinates) {
            // Request user to turn on device location
            return res.status(400).json({ error: 'Please turn on your device location' });
        }

        // let userCoordinates;
        // // Check if user's location is available
        // if (req.user.location) {
        //     userCoordinates = req.user.location;
        // } else {
        //     // Convert user's address to coordinates
        //     userCoordinates = await convertAddressToCoordinates(user.address);
        //     if (!userCoordinates) {
        //         // Request user to turn on device location
        //         return res.status(400).json({ error: 'Please turn on your device location' });
        //     }
        // }
        // Convert shop addresses to coordinates and calculate distances
        const shopsWithDistances = [];
        for (const shop of shops) {
            const shopCoordinates = await convertAddressToCoordinates(shop.address);
            if (shopCoordinates) {
                const distance = calculateDistance(userCoordinates, shopCoordinates);
                const distanceMessage = `${distance.toFixed(2)} km away`;
                shopsWithDistances.push({ shop: { ...shop.toObject(), distance: distanceMessage }, distance });
            }
        }

        // Sort shops by distance (from nearest to farthest)
        shopsWithDistances.sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            message: `Found ${shopsWithDistances.length} shops around you`,
            data: shopsWithDistances.map(({ shop }) => shop)
        });
    } catch (error) {
        console.error('Error fetching shops:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to convert address to coordinates using OpenCage Geocoding API
const convertAddressToCoordinates = async (address) => {
    try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                q: address,
                key: OPENCAGE_API_KEY
            }
        });
        const { results } = response.data;
        if (results.length > 0) {
            const { lat, lng } = results[0].geometry;
            return { lat, lng };
        }
        return null;
    } catch (error) {
        console.error('Error converting address to coordinates:', error);
        return null;
    }
};

// Function to calculate distance between two sets of coordinates using Haversine formula
const calculateDistance = (coord1, coord2) => {
    const { lat: lat1, lng: lon1 } = coord1;
    const { lat: lat2, lng: lon2 } = coord2;

    // Convert latitude and longitude from degrees to radians
    const radLat1 = toRadians(lat1);
    const radLon1 = toRadians(lon1);
    const radLat2 = toRadians(lat2);
    const radLon2 = toRadians(lon2);

    // Calculate the change in coordinates
    const deltaLat = radLat2 - radLat1;
    const deltaLon = radLon2 - radLon1;

    // Apply Haversine formula
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_KM * c;

    return distance;
};

// Function to convert degrees to radians
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};





// User silver subscription
exports.userSilverPlan = async (req, res) => {
    try {
        const { userId } = req.user;
        const shopId = req.params.shopId;

        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const myShop = await shopModel.findById(shopId);
        if (!myShop) {
            return res.status(404).json({
                error: 'Shop not found'
            });
        }

        // Find existing subscription or create a new one
        let subscription = await subscriptionModel.findOne({ user: userId, shop: shopId });
        if (!subscription) {
            // Create a new subscription if none exists
            subscription = new subscriptionModel({
                plan: 'silver',
                user: userId,
                shop: shopId,
                price: 22000,
                date: new Date().toLocaleString()
            });
        } else {
            // Calculate expiration date (30 days from the current date)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            // Check if the subscription has expired
            const currentDate = new Date();
            if (subscription.plan === 'silver' && subscription.date && new Date(subscription.date) < currentDate) {
                // Subscription has expired, set plan to null
                subscription.plan = null;
            }

            // Update subscription to silver plan with expiration date
            subscription.plan = 'silver';
            subscription.date = expirationDate;
            subscription.price = 22000;

        }

        // Calculate total order amount from the day of subscription
        const subscriptionDate = new Date(subscription.date);
        let totalOrderAmount = 0;
        for (const order of user.orders) {
            // Consider orders placed after the subscription date
            if (new Date(order.createdAt) >= subscriptionDate) {
                totalOrderAmount += order.total;
            }
        }

        // If the total order amount exceeds or equals the plan price, set plan to null
        if (totalOrderAmount >= subscription.price+2000) {
            subscription.plan = null;
        }

        // push the subscription to the shop and Save the subscription
        myShop.subscribedUsers.push(subscription);
        await myShop.save()
        await subscription.save();

        res.status(200).json({
            message: 'Successfully subscribed to silver plan for the shop',
            data: subscription
        });
    } catch (error) {
        console.error('Error subscribing to silver plan for the shop:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// User gold subscription
exports.userGoldPlan = async (req, res) => {
    try {
        const { userId } = req.user;
        const shopId = req.params.shopId;

        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const myShop = await shopModel.findById(shopId);
        if (!myShop) {
            return res.status(404).json({
                error: 'Shop not found'
            });
        }

        // Find existing subscription or create a new one
        let subscription = await subscriptionModel.findOne({ user: userId, shop: shopId });
        if (!subscription) {
            // Create a new subscription if none exists
            subscription = new subscriptionModel({
                plan: 'gold',
                user: userId,
                shop: shopId,
                price: 40000,
                date: new Date().toLocaleString()
            });
        } else {
            // Calculate expiration date (30 days from the current date)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            // Check if the subscription has expired
            const currentDate = new Date();
            if (subscription.plan === 'gold' && subscription.date && new Date(subscription.date) < currentDate) {
                // Subscription has expired, set plan to null
                subscription.plan = null;
            }

            // Update subscription to gold plan with expiration date
            subscription.plan = 'gold';
            subscription.date = expirationDate;
            subscription.price = 40000;

        }

        // Calculate total order amount from the day of subscription
        const subscriptionDate = new Date(subscription.date);
        let totalOrderAmount = 0;
        for (const order of user.orders) {
            // Consider orders placed after the subscription date
            if (new Date(order.createdAt) >= subscriptionDate) {
                totalOrderAmount += order.total;
            }
        }

        // If the total order amount exceeds or equals the plan price, set plan to null
        if (totalOrderAmount >= subscription.price+3000) {
            subscription.plan = null;
        }

        // push the subscription to the shop and Save the subscription
        myShop.subscribedUsers.push(subscription);
        await myShop.save()
        await subscription.save();

        res.status(200).json({
            message: 'Successfully subscribed to gold plan for the shop',
            data: subscription
        });
    } catch (error) {
        console.error('Error subscribing to gold plan for the shop:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
