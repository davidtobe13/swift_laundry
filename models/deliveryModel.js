const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    orders: {
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
    }
});

const deliveryModel = mongoose.model("delivery", deliverySchema);

module.exports = deliveryModel;
