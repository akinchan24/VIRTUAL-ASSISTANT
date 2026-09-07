import express from "express"
import { askToAssistant, clearHistory, getCurrentUser, updateAssistant } from "../controllers/user.controllers.js"
import isAuth, { optionalAuth } from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"
import assistantRateLimit from "../middlewares/rateLimit.js"

const userRouter=express.Router()

userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant)
userRouter.delete("/history",isAuth,clearHistory)
userRouter.post("/asktoassistant",assistantRateLimit,optionalAuth,askToAssistant)

export default userRouter