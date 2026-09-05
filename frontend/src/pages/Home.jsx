import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const transcriptRef=useRef("")
  const [ham,setHam]=useState(false)
  const isRecognizingRef=useRef(false)
  const isProcessingRef=useRef(false)
  const synth=window.speechSynthesis

  const handleLogOut=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    
  if (!isSpeakingRef.current && !isRecognizingRef.current && !isProcessingRef.current) {
    try {
      recognitionRef.current?.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }
    
  }

  const speak=(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    const responseLanguage = /[\u0980-\u09FF]/.test(text)
      ? 'bn-IN'
      : /[\u0900-\u097F]/.test(text)
        ? 'hi-IN'
        : 'en-IN';
    utterence.lang = responseLanguage;
    isSpeakingRef.current=true
    utterence.onend=()=>{
      setAiText("");
      isSpeakingRef.current = false;
      startRecognition();
    }
    synth.cancel();
    synth.speak(utterence);
  }

  const handleCommand=(data)=>{
    const {type,userInput,response}=data
      speak(response);
    
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
     if (type === 'calculator-open') {
  
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
     if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type ==="facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
     if (type ==="weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

  }

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-IN';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
    try {
      recognition.start();
      console.log("Recognition requested to start");
    } catch (e) {
      if (e.name !== "InvalidStateError") {
        console.error(e);
      }
    }
  }

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
    if (!isProcessingRef.current) {
      transcriptRef.current = "";
    }
    if (isMounted && !isSpeakingRef.current && !isProcessingRef.current) {
      window.setTimeout(startRecognition, 100);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error !== "aborted" && isMounted && !isSpeakingRef.current && !isProcessingRef.current) {
      window.setTimeout(startRecognition, 100);
    }
  };

  recognition.onresult = async (e) => {
    let transcript = transcriptRef.current;
    let hasFinalResult = false;
    let currentInterimTranscript = "";

    for (let index = e.resultIndex; index < e.results.length; index += 1) {
      const result = e.results[index];
      if (result.isFinal) {
        transcript += ` ${result[0].transcript}`;
        hasFinalResult = true;
      } else {
        currentInterimTranscript += ` ${result[0].transcript}`;
      }
    }

    transcriptRef.current = transcript.trim();
    const normalizedTranscript = `${transcriptRef.current} ${currentInterimTranscript}`.toLowerCase();
    const assistantName = userData.assistantName.toLowerCase();

    if (hasFinalResult && normalizedTranscript.includes(assistantName)) {
      isProcessingRef.current = true;
      setAiText("");
      setUserText(transcriptRef.current);
      recognition.stop();
      isRecognizingRef.current = false;
      setListening(false);
      try {
        const data = await getGeminiResponse(transcriptRef.current);
        if (data?.response) {
          handleCommand(data);
          setAiText(data.response);
        }
      } finally {
        transcriptRef.current = "";
        isProcessingRef.current = false;
        setUserText("");
      }
    }
  };

    speak(`Hello ${userData.name}, what can I help you with?`, () => {});
 

  return () => {
    isMounted = false;
    recognition.stop();
    setListening(false);
    isRecognizingRef.current = false;
  };
}, []);




  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
 <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>
 <button className='min-w-[150px] h-[60px]  text-black font-semibold   bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

<div className='w-full h-[2px] bg-gray-400'></div>
<h1 className='text-white font-semibold text-[19px]'>History</h1>

<div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
  {userData.history?.map((his)=>(
    <div className='text-gray-200 text-[18px] w-full h-[30px]  '>{his}</div>
  ))}

</div>

      </div>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
<img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
    
    <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
      
    </div>
  )
}

export default Home