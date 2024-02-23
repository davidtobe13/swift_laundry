const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "mainorder"
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rescheduled'],
        default: 'pending'
    },
    deliveryDateTime: {
        type: Date,
        default: Date.now // Default to current date and time
    }
});

const deliveryModel = mongoose.model("delivery", deliverySchema);

module.exports = deliveryModel;
