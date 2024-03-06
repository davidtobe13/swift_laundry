const orderModel = require('../models/orderModel');
const itemsModel = require('../models/itemsModel');
const mainOrderModel = require('../models/mainOrderModel');
const userModel = require('../models/userModel');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { itemId, quantity} = req.body;

       
            const item = await itemsModel.findById(itemId);
            
           const  totalAmount = item.Price * quantity;
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


// exports.createOrder = async (req, res) => {
//     try {
//         const {userId}  = req.user
//         const user = await userModel.findById(userId)
//         if(!user){
//             return res.status(404).json({
//                 error: 'User not found'
//             })
//         }
//         const { itemId, quantity} = req.body;

//         // Fetch the item from the database
//         const item = await itemsModel.findById(itemId);
//         if (!item) {
//             return res.status(404).json({ error: 'Item not found' });
//         }

//         // Calculate the total amount for the order
//         const totalAmount = item.Price * quantity;

//         // Create the order
//         const order = new orderModel({
//             itemId: itemId,
//             total: totalAmount,
//             quantity
//         });

//         // Save the order to the database
//         const savedOrder = await order.save();

//         // Find or create the main order
//         let mainorder = await mainOrderModel.findOne();
//         if (!mainorder) {
//             mainorder = new mainOrderModel();
//         }

//         // Push the order to the main order's array
//         mainorder.order.push(order._id);
//         mainorder.total += totalAmount;

//         // Save the main order to the database
//         await mainorder.save();

//         res.status(201).json({
//             message:'Order created successfully',
//             data:savedOrder
//         });
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };




exports.deleteOrder = async (req, res) => {
    try {
        const {userId} = req.userId
        const id = req.params.id;

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).send({
                error: `User not found`
            })
        }

        // Find and delete the order by ID
        const deletedOrder = await orderModel.findByIdAndDelete(id);

        // Check if the order exists and was successfully deleted
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
