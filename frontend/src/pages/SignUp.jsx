import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"
function SignUp() {
  const [showPassword,setShowPassword]=useState(false)
  const {serverUrl,setUserData,setIsAuthenticated}=useContext(userDataContext)
  const navigate=useNavigate()
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
    const [loading,setLoading]=useState(false)
    const [password,setPassword]=useState("")
const [err,setErr]=useState("")
  const handleSignUp=async (e)=>{
    e.preventDefault()
    setErr("")
    setLoading(true)
try {
  let result=await axios.post(`${serverUrl}/api/auth/signup`,{
    name,email,password
  },{withCredentials:true} )
 setUserData(result.data)
 setIsAuthenticated(true)
  setLoading(false)
  navigate("/customize")
} catch (error) {
  console.log(error)
  setLoading(false)
  setErr(error.response?.data?.message || "Unable to create your account. Please try again.")
}
    }
  return (
    <div className='robotic-screen w-full min-h-[100dvh] bg-cover flex justify-center items-center p-4 sm:p-6' style={{backgroundImage:`url(${bg})`}} >
   <form className='robotic-panel w-full max-w-[500px] min-h-[520px] sm:h-[600px] flex flex-col items-center justify-center gap-[16px] sm:gap-[20px] px-[16px] sm:px-[38px] py-8' onSubmit={handleSignUp}>
  <p className='robotic-status px-3 py-1 text-[11px] mb-1'>New operator registration</p>
  <h1 className='robotic-title text-white text-[24px] sm:text-[30px] font-semibold mb-[20px] sm:mb-[30px] text-center'>Register to <span>Virtual Assistant</span></h1>
  <input type="text" placeholder='Enter your Name' className='w-full h-[54px] sm:h-[60px] outline-none text-white placeholder-gray-400 px-[16px] sm:px-[20px] py-[10px] rounded-xl border border-white/15 bg-slate-950/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] text-[16px] sm:text-[18px] transition-all duration-200 focus:border-cyan-400/70 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]' required onChange={(e)=>setName(e.target.value)} value={name}/>
  <input type="email" placeholder='Email' className='w-full h-[54px] sm:h-[60px] outline-none text-white placeholder-gray-400 px-[16px] sm:px-[20px] py-[10px] rounded-xl border border-white/15 bg-slate-950/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] text-[16px] sm:text-[18px] transition-all duration-200 focus:border-cyan-400/70 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
  <div className='w-full h-[54px] sm:h-[60px] text-white rounded-xl border border-white/15 bg-slate-950/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] text-[16px] sm:text-[18px] relative transition-all duration-200 focus-within:border-cyan-400/70 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]'>
<input type={showPassword?"text":"password"} placeholder='Password' className='w-full h-full rounded-xl outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' required onChange={(e)=>setPassword(e.target.value)} value={password}/>
{!showPassword && <IoEye className='absolute top-[17px] right-[18px] w-[22px] h-[22px] text-white/80 cursor-pointer hover:text-white' onClick={()=>setShowPassword(true)}/>}
  {showPassword && <IoEyeOff className='absolute top-[17px] right-[18px] w-[22px] h-[22px] text-white/80 cursor-pointer hover:text-white' onClick={()=>setShowPassword(false)}/>}
</div>
{err.length>0 && <p className='text-red-500 text-[17px]'>
  *{err}
  </p>}
<button className='robotic-button min-w-[150px] h-[52px] sm:h-[60px] mt-[20px] sm:mt-[30px] text-[#041013] font-semibold rounded-lg text-[17px] sm:text-[19px] ' disabled={loading}>{loading?"Loading...":"Sign Up"}</button>

<p className='text-[white] text-[18px] cursor-pointer' onClick={()=>navigate("/signin")}>Already have an account ? <span className='text-blue-400'>Sign In</span></p>
<button type='button' className='text-[#9dcbd0] text-[16px] cursor-pointer underline underline-offset-4 hover:text-[#68d7e3]' onClick={()=>navigate("/")}>Continue without login</button>
 </form>
    </div>
  )
}

export default SignUp
