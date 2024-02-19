const mongoose = require("mongoose")

const shopSchema = new mongoose.Schema({
    businessName:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },          
    isVerified:{
        type:Boolean,
        default:false
    },          
    isAdmin:{
        type:Boolean,
        default:true
    },          
    blackList:{
        type:Array,
        default:[]
    }
})

const shopModel = mongoose.model("shop",shopSchema)

module.exports = shopModel