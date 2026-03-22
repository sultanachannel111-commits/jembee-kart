"use client";

import { Search, Mic, Camera } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({
  search,
  setSearch
}: Props) {

  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [showCameraMsg, setShowCameraMsg] = useState(false);

  // 🔥 Suggestions
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

  // 🎤 REAL VOICE FUNCTION (UPGRADED)
  const handleVoice = () => {

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported 😢 (Use Chrome)");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN"; // Hindi + English mix
    recognition.continuous = false;
    recognition.interimResults = true; // 🔥 live typing

    setListening(true);

    try {
      recognition.start();
    } catch (err) {
      console.log("Already started");
    }

    // 🔥 LIVE RESULT (typing like Google)
    recognition.onresult = (event: any) => {
      let text = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }

      setSearch(text.toLowerCase());
    };

    // 🔥 ERROR HANDLE
    recognition.onerror = (event: any) => {
      console.log("Voice error:", event.error);
      setListening(false);
    };

    // 🔥 END
    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div className="sticky top-[72px] z-[60] bg-[#eaf3ef] px-4 py-2">

      <div className="relative">

        {/* 🔥 SEARCH BOX */}
        <div className={`bg-white border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm transition 
        ${focused ? "ring-2 ring-green-500" : "border-gray-300"}`}>

          <Search size={18} className="text-gray-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search for products, brands and more"
            className="flex-1 outline-none text-sm bg-transparent"
          />

          {/* 📷 Camera */}
          <Camera
            size={18}
            className="text-gray-500 cursor-pointer"
            onClick={() => setShowCameraMsg(true)}
          />

          {/* 🎤 Mic */}
          <Mic
            size={20}
            onClick={handleVoice}
            className={`cursor-pointer transition ${
              listening
                ? "text-red-500 animate-pulse scale-110"
                : "text-gray-600"
            }`}
          />

        </div>

        {/* 🔥 Suggestions */}
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">

            {suggestions.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setSearch(item);
                  setFocused(false);
                }}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                🔍 {item}
              </div>
            ))}

          </div>
        )}

      </div>

      {/* 🎤 LISTENING POPUP (PREMIUM) */}
      {listening && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">

          <div className="bg-white rounded-2xl p-6 text-center shadow-2xl w-[85%] max-w-sm">

            <div className="text-5xl animate-pulse">🎤</div>

            <p className="mt-3 font-semibold text-lg">
              Listening...
            </p>

            <p className="text-sm text-gray-500">
              Speak your product name
            </p>

            {/* 🔥 cancel button */}
            <button
              onClick={() => setListening(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg w-full"
            >
              Stop
            </button>

          </div>

        </div>
      )}

      {/* 📷 CAMERA POPUP */}
      {showCameraMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">

          <div className="bg-white rounded-xl p-5 w-[85%] max-w-sm text-center shadow-xl">

            <p className="text-lg font-semibold">
              Camera coming soon 📷
            </p>

            <button
              onClick={() => setShowCameraMsg(false)}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg w-full"
            >
              OK
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
