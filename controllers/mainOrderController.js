const cartModel = require('../models/cartModel');
const mainOrderModel = require('../models/mainOrderModel');
const shopModel = require('../models/shopModel');
// const shopModel = require('../models/shopModel');
const userModel = require('../models/userModel');
// const itemsModel = require('../models/itemsModel')



exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await userModel.findById(userId)

        if(!user){
            return res.status(404).json({
                error: `User not found`
            })
        }
        const cart = await cartModel.findOne({ user: userId }).populate('cart.item');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json({
            message: `Cart Items fetched`,
            data: cart.cart,
            grandTotal:cart.grandTotal
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// exports.createUserOrder = async (req, res) => {
//     try {
//         const { userId } = req.user;
        
//         const shopId = req.params.shopId;

//         const user = await userModel.findById(userId)
//         if(!user){
//             return res.status(404).json({
//                 error: `User not found`
//             })
//         }
//         const shop = await shopModel.findById(shopId)
//         if(!shop){
//             return res.status(404).json({
//                 error: `Shop not found`
//             })
//         }
//         const cart = await cartModel.findOne({ user: userId });
//         if (!cart) {
//             return res.status(404).json({ message: 'Cart not found' });
//         }
//         // Create an order based on the cart contents
//         const order = new mainOrderModel({
//             user: cart.user,
//             item: cart.cart.map(cartItem => cartItem.item),
//             grandTotal: cart.grandTotal,
//             deliveryAddress: cart.deliveryAddress,
//             deliveryDateTime: cart.deliveryDateTime,
//             pickupAddress: cart.pickupAddress,
//             pickupDateTime: cart.pickupDateTime,
//         });
//         await order.save();
//         user.orders.push(order._id)
//         order.shop = shopId

//         await user.save()
//         await shop.save()


//         // Clear the cart after checkout
//         cart.cart = [];
//         await cart.save();
//         res.status(200).json({ 
//             message: 'Checkout successful',
//             data:order
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


exports.createUserOrder = async (req, res) => {
    try {
        const { userId } = req.user;
        const { shopId } = req.params;
        const { 
            deliveryAddress, 
            deliveryDateTime, 
            pickupAddress, 
            pickupDateTime 
        } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: `User not found` });
        }

        const shop = await shopModel.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: `Shop not found` });
        }

        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Create an order based on the cart contents
        const order = new mainOrderModel({
            user: userId,
            item: cart.cart.map(cartItem => cartItem.item),
            grandTotal: cart.grandTotal,
            deliveryAddress,
            deliveryDateTime,
            pickupAddress,
            pickupDateTime,
            shop: shopId,
        });

        await order.save();

        // Update user and shop
        user.orders.push(order._id);
        await user.save();

        // Clear the cart after checkout
        cart.cart = [];
        await cart.save();

        res.status(200).json({ 
            message: 'Checkout successful',
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.getAllMainOrders = async (req, res) =>{
    try{
        const {userId} = req.user
        const id = req.params.id
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                error: `User not found`
            })
        }
        const mainOrder = await mainOrderModel.findById(id)
        if(!mainOrder){
            return res.status(404).json({
                error: `Order not found`
            })
        }
        res.status(200).json({
            message: `Orders found`,
            data: mainOrder
        })
    }catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
}


exports.getAddedOrder = async (req, res) =>{
    try{
        const {userId} = req.user
        const id = req.params.id

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                error: `User not found`
            })
        }

        const addedOrders = await mainOrderModel.findById(id)
        if(!addedOrders){
            return res.status(404).json({
                error: `Order not found`
            })
        }
        res.status(200).json({
            message: `Users fetched successfully`,
            data: addedOrders
        })

    }catch(error){
        res.status(500).json({
            error: `Internal server error: ${error.message}`
        })
    }
}