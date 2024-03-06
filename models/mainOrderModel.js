const mongoose = require("mongoose")
const {DateTime} = require('luxon')

const createdOn = DateTime.now().toLocaleString({weekday:"short",month:"short",day:"2-digit", year:"numeric", hour:"2-digit",minute:"2-digit"})

const mainOrderSchema = new mongoose.Schema({
    order:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "order"
    }],  
    total:{
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
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user"
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
