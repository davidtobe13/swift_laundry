const orderModel = require('../models/orderModel');
const itemsModel = require('../models/itemsModel');
const mainOrderModel = require('../models/mainOderModel');
// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { itemId, quantity} = req.body;

       
            const item = await itemsModel.findById(itemId);
            if (item) {
                totalAmount += item.Price * quantity;
            }
             // Create the order
        const order = new orderModel({
            itemId: itemId,
            total: totalAmount,
            quantity
        });
        const mainorder = await mainOrderModel();

        mainorder.order.push(order._id)
        order.item = item._id

        await order.save()
        await mainorder.save()
           // Save the order to the database
           const savedOrder = await order.save();
        
           res.status(201).json({
               message:'Order created successfully',
               data:savedOrder
           });
        }catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};