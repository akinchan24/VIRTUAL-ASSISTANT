import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext=createContext()

const guestUser = {
    name: 'Guest',
    assistantName: 'Virtual Assistant',
    assistantImage: '',
    history: []
}

function UserContext({children}) {

    const serverUrl="http://localhost:8000"

    const [userData,setUserData]=useState(guestUser)
    const [isAuthenticated,setIsAuthenticated]=useState(false)
    const [authLoading,setAuthLoading]=useState(true)
    const [frontendImage,setFrontendImage]=useState(null)
     const [backendImage,setBackendImage]=useState(null)
     const [selectedImage,setSelectedImage]=useState(null)
    const handleCurrentUser=async ()=>{
        try {
            const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
            setUserData(result.data)
            setIsAuthenticated(true)
            console.log(result.data)
        } catch {
            setUserData(guestUser)
            setIsAuthenticated(false)
        } finally {
          setAuthLoading(false)
        }
    }

    const getGeminiResponse=async (command)=>{
try {
  const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
  return result.data
} catch (error) {
  console.log(error)
  return error.response?.data || {response:"I could not process that request. Please try again."}
}
    }

    useEffect(()=>{
handleCurrentUser()
    },[])
    const value={
serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse,isAuthenticated,setIsAuthenticated,authLoading
    }
  return (
    <div>
    <userDataContext.Provider value={value}>
      {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
