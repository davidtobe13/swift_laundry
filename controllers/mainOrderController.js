const mainOrderModel = require('../models/mainOrderModel');
const shopModel = require('../models/shopModel');
const userModel = require('../models/userModel');

// Create a new order
exports.createUserOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const shopId = req.params.shopId;

        // Fetch user by ID and populate their orders
        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Fetch shop by ID and populate their orders
        const shop = await shopModel.findById(shopId).populate("orders");
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Calculate total amount for each order in the main order
        let totalAmount = 0;
        for (const order of user.orders) {
            totalAmount += order.total;
        }
        // Create a new main order document
        const newMainOrder = new mainOrderModel({
            order: savedOrder._id, 
            total: totalAmount,
            user: userId
        });
        user.orders.push(newMainOrder._id);
        newMainOrder.user = user._id
        shop.users.push(user._id);

        await user.save();
        await shop.save();

        // Save the new main order
        await newMainOrder.save();

        res.status(201).json({
            message: 'Order created successfully',
            data: savedOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
