import axios from "axios"
const geminiResponse=async (command,assistantName,userName)=>{
try {
    const apiUrl=process.env.GEMINI_API_URL
        const prompt = `You are ${assistantName}, created by ${userName}. Classify the user's request and return only valid JSON.
Use exactly this shape:
{"type":"general|google-search|youtube-open|youtube-search|youtube-play|calculator-open|instagram-open|facebook-open|weather-show|get-time|get-date|get-day|get-month","userInput":"string","response":"short spoken reply"}

Rules: Keep response under 20 words and in the user's language (English, Hindi, or Bengali). Use youtube-open when the user asks to open, launch, or start YouTube without a search query. For search intents, userInput must contain only the search terms. For general questions, answer briefly. Never use markdown or add text outside the JSON.
User request: ${command}`;





    const result=await axios.post(apiUrl,{
    "contents": [{
    "parts":[{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 120,
            "responseMimeType": "application/json"
        }
    }, {timeout:15000})
return result.data.candidates[0].content.parts[0].text
} catch (error) {
    console.error(`Gemini request failed${error.response?.status ? ` (${error.response.status})` : ""}`)
    throw error
}
}

export default geminiResponse