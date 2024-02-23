const mongoose = require("mongoose")

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
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user"
    },
    shop:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "shop"
    },
})

const mainOrderModel = mongoose.model("mainorder", mainOrderSchema)

module.exports = mainOrderModel