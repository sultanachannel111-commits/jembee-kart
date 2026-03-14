"use client";

import { useState } from "react";
import { Search, Mic } from "lucide-react";
import { searchProducts } from "@/lib/searchProducts";
import { trendingSearch } from "@/lib/trendingSearch";
import { startVoiceSearch } from "@/lib/voiceSearch";

type Props = {
  setProducts: (data: any) => void;
};

export default function SearchBar({ setProducts }: Props) {

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const runSearch = async (value: string) => {

    if (!value.trim()) {
      setSuggestions(trendingSearch);
      return;
    }

    const filtered = trendingSearch.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);

    const results = await searchProducts(value);

    setProducts(results);

  };

  const handleChange = async (value: string) => {

    setSearch(value);

    runSearch(value);

  };

  const handleVoice = () => {

    startVoiceSearch(async (voiceText: string) => {

      setSearch(voiceText);

      runSearch(voiceText);

    });

  };

  return (

    <div className="relative">

      <div className="bg-white shadow-sm rounded-full px-4 py-2 flex items-center gap-2">

        <Search size={18} />

        <input
          value={search}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search products..."
          className="flex-1 outline-none text-sm"
        />

        <Mic
          size={20}
          onClick={handleVoice}
          className="cursor-pointer text-gray-600"
        />

      </div>

      {suggestions.length > 0 && (

        <div className="absolute w-full bg-white shadow-lg rounded-lg mt-1 z-50">

          {suggestions.map((item, i) => (

            <div
              key={i}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleChange(item)}
            >
              {item}
            </div>

          ))}

        </div>

      )}

    </div>

  );

}
