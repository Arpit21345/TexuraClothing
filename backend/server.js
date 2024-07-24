import express, { application } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";




//app config

const app = express()
const port = 4000


//dbconnection

connectDB();

app.use(express.json())
app.use(cors())


//api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))

//middleware



app.get("/",(req,res)=>{
    res.send("api working")
})
app.listen(port,()=>{
    console.log(`server started on  http://localhost:${port}`)
})