const mainOrderModel = require('../models/mainOrderModel');
const shopModel = require('../models/shopModel');
const userModel = require('../models/userModel');

// Create a new order
exports.createUserOrder = async (req, res) => {
    try {
        const {userId} = req.user
        const shopId = req.params.shopId
        const user = await userModel.findById(userId)

        if(!user){
            return res.status(404).json({
                error: 'User not found'
            })
        }
        const shop = await shopModel.findById(shopId)
        if(!shop){
            return res.status(404).json({
                error: `User not found`
            })
        }

        const {
                cart,
                status,
                deliveryAddress,
                deliveryDateTime,
                pickupAddress,
                pickupDateTime,
                } = req.body;

            const cartItems = await mainOrderModel.find({ cart: cart._id }).populate('item');

            // Then, calculate the totals for each item in the cart
            const cartWithTotals = cartItems.map(cartItem => ({
                item: cartItem.item._id,
                quantity: cartItem.quantity,
                total: cartItem.item.Price * cartItem.quantity
            }));

            const grandTotal = cartWithTotals.reduce((acc, curr) => acc + curr.total, 0);


        // Create a new instance of mainOrderModel
        const mainOrder = new mainOrderModel({
            cart: cartWithTotals,
            grandTotal,
            status,
            deliveryAddress,
            deliveryDateTime,
            pickupAddress,
            pickupDateTime,
        });

        mainOrder.user = user._id
        shop.users.push(user._id)
        user.orders.push(mainOrder)

        await shop.save()
        await user.save()
        

        const savedMainOrder = await mainOrder.save();

        res.status(201).json({
            message: 'Main order created successfully',
            data: savedMainOrder
        });
    } catch (error) {
        console.error('Error creating main order:', error);
        res.status(500).json({ error:'Internal server error' });
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
