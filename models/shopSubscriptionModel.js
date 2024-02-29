const mongoose = require("mongoose")
const {DateTime} = require('luxon')

const createdOn = DateTime.now().toLocaleString({weekday:"short",month:"short",day:"2-digit", year:"numeric", hour:"2-digit",minute:"2-digit"})

const shopSubscriptionSchema = new mongoose.Schema({
    plan:{
        type:String,
        default:null,
        enum: ['silver', 'gold']
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

const shopSubscriptionModel = mongoose.model("shopSubscription",shopSubscriptionSchema)

module.exports = shopSubscriptionModel