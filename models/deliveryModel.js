const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "mainorder",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rescheduled'],
        default: 'pending'
    }
});

const deliveryModel = mongoose.model("delivery", deliverySchema);

module.exports = deliveryModel;
