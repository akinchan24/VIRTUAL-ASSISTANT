import multer from "multer"
import crypto from "crypto"

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public")
    },
    filename:(req,file,cb)=>{
        const extension = file.originalname.includes(".")
            ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
            : ""
        cb(null,`${crypto.randomUUID()}${extension}`)
    }
})

const upload=multer({
    storage,
    limits:{fileSize:5 * 1024 * 1024, files:1},
    fileFilter:(req,file,cb)=>{
        if (!file.mimetype.startsWith("image/")) {
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "assistantImage"))
        }
        return cb(null,true)
    }
})
export default upload