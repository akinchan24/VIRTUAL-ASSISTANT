import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signUp=async (req,res)=>{
try {
    const name=typeof req.body.name === "string" ? req.body.name.trim() : ""
    const email=typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const password=typeof req.body.password === "string" ? req.body.password : ""

    if(!name || !email || !password){
        return res.status(400).json({message:"name, email, and password are required"})
    }

    const existEmail=await User.findOne({email})
    if(existEmail){
        return res.status(400).json({message:"email already exists !"})
    }
    if(password.length<6){
        return res.status(400).json({message:"password must be at least 6 characters !"})
    }

    const hashedPassword=await bcrypt.hash(password,10)

    const user=await User.create({
        name,password:hashedPassword,email
    })

    const token=await genToken(user._id)

    res.cookie("token",token,{
        httpOnly:true,
       maxAge:7*24*60*60*1000,
       sameSite:"strict",
       secure:process.env.NODE_ENV === "production",
       path:"/"
    })

    const userResponse = user.toObject()
    delete userResponse.password
    return res.status(201).json(userResponse)

} catch (error) {
       return res.status(500).json({message:`sign up error ${error}`})
}
}

export const Login=async (req,res)=>{
try {
    const email=typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const password=typeof req.body.password === "string" ? req.body.password : ""

    if(!email || !password){
        return res.status(400).json({message:"email and password are required"})
    }

    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"email does not exists !"})
    }
   const isMatch=await bcrypt.compare(password,user.password)

   if(!isMatch){
   return res.status(400).json({message:"incorrect password"})
   }

    const token=await genToken(user._id)

    res.cookie("token",token,{
        httpOnly:true,
       maxAge:7*24*60*60*1000,
       sameSite:"strict",
       secure:process.env.NODE_ENV === "production",
       path:"/"
    })

    const userResponse = user.toObject()
    delete userResponse.password
    return res.status(200).json(userResponse)

} catch (error) {
       return res.status(500).json({message:`login error ${error}`})
}
}

export const logOut=async (req,res)=>{
    try {
        res.clearCookie("token",{path:"/"})
         return res.status(200).json({message:"log out successfully"})
    } catch (error) {
         return res.status(500).json({message:`logout error ${error}`})
    }
}
        
