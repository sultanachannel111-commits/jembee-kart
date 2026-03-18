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

  // 🔥 Demo suggestions
  const demoSuggestions = [
    "black tshirt",
    "oversize tshirt",
    "hoodie",
    "anime tshirt",
    "jeans",
    "shoes"
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

    setTimeout(() => {
      setListening(false);
    }, 3000);
  };

  // 🔥 COLOR DETECTION + SEARCH
  const detectColorAndSearch = (file: File) => {

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

      console.log("Detected Color:", r, g, b);

      // 🔥 COLOR → KEYWORD
      let keyword = "";

      if (r > 150 && g < 100 && b < 100) keyword = "red tshirt";
      else if (g > 150 && r < 100) keyword = "green tshirt";
      else if (b > 150) keyword = "blue tshirt";
      else if (r < 80 && g < 80 && b < 80) keyword = "black tshirt";
      else keyword = "tshirt";

      // 🔥 SEARCH APPLY
      setSearch(keyword);

      alert("Searching: " + keyword);
    };
  };

  // 📷 CAMERA FUNCTION
  const handleCamera = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = (e: any) => {
      const file = e.target.files[0];

      if (file) {
        console.log("Image selected:", file);

        // 🔥 AUTO SEARCH
        detectColorAndSearch(file);
      }
    };

    input.click();
  };

  return (
    <div className="sticky top-[72px] z-[60] bg-[#eaf3ef] px-4 py-2">

      <div className="relative">

        {/* 🔥 Search Box */}
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
            onClick={handleCamera}
            className="text-gray-500 cursor-pointer"
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

        {/* 🔥 Suggestions */}
        {focused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border z-50">

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
