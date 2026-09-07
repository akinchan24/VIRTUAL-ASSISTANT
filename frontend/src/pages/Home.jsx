import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { FaMicrophone, FaMicrophoneSlash, FaLock, FaPaperPlane, FaEllipsisV, FaTimes } from "react-icons/fa";
import userImg from "../assets/user.gif"
function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse,isAuthenticated,setIsAuthenticated}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const [chatInput,setChatInput]=useState("")
  const [assistantEnabled,setAssistantEnabled]=useState(false)
  const [customizePromptOpen,setCustomizePromptOpen]=useState(false)
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false)
  const isSpeakingRef=useRef(false)
  const speechIdRef=useRef(0)
  const speechStartTimerRef=useRef(null)
  const assistantEnabledRef=useRef(false)
  const recognitionRef=useRef(null)
  const recognitionTimerRef=useRef(null)
  const commandTimerRef=useRef(null)
  const speechCooldownRef=useRef(false)
  const transcriptRef=useRef("")
  const interimTranscriptRef=useRef("")
  const isRecognizingRef=useRef(false)
  const isProcessingRef=useRef(false)
  const synth=window.speechSynthesis

  const handleLogOut=async ()=>{
    setMobileMenuOpen(false)
    setUserData({
      name: 'Guest',
      assistantName: 'Virtual Assistant',
      assistantImage: '',
      history: []
    })
    setIsAuthenticated(false)
    navigate('/signin')

    try {
      await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
    } catch (error) {
      console.log(error)
    }
  }

  const handleCustomize=()=>{
    setMobileMenuOpen(false)
    if (!isAuthenticated) {
      setCustomizePromptOpen(true)
      return
    }
    navigate('/customize')
  }

  const handleCustomizeSignIn=()=>{
    setCustomizePromptOpen(false)
    navigate('/signin')
  }

  const startRecognition = () => {
  if (assistantEnabledRef.current && !isSpeakingRef.current && !isRecognizingRef.current && !isProcessingRef.current) {
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

  const scheduleRecognition = () => {
    window.clearTimeout(recognitionTimerRef.current);
    recognitionTimerRef.current = window.setTimeout(startRecognition, 350);
  }

  const stopRecognition = () => {
    window.clearTimeout(recognitionTimerRef.current);
    recognitionTimerRef.current = null;
    if (isRecognizingRef.current) {
      recognitionRef.current?.stop();
    }
    isRecognizingRef.current = false;
    setListening(false);
  }

  const scheduleCommandSubmission = (delay = 350) => {
    window.clearTimeout(commandTimerRef.current);
    commandTimerRef.current = window.setTimeout(() => {
      commandTimerRef.current = null;
      const pendingTranscript = `${transcriptRef.current} ${interimTranscriptRef.current}`.trim();
      if (pendingTranscript && !isProcessingRef.current && assistantEnabledRef.current) {
        submitCommand(pendingTranscript);
      }
    }, delay);
  }

  const normalizeCommand = (command) => command
    .replace(/\b(hu|hoo|who)\s+(r|are)\s+(u|you)\b/gi, "who are you")
    .replace(/\bhow\s+(r|are)\s+(u|you)\b/gi, "how are you")
    .replace(/\bwho\s+are\s+ya\b/gi, "who are you")
    .replace(/\babout\s+urself\b/gi, "about yourself")
    .replace(/\btell\s+me\s+abt\b/gi, "tell me about")
    .replace(/\s+/g, " ")
    .trim();

  const getRecognitionLanguage=()=>{
    const browserLanguage=(navigator.language || "en-IN").toLowerCase();
    if (browserLanguage.startsWith("hi")) return "hi-IN";
    if (browserLanguage.startsWith("bn")) return "bn-IN";
    return "en-IN";
  }

  const toggleAssistant = () => {
    const nextEnabled = !assistantEnabledRef.current;
    assistantEnabledRef.current = nextEnabled;
    setAssistantEnabled(nextEnabled);

    if (!nextEnabled) {
      window.clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
      isProcessingRef.current = false;
      transcriptRef.current = "";
      interimTranscriptRef.current = "";
      speechIdRef.current += 1;
      window.clearTimeout(speechStartTimerRef.current);
      speechStartTimerRef.current = null;
      stopRecognition();
      synth.cancel();
      isSpeakingRef.current = false;
      setListening(false);
      setUserText("");
      setAiText("");
      return;
    }

    speak(`I am ${userData.assistantName}, created by Akinchan Maji. Hello ${userData.name}, what can I help you with?`, false, true);
  }

  const speak=(text, forceVoice=false, immediate=false)=>{
    if (!assistantEnabledRef.current && !forceVoice) {
      return;
    }
    const speechId = speechIdRef.current + 1;
    speechIdRef.current = speechId;
    stopRecognition();
    if (!synth || !text) {
      return;
    }
    const isRomanHindi = /\b(aap|main|kaise|kya|hai|hain|mera|meri|mujhe|batao|bataiye|kar|sakta|sakti|ke|ki|ko|se|mein|karo|chahiye|haan|nahi|nahin|boliye|sun)\b/i.test(text)
    const responseLanguage = /[\u0980-\u09FF]/.test(text)
      ? 'bn-IN'
      : /[\u0900-\u097F]/.test(text) || isRomanHindi
        ? 'hi-IN'
        : 'en-IN';
    const words = text.trim().split(/\s+/);
    const speechChunks = [];
    for (let index = 0; index < words.length; index += 40) {
      speechChunks.push(words.slice(index, index + 40).join(" "));
    }
    isSpeakingRef.current=true
    let chunkIndex = 0;
    let retryCount = 0;
    const finishSpeech=()=>{
      if (speechId !== speechIdRef.current) {
        return;
      }
      setAiText("");
      isSpeakingRef.current = false;
      speechCooldownRef.current = true;
      window.setTimeout(() => {
        speechCooldownRef.current = false;
        if (assistantEnabledRef.current) {
          scheduleRecognition();
        }
      }, 250);
    }
    const speakNextChunk=()=>{
      if (speechId !== speechIdRef.current) {
        return;
      }
      if (chunkIndex >= speechChunks.length) {
        finishSpeech();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(speechChunks[chunkIndex]);
      utterance.lang = responseLanguage;
      utterance.volume = 1;
      utterance.rate = 0.98;
      utterance.pitch = 1;
      utterance.onend = () => {
        retryCount = 0;
        chunkIndex += 1;
        window.setTimeout(speakNextChunk, 40);
      };
      utterance.onerror = (event) => {
        console.warn("Speech synthesis error:", event.error);
        if (speechId !== speechIdRef.current || retryCount >= 1) {
          finishSpeech();
          return;
        }
        retryCount += 1;
        window.setTimeout(speakNextChunk, 150);
      };
      utterance.onpause = () => {
        window.setTimeout(() => {
          if (speechId === speechIdRef.current && isSpeakingRef.current && synth.paused) {
            synth.resume();
          }
        }, 150);
      };
      synth.speak(utterance);
    };
    speechStartTimerRef.current = window.setTimeout(() => {
      speechStartTimerRef.current = null;
      if (speechId === speechIdRef.current) {
        synth.cancel();
        speakNextChunk();
      }
    }, immediate ? 0 : 2500);
  }

  const handleCommand=(data, forceVoice=false, immediate=false)=>{
    const {type,userInput,response}=data
      speak(response, forceVoice, immediate);
    
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

    if (type === 'youtube-open') {
      window.open('https://www.youtube.com/', '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

  }

  const submitCommand = async (command, allowWhenDisabled=false) => {
    window.clearTimeout(commandTimerRef.current);
    commandTimerRef.current = null;
    const cleanCommand = normalizeCommand(command);
    if (!cleanCommand || isProcessingRef.current || (!assistantEnabledRef.current && !allowWhenDisabled)) {
      return;
    }

    isProcessingRef.current = true;
    setAiText("Thinking...");
    setUserText(cleanCommand);
    stopRecognition();
    try {
      const data = await getGeminiResponse(cleanCommand);
      if (data?.response && (assistantEnabledRef.current || allowWhenDisabled)) {
        handleCommand(data, allowWhenDisabled, allowWhenDisabled);
        setAiText(data.response);
      }
    } finally {
      transcriptRef.current = "";
      interimTranscriptRef.current = "";
      isProcessingRef.current = false;
      setUserText("");
    }
  }

  const handleChatSubmit=(event)=>{
    event.preventDefault()
    const command=chatInput.trim()
    if (!command || isProcessingRef.current) {
      return
    }
    setChatInput("")
    submitCommand(command, true)
  }

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech Recognition is not supported in this browser.");
    return undefined;
  }
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = getRecognitionLanguage();
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
    if (isMounted && assistantEnabledRef.current && !isProcessingRef.current && !speechCooldownRef.current) {
      const pendingTranscript = `${transcriptRef.current} ${interimTranscriptRef.current}`.trim();
      if (pendingTranscript) {
        scheduleCommandSubmission(250);
        return;
      }
    }
    if (!isProcessingRef.current) {
      transcriptRef.current = "";
      interimTranscriptRef.current = "";
    }
    if (isMounted && assistantEnabledRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
      scheduleRecognition();
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error !== "aborted" && isMounted && assistantEnabledRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
      scheduleRecognition();
    }
  };

  recognition.onnomatch = () => {
    isRecognizingRef.current = false;
    setListening(false);
  };

  recognition.onresult = async (e) => {
    if (!assistantEnabledRef.current || isProcessingRef.current || speechCooldownRef.current) {
      return;
    }
    let transcript = transcriptRef.current;
    let interimTranscript = "";
    let hasFinalResult = false;

    for (let index = e.resultIndex; index < e.results.length; index += 1) {
      const result = e.results[index];
      if (result.isFinal) {
        transcript += ` ${result[0].transcript}`;
        hasFinalResult = true;
      } else {
        interimTranscript += ` ${result[0].transcript}`;
      }
    }

    transcriptRef.current = transcript.trim();
    interimTranscriptRef.current = interimTranscript.trim();
    const visibleTranscript = `${transcriptRef.current} ${interimTranscriptRef.current}`.trim();
    if (visibleTranscript) {
      setUserText(visibleTranscript);
    }
    if (transcriptRef.current || interimTranscriptRef.current) {
      window.clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
    if (hasFinalResult && transcriptRef.current) {
      scheduleCommandSubmission(300);
    }
  };
 

  return () => {
    isMounted = false;
    assistantEnabledRef.current = false;
    window.clearTimeout(commandTimerRef.current);
    commandTimerRef.current = null;
    speechIdRef.current += 1;
    window.clearTimeout(speechStartTimerRef.current);
    speechStartTimerRef.current = null;
    stopRecognition();
    synth.cancel();
    setListening(false);
    isRecognizingRef.current = false;
  };
}, []);




  return (
    <div className='robotic-screen w-full min-h-[100dvh] lg:h-screen flex justify-center items-center flex-col gap-[12px] sm:gap-[15px] px-[16px] pt-[88px] pb-[24px] lg:p-0 overflow-x-hidden overflow-y-auto lg:overflow-hidden'>
      <button
        type='button'
        onClick={toggleAssistant}
        aria-pressed={assistantEnabled}
        className={`robotic-icon-button absolute top-[16px] left-[16px] sm:top-[20px] sm:left-[20px] min-w-[160px] sm:min-w-[180px] h-[48px] sm:h-[52px] px-[14px] sm:px-[18px] rounded-lg font-semibold flex items-center justify-center gap-[8px] sm:gap-[10px] cursor-pointer ${assistantEnabled ? 'border-[#91ee9d] text-[#91ee9d]' : ''}`}
      >
        {assistantEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        {assistantEnabled ? (listening ? 'Assistant On' : 'Starting...') : 'Assistant Off'}
      </button>
      <button type='button' aria-label='Open account menu' aria-expanded={mobileMenuOpen} className='robotic-icon-button absolute right-[16px] top-[16px] z-30 flex h-[48px] w-[48px] items-center justify-center rounded-full sm:hidden' onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <FaTimes className='h-5 w-5' /> : <FaEllipsisV className='h-5 w-5' />}
      </button>
      <div className='absolute top-[20px] right-[16px] z-20 hidden flex-col items-stretch gap-3 sm:right-[20px] sm:flex'>
        {!isAuthenticated && (
          <button className='robotic-button h-[44px] min-w-[170px] rounded-lg text-[15px] font-semibold text-[#041013] lg:h-[52px] lg:text-[17px]' onClick={()=>navigate('/signin')}>Sign In</button>
        )}
        {isAuthenticated && (
          <button className='robotic-button h-[44px] min-w-[170px] rounded-lg text-[15px] font-semibold text-[#041013] lg:h-[52px] lg:text-[17px]' onClick={handleLogOut}>Log Out</button>
        )}
        <button className='robotic-icon-button h-[44px] min-w-[170px] rounded-lg px-[20px] py-[10px] text-[15px] font-semibold lg:h-[52px] lg:text-[17px]' onClick={handleCustomize}>Customize your Assistant</button>
      </div>
      {mobileMenuOpen && (
        <div className='robotic-panel absolute right-[16px] top-[76px] z-20 flex w-[220px] flex-col gap-2 rounded-xl p-3 sm:hidden'>
          {!isAuthenticated && <button className='robotic-button h-[44px] rounded-lg text-[14px] font-semibold text-[#041013]' onClick={()=>{setMobileMenuOpen(false); navigate('/signin')}}>Sign In</button>}
          {isAuthenticated && <button className='robotic-button h-[44px] rounded-lg text-[14px] font-semibold text-[#041013]' onClick={handleLogOut}>Sign Out</button>}
          <button className='robotic-icon-button h-[44px] rounded-lg text-[14px] font-semibold' onClick={handleCustomize}>Customize your Assistant</button>
        </div>
      )}
      <div className='robotic-home-image w-[min(300px,72vw)] h-[min(400px,48vh)] min-h-[220px] flex justify-center items-center overflow-hidden rounded-xl'>
<img src={userData?.assistantImage || userImg} alt="" className='h-full object-cover'/>
      </div>
      <p className='robotic-status px-3 py-1 text-[11px]'>Unit online / {userData?.assistantName || 'Virtual Assistant'}</p>
      {!aiText && <img src={userImg} alt="" className='w-[min(200px,52vw)]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[min(200px,52vw)]'/>}

      <form className='flex w-full max-w-[620px] items-center gap-2 rounded-xl border border-[#68d7e355] bg-[#071317cc] p-2 shadow-[0_0_24px_rgba(0,0,0,0.25)] backdrop-blur-sm' onSubmit={handleChatSubmit}>
        <input type='text' value={chatInput} onChange={(event)=>setChatInput(event.target.value)} placeholder='Chat with your assistant...' aria-label='Chat with your assistant' className='min-w-0 flex-1 bg-transparent px-3 py-2 text-[16px] text-white outline-none placeholder:text-[#78999e]' />
        <button type='submit' aria-label='Send chat message' className='robotic-button flex h-[42px] w-[46px] shrink-0 items-center justify-center rounded-lg text-[#041013]' disabled={!chatInput.trim() || isProcessingRef.current}>
          <FaPaperPlane className='h-4 w-4' />
        </button>
      </form>

    <h1 aria-live='polite' className='w-full max-w-[680px] break-words px-2 text-center text-[16px] font-semibold leading-6 text-white sm:text-[18px]'>{userText?userText:aiText?aiText:null}</h1>

      {customizePromptOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#020608]/80 px-5 backdrop-blur-sm' role='presentation' onClick={()=>setCustomizePromptOpen(false)}>
          <div className='robotic-panel relative w-full max-w-[440px] overflow-hidden rounded-2xl px-6 py-8 text-center sm:px-10' role='dialog' aria-modal='true' aria-labelledby='customize-prompt-title' onClick={(event)=>event.stopPropagation()}>
            <div className='absolute inset-x-0 top-0 h-px bg-[#68d7e3] shadow-[0_0_18px_#68d7e3]'></div>
            <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#68d7e3]/40 bg-[#68d7e3]/10 text-[#68d7e3] shadow-[0_0_28px_rgba(104,215,227,0.18)]'>
              <FaLock className='h-6 w-6' />
            </div>
            <p className='robotic-status mx-auto mb-4 inline-block px-3 py-1 text-[10px]'>Access restricted</p>
            <h2 id='customize-prompt-title' className='robotic-title mb-3 text-[22px] font-semibold text-white'>Sign in to customize</h2>
            <p className='mx-auto max-w-[320px] text-[16px] leading-6 text-[#a9c5c9]'>Create a personal assistant by signing in to unlock customization.</p>
            <div className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center'>
              <button type='button' className='robotic-icon-button h-[48px] rounded-lg px-6 text-[15px] font-semibold' onClick={()=>setCustomizePromptOpen(false)}>Maybe Later</button>
              <button type='button' className='robotic-button h-[48px] rounded-lg px-7 text-[15px] font-semibold text-[#041013]' onClick={handleCustomizeSignIn}>Sign In</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

export default Home