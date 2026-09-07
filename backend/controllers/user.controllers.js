 import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
 export const getCurrentUser=async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
return res.status(400).json({message:"user not found"})
        }

   return res.status(200).json(user)     
    } catch (error) {
      console.error("getCurrentUser error:", error)
      return res.status(500).json({message:"get current user error"})
    }
}

export const updateAssistant=async (req,res)=>{
   try {
      const {assistantName,imageUrl}=req.body
      let assistantImage;
if(req.file){
   assistantImage=await uploadOnCloudinary(req.file.path)
}else{
   assistantImage=imageUrl
}

const user=await User.findByIdAndUpdate(req.userId,{
   assistantName,assistantImage
},{new:true}).select("-password")
return res.status(200).json(user)

      
   } catch (error) {
       return res.status(400).json({message:"updateAssistantError user error"}) 
   }
}

export const clearHistory=async (req,res)=>{
   try {
      const user=await User.findByIdAndUpdate(
         req.userId,
         {$set:{history:[]}},
         {new:true}
      ).select("-password")

      if(!user){
         return res.status(404).json({message:"user not found"})
      }

      return res.status(200).json(user)
   } catch (error) {
      return res.status(500).json({message:"clear history error"})
   }
}


export const askToAssistant=async (req,res)=>{
   try {
      const {command}=req.body
      if(typeof command !== "string" || !command.trim()){
         return res.status(400).json({response:"Please enter a question."})
      }
      if(command.length > 500){
         return res.status(400).json({response:"Please keep your question under 500 characters."})
      }
      const user = req.userId ? await User.findById(req.userId) : null

      if (user) {
         user.history.push(command)
         if (user.history.length > 100) user.history = user.history.slice(-100)
         await user.save()
      }

      const assistantName = user?.assistantName || "Virtual Assistant"

      const normalizedCommand=command.toLowerCase()
      const isHindiCommand = /[\u0900-\u097f]/.test(command)
         || /\b(aap|apka|apke|aapke|kaun|kya|kaise|mujhe|mera|meri|aapko|banaya|banane|creator|padhte|padhai|pasand|shauk|ghoomna|yatra|samay|baje|aaj|tarikh|din|mahina|batao|bataiye|ke|ki|hai|hain|ho)\b/i.test(normalizedCommand)
      const creatorQuestion = normalizedCommand.includes("creator")
         || normalizedCommand.includes("who made you")
         || normalizedCommand.includes("who created you")
         || normalizedCommand.includes("who is your creator")
         || normalizedCommand.includes("akinchan maji")
      const creatorResponse = "Akinchan Maji is an Artificial Intelligence and Machine Learning student at Brainware University. He is passionate about AI, Machine Learning, emerging technologies, innovation, and building practical technology projects. He enjoys learning new concepts, experimenting with ideas, improving his software development skills, and traveling to explore different places and cultures. His current focus is learning, building practical projects, and developing his skills in AI, Machine Learning, and software development."

      if (creatorQuestion) {
         return res.json({
            type:"general",
            userInput:command,
            response:isHindiCommand
               ? "Akinchan Maji Brainware University mein Artificial Intelligence aur Machine Learning ke student hain. Unki dilchaspi AI, Machine Learning, naye technologies, innovation aur practical technology projects banane mein hai. Woh naye concepts seekhna, ideas par experiment karna aur apni software development skills ko behtar banana pasand karte hain. Unhe alag-alag jagah ghoomna, nayi cultures ko samajhna aur duniya explore karna bhi pasand hai. Filhaal unka focus seekhne, practical projects banane aur AI, Machine Learning aur software development mein apni skills badhane par hai."
               : creatorResponse
         })
      }
      if (/\bwho\s+am\s+i\b|\bwhat(?:'s|\s+is)\s+my\s+name\b|\bdo\s+you\s+know\s+my\s+name\b|\btell\s+me\s+my\s+name\b/.test(normalizedCommand)) {
         return res.json({
            type:"general",
            userInput:command,
            response:user?.name
               ? isHindiCommand ? `Aap ${user.name} hain.` : `You are ${user.name}.`
               : isHindiCommand ? "Mujhe abhi aapka naam nahi pata. Kripya sign in kijiye, taaki main aapka naam yaad rakh sakun." : "I do not know your name yet. Please sign in so I can remember you."
         })
      }
      if (normalizedCommand.includes("who are you") || normalizedCommand.includes("what is your name")) {
         return res.json({
            type:"general",
            userInput:command,
            response:isHindiCommand
               ? `Main ${assistantName} hoon, mujhe Akinchan Maji ne banaya hai. Agar aap unke baare mein jaanna chahte hain, to mujhse mere creator ke baare mein poochhiye.`
               : `I am ${assistantName}, created by Akinchan Maji. Ask me about my creator if you would like to know more about him.`
         })
      }
      if (normalizedCommand.includes("time") || /\bkitne?\s+baje|\bkya\s+samay|\babhi\s+ka\s+samay/.test(normalizedCommand)) {
         return res.json({type:"get-time",userInput:command,response:isHindiCommand ? `Abhi samay ${moment().format("hh:mm A")} hai.` : `current time is ${moment().format("hh:mm A")}`})
      }
      if (normalizedCommand.includes("date") || /\baaj\s+ki\s+tarikh|\baaj\s+ki\s+date/.test(normalizedCommand)) {
         return res.json({type:"get-date",userInput:command,response:isHindiCommand ? `Aaj ki tareekh ${moment().format("YYYY-MM-DD")} hai.` : `current date is ${moment().format("YYYY-MM-DD")}`})
      }
      if (normalizedCommand.includes("what day") || normalizedCommand.includes("which day") || /\baaj\s+kaun\s+sa\s+din|\baaj\s+ka\s+din/.test(normalizedCommand)) {
         return res.json({type:"get-day",userInput:command,response:isHindiCommand ? `Aaj ${moment().format("dddd")} hai.` : `today is ${moment().format("dddd")}`})
      }
      if (normalizedCommand.includes("month") || /\bkaun\s+sa\s+mahina|abhi\s+ka\s+mahina/.test(normalizedCommand)) {
         return res.json({type:"get-month",userInput:command,response:isHindiCommand ? `Yeh ${moment().format("MMMM")} ka mahina hai.` : `today is ${moment().format("MMMM")}`})
      }
      if (/\b(open|launch|start)\s+(the\s+)?youtube\b/.test(normalizedCommand)) {
         return res.json({
            type:"youtube-open",
            userInput:command,
            response:isHindiCommand ? "YouTube khol raha hoon." : "Opening YouTube."
         })
      }

      const result=await geminiResponse(command,assistantName,"Akinchan Maji")
      const jsonMatch=result.match(/\{[\s\S]*\}/)
      if(!jsonMatch){
         return res.status(400).json({response:"Sorry, I couldn't understand that request."})
      }

      let gemResult
      try {
         gemResult=JSON.parse(jsonMatch[0])
      } catch {
         return res.status(502).json({response:"I couldn't understand the assistant service response. Please try again."})
      }

      if (typeof gemResult.type !== "string" || typeof gemResult.response !== "string") {
         return res.status(502).json({response:"I couldn't understand the assistant service response. Please try again."})
      }
      console.log(gemResult)
      const type=gemResult.type

      switch(type){
         case 'get-date' :
            return res.json({
               type,
               userInput:gemResult.userInput,
               response:isHindiCommand ? `Aaj ki tareekh ${moment().format("YYYY-MM-DD")} hai.` : `current date is ${moment().format("YYYY-MM-DD")}`
            });
            case 'get-time':
                return res.json({
               type,
               userInput:gemResult.userInput,
               response:isHindiCommand ? `Abhi samay ${moment().format("hh:mm A")} hai.` : `current time is ${moment().format("hh:mm A")}`
            });
             case 'get-day':
                return res.json({
               type,
               userInput:gemResult.userInput,
               response:isHindiCommand ? `Aaj ${moment().format("dddd")} hai.` : `today is ${moment().format("dddd")}`
            });
            case 'get-month':
                return res.json({
               type,
               userInput:gemResult.userInput,
               response:isHindiCommand ? `Yeh ${moment().format("MMMM")} ka mahina hai.` : `today is ${moment().format("MMMM")}`
            });
      case 'google-search':
      case 'youtube-open':
      case 'youtube-search':
      case 'youtube-play':
      case 'general':
      case  "calculator-open":
      case "instagram-open": 
       case "facebook-open": 
       case "weather-show" :
         return res.json({
            type,
            userInput:gemResult.userInput,
            response:gemResult.response,
         });

         default:
            return res.status(400).json({ response: "I didn't understand that command." })
      }
     

   } catch (error) {
   const status=error.response?.status === 429 ? 429 : 500
   const response=status === 429
      ? "The assistant service is busy right now. Please try again in a moment."
      : "I could not process that request. Please try again."
   return res.status(status).json({ response })
   }
}