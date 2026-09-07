import React, { useContext, useRef } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";
function Customize() {
  const {setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  const navigate=useNavigate()
     const inputImage=useRef()

     const handleImage=(e)=>{
const file=e.target.files[0]
setBackendImage(file)
setFrontendImage(URL.createObjectURL(file))
     }
  return (
    <div className='robotic-screen w-full min-h-[100dvh] flex justify-center items-center flex-col p-[16px] sm:p-[20px] py-[70px] sm:py-[20px] '>
      <MdKeyboardBackspace className='robotic-icon-button absolute top-[22px] left-[22px] rounded-md p-1 text-white cursor-pointer w-[32px] h-[32px]' onClick={()=>navigate("/")}/>
      <p className='robotic-status px-3 py-1 text-[11px] mb-3'>Visual core selection</p>
      <h1 className='robotic-title text-white mb-[24px] sm:mb-[40px] text-[24px] sm:text-[30px] text-center '>Select your <span>Assistant Image</span></h1>
        <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[10px] sm:gap-[15px]'>
      <Card image={image1}/>
       <Card image={image2}/>
        <Card image={image3}/>
         <Card image={image4}/>
          <Card image={image5}/>
           <Card image={image6}/>
            <Card image={image7}/>
    <div className={`robotic-card w-[70px] h-[130px] sm:w-[110px] sm:h-[190px] lg:w-[150px] lg:h-[250px] rounded-lg overflow-hidden cursor-pointer flex items-center justify-center ${selectedImage=="input"?"robotic-card-selected ":null}` } onClick={()=>{
        inputImage.current.click()
        setSelectedImage("input")
     }}>
        {!frontendImage &&  <RiImageAddLine className='text-white w-[25px] h-[25px]'/>}
        {frontendImage && <img src={frontendImage} className='h-full object-cover'/>}
    
    </div>
    <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
      </div>
{selectedImage && <button className='robotic-button min-w-[140px] h-[52px] sm:h-[60px] mt-[24px] sm:mt-[30px] text-[#041013] font-semibold cursor-pointer rounded-lg text-[17px] sm:text-[19px] ' onClick={()=>navigate("/customize2")}>Next</button>}
      
    </div>
  )
}

export default Customize
