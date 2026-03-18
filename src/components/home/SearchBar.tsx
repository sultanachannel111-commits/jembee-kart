"use client";

import { Search, Mic, Camera } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  startVoice: () => void;
};

export default function SearchBar({
  search,
  setSearch,
  startVoice
}: Props) {

  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [listening, setListening] = useState(false);

  // 🔥 Dummy suggestions (replace later with real data)
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

  const handleVoice = () => {
    setListening(true);
    startVoice();

    setTimeout(() => {
      setListening(false);
    }, 3000);
  };

  return (
    <div className="sticky top-[72px] z-[60] bg-[#eaf3ef] px-4 py-2">

      {/* 🔥 Search Box */}
      <div className="relative">

        <div className={`bg-white border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm transition 
        ${focused ? "ring-2 ring-green-500" : "border-gray-300"}`}>

          {/* 🔍 */}
          <Search size={18} className="text-gray-500" />

          {/* INPUT */}
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
            onClick={() => alert("Camera scan coming soon 📷")}
          />

          {/* 🎤 Mic */}
          <Mic
            size={20}
            onClick={handleVoice}
            className={`cursor-pointer ${
              listening ? "text-red-500 animate-pulse" : "text-gray-600"
            }`}
          />

        </div>

        {/* 🔥 Suggestions Dropdown */}
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">

            {suggestions.map((item, i) => (
              <div
                key={i}
                onClick={() => setSearch(item)}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                🔍 {item}
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}
