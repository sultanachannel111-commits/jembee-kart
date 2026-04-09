"use client";

import { Search, Mic, Camera, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Fuse from "fuse.js";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- JEMBEE KART CATEGORIES (From Screenshots) ---
  const searchData = [
    "Hoodies & Jackets", "Headwear", "Bottomwear", "T-Shirts", 
    "AOP Apparel", "New Products", "Home & Living", "Accessories", 
    "Pet-Wear", "Trending Now", "Oversize T-shirt", "Black T-shirt"
  ];

  // --- FUZZY SEARCH ENGINE SETUP ---
  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      threshold: 0.4, // Spelling mistake tolerance (0.4 is balanced)
      keys: ["item"],
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const results = fuse.search(search);
    setSuggestions(results.map(r => r.item).slice(0, 6));
  }, [search, fuse]);

  // --- VOICE SEARCH HANDLER ---
  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Chrome browser use karein voice search ke liye!");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      setSearch(event.results[0][0].transcript);
      setFocused(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="w-full relative px-2">
      {/* --- PREMIUM SEARCH INPUT --- */}
      <div 
        className={`flex items-center bg-white rounded-[24px] h-[52px] border transition-all duration-500 shadow-sm
        ${focused ? "border-green-500 ring-[4px] ring-green-50" : "border-gray-200"}`}
      >
        <div className="pl-5 pr-3 text-gray-400">
          <Search size={20} strokeWidth={2.5} />
        </div>

        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 250)}
          placeholder="Search for products, brands and more"
          className="flex-1 outline-none text-[14px] font-semibold bg-transparent text-gray-800 placeholder:text-gray-400 h-full"
        />

        <div className="flex items-center gap-3 pr-5 ml-2">
          {search && (
            <X 
              size={18} 
              className="text-gray-400 cursor-pointer hover:text-red-500 transition" 
              onClick={() => { setSearch(""); inputRef.current?.focus(); }} 
            />
          )}
          <Camera 
            size={22} 
            className="text-gray-400 cursor-pointer hover:text-black transition"
            onClick={() => setShowCameraMsg(true)}
          />
          <div className="h-6 w-[1px] bg-gray-200" />
          <button 
            onClick={handleVoice}
            className={`transition-all active:scale-90 ${listening ? "text-red-500 animate-pulse" : "text-blue-600"}`}
          >
            <Mic size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* --- SMART SUGGESTIONS DROPDOWN --- */}
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-3 bg-white rounded-[24px] shadow-2xl border border-gray-100 z-[100] overflow-hidden">
          <div className="p-2">
            {suggestions.map((item, i) => (
              <div
                key={i}
                onMouseDown={() => { setSearch(item); setFocused(false); }}
                className="group px-4 py-3.5 text-sm text-gray-700 hover:bg-green-50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <Search size={14} className="text-gray-300 group-hover:text-green-600" />
                  <span className="font-medium group-hover:text-green-700">{item}</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-green-600 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- OVERLAYS (Voice & Camera) --- */}
      {listening && mounted && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[999999]">
          <div className="flex flex-col items-center animate-in zoom-in-95">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-[2.5]" />
              <div className="relative bg-white text-blue-600 w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl">🎤</div>
            </div>
            <h2 className="text-white text-3xl font-black mb-10 tracking-tight">Listening...</h2>
            <button onClick={() => setListening(false)} className="px-12 py-4 bg-red-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest">Cancel Search</button>
          </div>
        </div>,
        document.body
      )}

      {showCameraMsg && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999999] p-6 text-center">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
            <div className="text-6xl mb-6">📸</div>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">Coming Soon!</h3>
            <p className="text-gray-500 mt-3 font-medium">Visual search is under development for Jembee Kart.</p>
            <button onClick={() => setShowCameraMsg(false)} className="mt-8 w-full py-4 bg-black text-white rounded-[20px] font-bold active:scale-95 transition-all">Got it!</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
