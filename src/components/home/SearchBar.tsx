"use client";

import { Search, Mic, Camera } from "lucide-react";
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

  // 🔥 Suggestions Logic
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

  // 🎤 UPGRADED VOICE FUNCTION
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
    <div className="w-full relative">
      {/* MAIN SEARCH BOX 
         - rounded-[20px]: Isse corners bilkul smooth round honge (Nokila nahi lagega)
         - overflow-hidden: Artifacts hatane ke liye
      */}
      <div 
        className={`flex items-center bg-gray-50 rounded-[20px] h-12 border transition-all duration-300 overflow-hidden
        ${focused ? "border-green-500 shadow-md ring-1 ring-green-100" : "border-gray-200 shadow-sm"}`}
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
          {/* Camera Button */}
          <button 
            onClick={() => setShowCameraMsg(true)}
            className="text-gray-400 hover:text-gray-600 transition active:scale-90"
          >
            <Camera size={20} strokeWidth={2} />
          </button>
          
          {/* Mic Button with Divider */}
          <button 
            onClick={handleVoice}
            className={`pl-3 border-l border-gray-300 transition active:scale-90
            ${listening ? "text-red-500 animate-pulse" : "text-blue-500"}`}
          >
            <Mic size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 🔥 SUGGESTIONS - Rounded & Clean */}
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[70] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {suggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setSearch(item);
                setFocused(false);
              }}
              className="px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition"
            >
              <span className="text-gray-300">🔍</span> {item}
            </div>
          ))}
        </div>
      )}

      {/* 🎤 LISTENING OVERLAY - FULLY ROUNDED CENTER CARD */}
      {listening && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999] p-6">
          <div className="bg-white rounded-full w-72 h-72 flex flex-col items-center justify-center shadow-2xl border-[10px] border-gray-50 animate-in zoom-in-90 duration-300">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150" />
              <div className="relative bg-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg">
                🎤
              </div>
            </div>

            <p className="font-black text-xl text-gray-900 tracking-tight">Listening...</p>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Speak product name
            </p>

            <button
              onClick={() => setListening(false)}
              className="mt-6 px-5 py-2 bg-gray-100 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 📷 CAMERA COMING SOON - CLEAN POPUP */}
      {showCameraMsg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-6">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-lg font-bold text-gray-900">Visual Search</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Camera search feature is coming soon to Jembee Kart!
            </p>
            <button
              onClick={() => setShowCameraMsg(false)}
              className="mt-6 w-full py-3 bg-black text-white rounded-2xl font-bold text-sm active:scale-95 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
