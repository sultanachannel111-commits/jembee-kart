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

  // 🔥 Suggestions
  const demoSuggestions = [
    "black tshirt",
    "white tshirt",
    "red tshirt",
    "hoodie",
    "jeans",
    "black shoes",
    "white shoes",
    "watch"
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

  // 🎤 Voice
  const handleVoice = () => {
    setListening(true);
    startVoice();
    setTimeout(() => setListening(false), 3000);
  };

  // 🔥 FINAL SMART DETECTION (FIXED)
  const detectAndSearch = (file: File) => {

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.src = url;

    img.onload = () => {

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;

      let r = 0, g = 0, b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const total = data.length / 4;

      r = Math.floor(r / total);
      g = Math.floor(g / total);
      b = Math.floor(b / total);

      const ratio = img.width / img.height;
      const brightness = (r + g + b) / 3;

      let keywords: string[] = [];

      // 🎨 COLOR DETECT (IMPROVED)
      if (r > 180 && g < 100 && b < 100) keywords.push("red");
      else if (b > 150 && r < 120) keywords.push("blue");
      else if (g > 150 && r < 120) keywords.push("green");
      else if (r < 80 && g < 80 && b < 80) keywords.push("black");
      else if (r > 200 && g > 200 && b > 200) keywords.push("white");

      // 📦 CATEGORY DETECT (FIXED LOGIC)
      if (ratio > 1.2) {
        keywords.push("tshirt");
      } 
      else if (ratio > 0.8 && ratio <= 1.2) {
        keywords.push("watch");
      } 
      else {
        // 👇 shoes only when dark + vertical
        if (brightness < 120) {
          keywords.push("shoes");
        } else {
          keywords.push("tshirt");
        }
      }

      const finalKeyword = keywords.join(" ");

      console.log("Detected:", finalKeyword);

      // 🔥 APPLY SEARCH
      setSearch(finalKeyword);
      setFocused(false);

      URL.revokeObjectURL(url);
    };
  };

  // 📷 CAMERA
  const handleCamera = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) detectAndSearch(file);
    };

    input.click();
  };

  return (
    <div className="sticky top-[72px] z-[60] bg-[#eaf3ef] px-4 py-2">

      <div className="relative">

        {/* 🔥 SEARCH BOX */}
        <div className={`bg-white border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm 
        ${focused ? "ring-2 ring-green-500" : "border-gray-300"}`}>

          <Search size={18} className="text-gray-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search products, brands and more"
            className="flex-1 outline-none text-sm bg-transparent"
          />

          {/* 📷 CAMERA */}
          <Camera
            size={18}
            onClick={handleCamera}
            className="text-gray-500 cursor-pointer"
          />

          {/* 🎤 MIC */}
          <Mic
            size={20}
            onClick={handleVoice}
            className={`cursor-pointer ${
              listening ? "text-red-500 animate-pulse" : "text-gray-600"
            }`}
          />

        </div>

        {/* 🔥 SUGGESTIONS */}
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border z-50">

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

    </div>
  );
}
