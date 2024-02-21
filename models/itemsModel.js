const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema({
    
    item:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        default: 0
    }
})

const itemModel = mongoose.model("item",itemSchema)

module.exports = itemModel