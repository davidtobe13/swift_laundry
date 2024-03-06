const mongoose = require("mongoose")
const {DateTime} = require('luxon')

const createdOn = DateTime.now().toLocaleString({weekday:"short",month:"short",day:"2-digit", year:"numeric", hour:"2-digit",minute:"2-digit"})

const mainOrderSchema = new mongoose.Schema({
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user"
    },
    cart:[{
        item:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "item"
    },
    quantity: {
        type: Number,
        default: 1
    },
    total:{
        type: Number,
        default: 0
    }
    }],  
    grandTotal:{
        type:Number,
        default:0
    },     
    status:{
        type:String,
        enum:['pending', 'completed'],
        default:"pending"
    },  
    deliveryAddress: {
        type:String,
    },
    deliveryDateTime: {
        type:Date,
    },
    pickupAddress: {
        type:String,
    },
    pickupDateTime: {
        type:Date,
    },
    shop:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "shop"
    },
    date:{
        type:String,
        default:createdOn
    }
});

const mainOrderModel = mongoose.model("mainorder", mainOrderSchema)

module.exports = mainOrderModel
