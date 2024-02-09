const express = require("express")
require("./config/config")
const cors = require("cors")
const userRouter = require("./routers/userRoute")
const transferRouter = require("./routers/transferRoute")
const withdrawRouter = require("./routers/withdrawRoute")
// const taskRouter = require("./routers/taskRouter")
// const subTaskRouter = require("./routers/subTaskRouter")


// create an app instance of express
const app = express()
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(transferRouter)
app.use(withdrawRouter)
// app.use(taskRouter)
// app.use(subTaskRouter)

// check if the server is connected
app.listen(process.env.PORT,()=>{
    console.log(`server on port: ${process.env.PORT}`);
})