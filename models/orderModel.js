const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    item:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "item"
    },
    total:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        default:0
    },       
})

const orderModel = mongoose.model("order", orderSchema)

module.exports = orderModel