"use client";

import { Search, Mic, Camera, X, ArrowRight, Clock } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Fuse from "fuse.js";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({ search, setSearch }: Props) {

  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [showCameraMsg, setShowCameraMsg] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);

    // 🔥 load recent search
    const saved = localStorage.getItem("recent-search");
    if (saved) setRecent(JSON.parse(saved));
  }, []);

  // 🔥 DATA (you can replace with API later)
  const searchData = [
    { name: "Oversize T-shirt", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b" },
    { name: "Black T-shirt", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c" },
    { name: "Hoodies & Jackets", image: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb" },
    { name: "Headwear", image: "https://images.unsplash.com/photo-1516826957135-700dedea698c" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1585386959984-a41552231658" },
  ];

  // 🔥 FUZZY SEARCH
  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      threshold: 0.4,
      keys: ["name"],
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

  // 🔥 SAVE RECENT
  const saveRecent = (value: string) => {
    let updated = [value, ...recent.filter(r => r !== value)].slice(0,5);
    setRecent(updated);
    localStorage.setItem("recent-search", JSON.stringify(updated));
  };

  // 🎤 VOICE
  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return alert("Use Chrome for voice search");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setSearch(text);
      saveRecent(text);
      setFocused(false);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

  return (
    <div className="w-full relative px-2">

      {/* 🔍 INPUT */}
      <div
        className={`flex items-center bg-white rounded-[24px] h-[52px] border transition-all duration-300 shadow-sm
        ${focused ? "border-green-500 ring-[4px] ring-green-50" : "border-gray-200"}`}
      >

        <div className="pl-5 pr-3 text-gray-400">
          <Search size={20}/>
        </div>

        <input
          ref={inputRef}
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setTimeout(()=>setFocused(false),200)}
          placeholder="Search products..."
          className="flex-1 outline-none text-sm font-semibold bg-transparent"
        />

        <div className="flex items-center gap-3 pr-5">

          {search && (
            <X
              size={18}
              className="cursor-pointer"
              onClick={()=>setSearch("")}
            />
          )}

          <Camera size={20} onClick={()=>setShowCameraMsg(true)} className="cursor-pointer"/>

          <Mic
            size={20}
            onClick={handleVoice}
            className={`cursor-pointer ${listening ? "text-red-500" : ""}`}
          />

        </div>
      </div>

      {/* 🔥 DROPDOWN */}
      {focused && (
        <div className="absolute left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* 🔥 RECENT */}
          {!search && recent.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-2">Recent</p>
              {recent.map((item,i)=>(
                <div
                  key={i}
                  onMouseDown={()=>{setSearch(item);}}
                  className="flex items-center gap-2 py-2 cursor-pointer"
                >
                  <Clock size={14}/>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* 🔥 SUGGESTIONS */}
          {suggestions.map((item,i)=>(
            <div
              key={i}
              onMouseDown={()=>{
                setSearch(item.name);
                saveRecent(item.name);
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            >

              <img
                src={item.image}
                className="w-10 h-10 rounded object-cover"
              />

              <span className="text-sm font-medium">{item.name}</span>

              <ArrowRight size={14} className="ml-auto"/>

            </div>
          ))}

        </div>
      )}

      {/* 🎤 VOICE UI */}
      {listening && mounted && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🎤</div>
            <p>Listening...</p>
          </div>
        </div>,
        document.body
      )}

      {/* 📸 CAMERA */}
      {showCameraMsg && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-xl text-center">
            <p>📸 Coming Soon</p>
            <button onClick={()=>setShowCameraMsg(false)}>Close</button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
