const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
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
        required: true
    },
    total:{
        type: Number,
        default: 0
    }
    }],
    grandTotal:{
        type: Number,
        default: 0
    }  
        
});

const cartModel = mongoose.model("cart", cartSchema)

module.exports = cartModel
