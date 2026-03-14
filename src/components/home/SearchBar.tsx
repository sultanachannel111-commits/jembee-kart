"use client";

import { useState } from "react";
import { Search, Mic } from "lucide-react";

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

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const baseSuggestions = [
    "t shirt",
    "black t shirt",
    "white t shirt",
    "t shirt m size",
    "t shirt l size",
    "t shirt xl size",
    "oversize t shirt",
    "kids t shirt",
    "black hoodie",
    "hoodie"
  ];

  const handleChange = (value: string) => {

    setSearch(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = baseSuggestions.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
  };

  return (

    <div className="relative">

      {/* Search Bar */}
      <div className="bg-white shadow-sm rounded-full px-4 py-2 flex items-center gap-2">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 outline-none text-sm"
        />

        <Mic
          size={20}
          onClick={startVoice}
          className="cursor-pointer text-gray-600 hover:text-black"
        />

      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (

        <div className="absolute w-full bg-white shadow-lg rounded-lg mt-1 z-50">

          {suggestions.map((item, i) => (

            <div
              key={i}
              onClick={() => {
                setSearch(item);
                setSuggestions([]);
              }}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {item}
            </div>

          ))}

        </div>

      )}

    </div>

  );
}
