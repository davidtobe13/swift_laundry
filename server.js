const express = require("express")
require("./config/config")
const cors = require("cors")
const userRouter = require("./routers/userRouter")
const shopRouter = require("./routers/shopRouter")


// create an app instance of express
const app = express()
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(shopRouter)

// check if the server is connected
app.listen(process.env.PORT,()=>{
    console.log(`server on port: ${process.env.PORT}`);
})