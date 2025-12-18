"use client";

import React, { useState } from 'react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputLanguage, setInputLanguage] = useState("en");
  const [outputLanguage, setOutputLanguage] = useState("es");

  const recognitionRef = React.useRef<any>(null);
  const [translatedText, setTranslatedText] = useState("");
 


  const speechLangMap: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
};



  //initialize speech recognition 
  const startRecording = () => {

  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech Recognition not supported in this browser");
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = speechLangMap[inputLanguage] || "en-US";

  recognition.onresult = (event: any) => {
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      finalTranscript += event.results[i][0].transcript;
    }

    setTranscript(finalTranscript);
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event);
  };

  recognition.start();
  recognitionRef.current = recognition;
  setIsRecording(true);
};

// const stopRecording = () => {
//   recognitionRef.current?.stop();
//   setIsRecording(false);
// };

const stopRecording = () => {
  recognitionRef.current?.stop();
  setIsRecording(false);

  console.log("stopRecording called");

  // Wait briefly to ensure final speech result is captured
  setTimeout(async () => {
    if (!transcript.trim()) {
      console.log("Transcript empty, not translating");
      return;
    }

    console.log("Calling /api/translate with:", transcript);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcript,
          targetLanguage: outputLanguage,
        }),
      });

      const data = await res.json();
      console.log("Translation response:", data);

      setTranslatedText(data.translation || "");
    } catch (error) {
      console.error("Translation fetch failed:", error);
    }
  }, 600);
};


const speakTranslation = () => {
  if (!translatedText) return;

  const utterance = new SpeechSynthesisUtterance(translatedText);

  const languageMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    hi: "hi-IN",
    fr: "fr-FR",
  };

  utterance.lang = languageMap[outputLanguage] || "en-US";
  utterance.rate = 0.95; // slightly slower for clarity
  utterance.pitch = 1;

  window.speechSynthesis.cancel(); // stop previous
  window.speechSynthesis.speak(utterance);
};


const swapLanguages = () => {
  setInputLanguage((prevInput)=> {
    setOutputLanguage(prevInput);
    return outputLanguage;
  });

  setTranscript("");
  setTranslatedText("");
}

// const swapLanguages = () => {
//   setInputLanguage((prevInput) => {
//     setOutputLanguage(prevInput);
//     return outputLanguage;
//   });

//   // Clear old content to avoid confusion
//   setTranscript("");
//   setTranslatedText("");
// };




  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <header className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white text-center">
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-wide">MediTranslate</h1>
          <p className="text-indigo-100 text-xs mt-1 font-medium opacity-90">
            Real-time Patient–Provider Bridge
          </p>
        </header>

        <div className="p-6 space-y-6">
          
          {/* Language Selection Row */}
          <div className="relative flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            {/* From Language */}
            <div className="flex-1 relative">
              <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-3 top-2">From</label>
              <select 
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
              
              className="w-full pt-5 pb-2 px-3 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer appearance-none">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            {/* Swap Icon */}
            <button
            onClick={swapLanguages}
             className="bg-white p-2 rounded-full shadow-sm border border-slate-100 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>

            {/* To Language */}
            <div className="flex-1 relative text-right">
              <label className="text-[10px] uppercase font-bold text-slate-400 absolute right-8 top-2">To</label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="w-full pt-5 pb-2 px-3 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer text-right appearance-none" 
                dir="rtl">
                <option value="es">Spanish</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="fr">French</option>
              </select>
              {/* Custom Chevron Hack */}
              <div className="absolute right-3 top-4 pointer-events-none">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Transcripts Area */}
          <div className="space-y-4">
            {/* Input Bubble */}
            <div className="group relative">
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-slate-200 rounded-l-lg group-hover:bg-indigo-300 transition-colors"></div>
              <div className="pl-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase mb-1">Original Speech</h2>
                <div className="bg-slate-50 p-4 rounded-r-xl rounded-bl-xl border border-slate-100 text-slate-600 text-sm leading-relaxed min-h-[60px]">
                 {transcript || "Tap the button and start speaking..."}
                </div>
                {/* <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Or type the message here..."
                  className="mt-2 w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                /> */}

              </div>
            </div>

            {/* Output Bubble */}
            <div className="group relative">
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg shadow-lg shadow-indigo-200"></div>
              <div className="pl-4">
                <div className="flex justify-between items-end mb-1">
                   <h2 className="text-xs font-bold text-indigo-600 uppercase">Translation</h2>
                   <button 
                   onClick={speakTranslation}                   
                   className="text-indigo-600 hover:text-indigo-800 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                     </svg>
                   </button>
                </div>
                <div className="bg-indigo-50 p-4 rounded-r-xl rounded-bl-xl border border-indigo-100 text-slate-800 font-medium text-sm leading-relaxed shadow-sm min-h-[60px]">
                  {translatedText || "Waiting for translation..."}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => {isRecording ? stopRecording():startRecording()}}
            className={`w-full group relative flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg
              ${isRecording 
                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            <span className={`flex h-3 w-3 relative ${!isRecording && 'hidden'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            <span className="font-semibold">
              {isRecording ? 'Stop Recording' : 'Tap to Speak'}
            </span>
          </button>

          {/* Footer */}
          <footer className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            <span>End-to-end encrypted. No audio stored.</span>
          </footer>

        </div>
      </div>
    </main>
  );
}