const express = require("express")
require("./config/config")
const cors = require("cors")
const userRouter = require("./routers/userRouter")
const shopRouter = require("./routers/shopRouter")
const deliveryRouter = require("./routers/deliveryRouter")
const itemRouter = require("./routers/itemRouter")
const mainOrderRouter = require("./routers/mainOrderRouter")
// const orderRouter = require("./routers/orderRouter")


// create an app instance of express
const app = express()
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(shopRouter)
app.use(deliveryRouter)
app.use(itemRouter)
app.use(mainOrderRouter)
// app.use(orderRouter)
// check if the server is connected
app.listen(process.env.PORT,()=>{
    console.log(`server is connected on port: ${process.env.PORT}`);
})