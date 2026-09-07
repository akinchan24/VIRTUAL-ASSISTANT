import jwt from "jsonwebtoken"

const isAuth=async (req,res,next)=>{
    try {
        const token=req.cookies.token
        if(!token){
            return res.status(401).json({message:"authentication required"})
        }
        const verifyToken=await jwt.verify(token,process.env.JWT_SECRET)
        req.userId=verifyToken.userId

        next()

    } catch (error) {
        res.clearCookie("token", {path:"/"})
        return res.status(401).json({message:"invalid or expired token"})
    }
}

export const optionalAuth=async (req,res,next)=>{
    try {
        const token=req.cookies.token
        if(!token){
            req.userId=null
            return next()
        }

        const verifyToken=await jwt.verify(token,process.env.JWT_SECRET)
        req.userId=verifyToken.userId
        return next()
    } catch (error) {
        req.userId=null
        return next()
    }
}

export default isAuth