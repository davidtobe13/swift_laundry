const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    items:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "item"
    }],
    total:{
        type:Number,
        default:0
    },
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user"
    },       
})

const orderModel = mongoose.model("order", orderSchema)

module.exports = orderModel