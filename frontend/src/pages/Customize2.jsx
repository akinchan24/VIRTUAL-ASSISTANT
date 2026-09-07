import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
function Customize2() {
    const {userData,backendImage,selectedImage,serverUrl,setUserData}=useContext(userDataContext)
    const [assistantName,setAssistantName]=useState(userData?.assistantName || "")
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate()

    const handleUpdateAssistant=async ()=>{
        setLoading(true)
        try {
            let formData=new FormData()
            formData.append("assistantName",assistantName)
            if(backendImage){
                 formData.append("assistantImage",backendImage)
            }else{
                formData.append("imageUrl",selectedImage)
            }
            const result=await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true})
setLoading(false)
            console.log(result.data)
            setUserData(result.data)
            navigate("/")
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }

  return (
    <div className='robotic-screen w-full min-h-[100dvh] flex justify-center items-center flex-col p-[16px] sm:p-[20px] relative '>
        <MdKeyboardBackspace className='robotic-icon-button absolute top-[22px] left-[22px] rounded-md p-1 text-white cursor-pointer w-[32px] h-[32px]' onClick={()=>navigate("/customize")}/>
    <p className='robotic-status px-3 py-1 text-[11px] mb-3'>Identity protocol</p>
    <h1 className='robotic-title text-white mb-[24px] sm:mb-[40px] text-[24px] sm:text-[30px] text-center '>Enter Your <span>Assistant Name</span> </h1>
    <input type="text" placeholder='eg. shifra' className='robotic-input w-full max-w-[600px] h-[52px] sm:h-[60px] outline-none text-white placeholder-gray-400 px-[16px] sm:px-[20px] py-[10px] rounded-lg text-[16px] sm:text-[18px]' required onChange={(e)=>setAssistantName(e.target.value)} value={assistantName}/>
    {assistantName &&  <button className='robotic-button w-full max-w-[360px] h-[52px] sm:h-[60px] mt-[24px] sm:mt-[30px] px-[18px] text-[#041013] font-semibold cursor-pointer rounded-lg text-[17px] sm:text-[19px] ' disabled={loading} onClick={()=>{
        handleUpdateAssistant()
    }
        } >{!loading?"Finally Create Your Assistant":"Loading..."}</button>}
     
    </div>
  )
}

export default Customize2