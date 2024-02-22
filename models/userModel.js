const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
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
    address:{
        type:String,
    },
    subscribed:{
        type:String,
        required:null
    },       
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
    },       
    orders:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "order"
    }],         
    blackList:{
        type:Array,
        default:[]
    }
})

const userModel = mongoose.model("user",userSchema)

module.exports = userModel