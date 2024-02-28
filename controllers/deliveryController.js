const deliveryModel = require('../models/deliveryModel');
const userModel = require('../models/userModel');

// exports.acceptDelivery = async (req, res) => {
//     try {
//         const orderId = req.params.orderId;
//         const userId = req.user.userId;

//         const user = await userModel.findById(userId).populate("orders");
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         const  deliveryDateTime  = 

//         // Find delivery by ID
//         const delivery = await deliveryModel.findById(orderId);
//         if (!delivery) {
//             return res.status(404).json({ error: 'Delivery not found' });
//         }

//         // Update delivery status to "accepted"
//         delivery.status = 'accepted';

//         if (deliveryDateTime) {
//             delivery.deliveryDateTime = new Date(deliveryDateTime);
//         }

//         await delivery.save();

//         res.status(200).json({ message: 'Delivery accepted' });
//     } catch (error) {
//         console.error('Error accepting delivery:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

exports.acceptDelivery = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const {userId} = req.user;

        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the single order from the populated orders
        const order = user.orders;
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Find delivery by ID
        const delivery = await deliveryModel.findById(orderId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // Extract deliveryDateTime from the single order
        const deliveryDateTime = order.deliveryDateTime;

        // Update delivery status to "accepted"
        delivery.status = 'accepted';

        if (deliveryDateTime) {
            delivery.deliveryDateTime = new Date(deliveryDateTime);
        }

        await delivery.save();

        res.status(200).json({ message: 'Delivery accepted' });
    } catch (error) {
        console.error('Error accepting delivery:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.rescheduleDelivery = async (req, res) => {
    try {
        const deliveryId = req.params.deliveryId;
        const {userId} = req.user;

        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find delivery by ID
        const delivery = await deliveryModel.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // Extract deliveryDateTime from the request body
        const { deliveryDateTime } = req.body;

        // If deliveryDateTime is provided, update the delivery
        if (deliveryDateTime) {
            delivery.deliveryDateTime = new Date(deliveryDateTime);
        }

        await delivery.save();

        res.status(200).json({ message: 'Delivery rescheduled' });
    } catch (error) {
        console.error('Error rescheduling delivery:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
