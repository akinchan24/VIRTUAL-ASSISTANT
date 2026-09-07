import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Card({image}) {
  const {setBackendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  return (
    <div className={`robotic-card w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] rounded-lg overflow-hidden cursor-pointer ${selectedImage==image?"robotic-card-selected ":null}`} onClick={()=>{
        setSelectedImage(image)
        setBackendImage(null)
        setFrontendImage(null)
        }}>
      <img src={image} className='h-full object-cover'  />
    </div>
  )
}

export default Card
