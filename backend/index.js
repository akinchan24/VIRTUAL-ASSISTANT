import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"


const app=express()
const allowedOrigins="https://virtual-assistant-jxwt.onrender.com"
app.use(cors({
    origin:(origin, callback)=>{
        if(!origin){
            callback(null, true)
            return
        }

        const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
        if(allowedOrigins.includes(origin) || isLocalDevOrigin){
            callback(null, true)
            return
        }

        callback(new Error("Not allowed by CORS"))
    },
    credentials:true
}))
const port=process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)


const startServer = async ()=>{
    try {
        await connectDb()
        app.listen(port,()=>{
            console.log(`server started on port ${port}`)
        })
    } catch {
        process.exitCode = 1
    }
}

startServer()

