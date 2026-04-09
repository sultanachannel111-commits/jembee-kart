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

  // Suggestions Data
  const demoSuggestions = [
    "black tshirt",
    "oversize tshirt",
    "hoodie",
    "anime tshirt",
    "couple tshirt",
    "nike shoes",
    "jeans for men"
  ];

  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      return;
    }
    const filtered = demoSuggestions.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [search]);

  // UPGRADED VOICE FUNCTION
  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported 😢 (Use Chrome)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    setListening(true);

    try {
      recognition.start();
    } catch (err) {
      console.log("Already started");
    }

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      setSearch(text.toLowerCase());
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <div className="w-full relative px-1">
      {/* MAIN SEARCH BOX 
          - z-index set to ensure it stays above other content but below popups
      */}
      <div 
        className={`flex items-center bg-white rounded-[22px] h-12 border transition-all duration-300 overflow-hidden shadow-sm
        ${focused ? "border-green-500 ring-2 ring-green-50" : "border-gray-200"}`}
      >
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={18} strokeWidth={2.5} />
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search for products, brands..."
          className="flex-1 outline-none text-[13px] font-medium bg-transparent text-gray-800 placeholder:text-gray-400 h-full"
        />

        <div className="flex items-center gap-3 pr-4 ml-2">
          {search && (
            <X 
              size={16} 
              className="text-gray-400 cursor-pointer" 
              onClick={() => setSearch("")} 
            />
          )}
          <Camera 
            size={20} 
            strokeWidth={2} 
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition"
            onClick={() => setShowCameraMsg(true)}
          />
          <div className="h-5 w-[1.5px] bg-gray-200" />
          <button 
            onClick={handleVoice}
            className={`transition active:scale-90 ${listening ? "text-red-500 animate-pulse" : "text-blue-500"}`}
          >
            <Mic size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* SUGGESTIONS PANEL */}
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[80] overflow-hidden animate-in fade-in slide-in-from-top-1">
          {suggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setSearch(item);
                setFocused(false);
              }}
              className="px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition border-b border-gray-50 last:border-0"
            >
              <Search size={14} className="text-gray-300" /> {item}
            </div>
          ))}
        </div>
      )}

      {/* 🎤 LISTENING POPUP 
          - z-[9999] ensures it covers the sticky header
      */}
      {listening && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-6">
          <div className="bg-white rounded-full w-72 h-72 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] border-[12px] border-gray-50 animate-in zoom-in-75 duration-300">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-[1.8]" />
              <div className="relative bg-red-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg">
                🎤
              </div>
            </div>

            <p className="font-black text-xl text-gray-900 tracking-tight">Listening...</p>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
              Speak Now
            </p>

            <button
              onClick={() => setListening(false)}
              className="mt-8 px-6 py-2 bg-gray-100 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 📷 CAMERA POPUP */}
      {showCameraMsg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95">
            <div className="text-5xl mb-5">📸</div>
            <p className="text-xl font-black text-gray-900 leading-tight">Coming Soon!</p>
            <p className="text-sm text-gray-500 mt-3 font-medium px-2">
              Search by image feature is under development for Jembee Kart.
            </p>
            <button
              onClick={() => setShowCameraMsg(false)}
              className="mt-8 w-full py-4 bg-gray-900 text-white rounded-[20px] font-bold text-sm active:scale-95 transition shadow-lg shadow-gray-200"
            >
              Okay, Thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
