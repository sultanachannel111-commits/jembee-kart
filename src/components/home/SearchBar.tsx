"use client";

import { Search, Mic, Camera, X, ArrowUpLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const demoSuggestions = [
    "black tshirt",
    "oversize tshirt",
    "hoodie",
    "anime tshirt",
    "nike shoes",
    "denim jacket",
    "cargo pants"
  ];

  // --- Scroll Logic ---
  const scrollToProducts = () => {
    const element = document.getElementById("product-list");
    if (element) {
      const offset = 80; // Header height ke liye space
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    setSearch(value);
    setFocused(false);
    inputRef.current?.blur();
    
    // Instant scroll to results
    setTimeout(scrollToProducts, 100);
  };

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = demoSuggestions.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 6));
  }, [search]);

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript.toLowerCase();
      handleSearch(result);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="w-full relative px-2 py-2">
      {/* --- BACKGROUND OVERLAY (For Focus) --- */}
      {focused && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[70] transition-all" />
      )}

      {/* --- SEARCH INPUT BOX --- */}
      <div 
        className={`relative flex items-center bg-white rounded-[20px] h-12 border transition-all duration-300 z-[80]
        ${focused ? "border-green-500 shadow-lg scale-[1.01]" : "border-gray-200 shadow-sm"}`}
      >
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={18} strokeWidth={2.5} className={focused ? "text-green-500" : ""} />
        </div>

        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(search)}
          placeholder="Search Jembee Kart..."
          className="flex-1 outline-none text-[15px] font-medium bg-transparent text-gray-800 h-full w-full"
        />

        <div className="flex items-center gap-3 pr-3 ml-2">
          {search && (
            <button onClick={() => setSearch("")} className="p-1 hover:bg-gray-100 rounded-full transition">
              <X size={16} className="text-gray-500" />
            </button>
          )}
          
          <button 
            onClick={() => setShowCameraMsg(true)}
            className="text-gray-400 hover:text-gray-600 active:scale-90 transition"
          >
            <Camera size={20} />
          </button>

          <div className="h-5 w-[1px] bg-gray-200 mx-1" />

          <button 
            onClick={handleVoice}
            className={`p-2 rounded-full transition active:scale-95 
            ${listening ? "bg-red-50 text-red-500 animate-pulse" : "text-blue-600 hover:bg-blue-50"}`}
          >
            <Mic size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* --- SUGGESTIONS PANEL --- */}
      {focused && suggestions.length > 0 && (
        <div className="absolute left-2 right-2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[80] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-50 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-4">
            Quick Suggestions
          </div>
          {suggestions.map((item, i) => (
            <div
              key={i}
              onMouseDown={() => handleSearch(item)}
              className="px-5 py-3.5 text-sm text-gray-700 hover:bg-green-50 flex items-center justify-between group cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search size={14} className="text-gray-300 group-hover:text-green-500" />
                <span className="font-medium">{item}</span>
              </div>
              <ArrowUpLeft size={14} className="text-gray-300 group-hover:text-green-500" />
            </div>
          ))}
        </div>
      )}

      {/* --- PORTALS (Voice & Camera) --- */}
      {listening && mounted && createPortal(
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-[1000] animate-in fade-in duration-300">
           <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                <div className="absolute inset-4 bg-blue-500/10 rounded-full animate-pulse" />
                <div className="relative bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl">
                  <Mic size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Listening...</h2>
              <p className="text-gray-500 font-medium">Try saying "Oversize T-shirt"</p>
              <button 
                onClick={() => setListening(false)}
                className="mt-16 px-8 py-3 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition"
              >
                Cancel Search
              </button>
           </div>
        </div>,
        document.body
      )}

      {showCameraMsg && mounted && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-6">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl scale-up-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Visual Search</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">Soon you'll be able to find products by just uploading a photo!</p>
            <button 
              onClick={() => setShowCameraMsg(false)}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold active:scale-95 transition"
            >
              Got it!
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
