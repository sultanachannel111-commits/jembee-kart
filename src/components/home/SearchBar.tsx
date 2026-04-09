"use client";

import { Search, Mic, Camera, X } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({ search, setSearch }: Props) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [showCameraMsg, setShowCameraMsg] = useState(false);

  const demoSuggestions = ["black tshirt", "oversize tshirt", "hoodie", "anime tshirt"];

  useEffect(() => {
    if (!search) { setSuggestions([]); return; }
    const filtered = demoSuggestions.filter((item) => item.toLowerCase().includes(search.toLowerCase()));
    setSuggestions(filtered.slice(0, 5));
  }, [search]);

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Chrome use karein voice ke liye!");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => setSearch(event.results[0][0].transcript.toLowerCase());
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="w-full relative px-2">
      {/* SEARCH INPUT BOX */}
      <div className={`flex items-center bg-white rounded-[22px] h-11 border transition-all duration-300 shadow-sm
        ${focused ? "border-green-500 ring-2 ring-green-50" : "border-gray-200"}`}>
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={18} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search on Jembee Kart..."
          className="flex-1 outline-none text-[13px] font-medium bg-transparent text-gray-800 h-full"
        />
        <div className="flex items-center gap-3 pr-4">
          <Camera size={19} className="text-gray-400 cursor-pointer" onClick={() => setShowCameraMsg(true)} />
          <button onClick={handleVoice} className="text-blue-500 border-l pl-3 border-gray-200">
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* 🎤 FULL SCREEN LISTENING POPUP (FIXED) */}
      {listening && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-lg flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            {/* Pulsing Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-[2]" />
              <div className="relative bg-white text-blue-600 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                🎤
              </div>
            </div>

            <h2 className="text-white text-2xl font-black tracking-tight mb-2">Listening...</h2>
            <p className="text-white/60 text-xs font-bold uppercase tracking-[3px] mb-10">Speak product name</p>

            <button 
              onClick={() => setListening(false)}
              className="px-10 py-3 bg-red-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-90 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 📷 CAMERA POPUP (FIXED) */}
      {showCameraMsg && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xs text-center shadow-2xl">
            <div className="text-5xl mb-4">📸</div>
            <p className="text-xl font-black text-gray-900 leading-tight">Coming Soon!</p>
            <p className="text-sm text-gray-500 mt-2">Image search is being added.</p>
            <button onClick={() => setShowCameraMsg(false)} className="mt-8 w-full py-4 bg-black text-white rounded-2xl font-bold active:scale-95 transition">
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
