const mongoose = require("mongoose")
const {DateTime} = require('luxon')

const createdOn = DateTime.now().toLocaleString({weekday:"short",month:"short",day:"2-digit", year:"numeric", hour:"2-digit",minute:"2-digit"})

const subscriptionSchema = new mongoose.Schema({
    plan:{
        type:String,
        default:null,
        enum: ['silver', 'gold']
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
    },
    price:{
        type:Number,
        default:0
    }
})

const subscriptionModel = mongoose.model("subscription",subscriptionSchema)

module.exports = subscriptionModel