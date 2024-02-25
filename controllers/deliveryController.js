const deliveryModel = require('../models/deliveryModel');

exports.acceptDelivery = async (req, res) => {
    try {
        const deliveryId = req.params.deliveryId;
        const userId = req.user.userId;

        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { deliveryDateTime } = req.body;

        // Find delivery by ID
        const delivery = await deliveryModel.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

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
        const userId = req.user.userId;

        const user = await userModel.findById(userId).populate("orders");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { deliveryDateTime } = req.body;

        // Find delivery by ID
        const delivery = await deliveryModel.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        delivery.status = 'rescheduled';

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
