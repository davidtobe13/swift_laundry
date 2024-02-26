const mongoose = require("mongoose")
const {DateTime} = require("luxon")
const createdOn = DateTime.now().toLocaleString({weekday:"short", month:"short", day: "2-digit", year: "numeric", hour:"2-digit", minute:"2-digit"})

const notificationSchema = new mongoose.Schema({
    message:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: createdOn
    }
})


const notificationModel = mongoose.model("notifications", notificationSchema)

module.exports = notificationModel