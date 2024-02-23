const mongoose = require("mongoose")

const shopSchema = new mongoose.Schema({
    businessName:{
        type:String,
        required:true
    },
    address:{
        type:String,
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
    features:{
        type:Array,
        default:[]
    },
    subscribed:{
        type:String,
        default:null,
        enum: ['silver', 'gold']
    },
    profileImage:{
        type:String,
    },
    users:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user"
    }],       
    blackList:{
        type:Array,
        default:[]
    }
})

const shopModel = mongoose.model("shop",shopSchema)

module.exports = shopModel