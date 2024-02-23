const mongoose = require("mongoose")

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
    blackList:{
        type:Array,
        default:[]
    }
})

const subscriptionModel = mongoose.model("subscription",subscriptionSchema)

module.exports = subscriptionModel