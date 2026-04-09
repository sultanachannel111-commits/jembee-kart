"use client";

import { Search, Mic, Camera, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({ search, setSearch }: Props) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [showCameraMsg, setShowCameraMsg] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Next.js Hydration Fix: Portal sirf client-side par hi render ho sakta hai
  useEffect(() => {
    setMounted(true);
  }, []);

  const demoSuggestions = [
    "black tshirt",
    "oversize tshirt",
    "hoodie",
    "anime tshirt",
    "nike shoes"
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

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported 😢 (Use Chrome)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      setSearch(event.results[0][0].transcript.toLowerCase());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="w-full relative px-2">
      {/* --- SEARCH INPUT BOX --- */}
      <div 
        className={`flex items-center bg-white rounded-[22px] h-12 border transition-all duration-300 shadow-sm
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
          placeholder="Search for products..."
          className="flex-1 outline-none text-[13px] font-medium bg-transparent text-gray-800 h-full"
        />

        <div className="flex items-center gap-3 pr-4 ml-2">
          {search && (
            <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearch("")} />
          )}
          <Camera 
            size={20} 
            className="text-gray-400 cursor-pointer hover:text-gray-600"
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

      {/* --- SUGGESTIONS PANEL --- */}
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[80] overflow-hidden">
          {suggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => { setSearch(item); setFocused(false); }}
              className="px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <Search size={14} className="text-gray-300" /> {item}
            </div>
          ))}
        </div>
      )}

      {/* --- 🎤 LISTENING OVERLAY (PORTAL SE FIX KIYA HAI) --- */}
      {listening && mounted && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[999999]">
          <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-300">
            {/* Pulsing Mic */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-[2]" />
              <div className="relative bg-white text-blue-600 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl">
                🎤
              </div>
            </div>

            <h2 className="text-white text-3xl font-black tracking-tight mb-2">Listening...</h2>
            <p className="text-white/60 text-sm font-bold uppercase tracking-[4px] mb-12">Speak product name</p>

            <button 
              onClick={() => setListening(false)}
              className="px-12 py-4 bg-red-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* --- 📷 CAMERA COMING SOON (PORTAL) --- */}
      {showCameraMsg && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95">
            <div className="text-6xl mb-6">📸</div>
            <p className="text-2xl font-black text-gray-900 leading-tight">Coming Soon!</p>
            <p className="text-sm text-gray-500 mt-3 font-medium">Search by image is coming soon to Jembee Kart.</p>
            <button 
              onClick={() => setShowCameraMsg(false)}
              className="mt-8 w-full py-4 bg-black text-white rounded-[20px] font-bold text-sm shadow-lg active:scale-95 transition"
            >
              Okay, Thanks!
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
