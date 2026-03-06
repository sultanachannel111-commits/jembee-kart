"use client";

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

  return (

    <div className="bg-white shadow-sm rounded-full px-4 py-2 flex items-center gap-2">

      {/* Search Icon */}
      <Search size={18} />

      {/* Input */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 outline-none text-sm"
      />

      {/* Mic Button */}
      <Mic
        size={20}
        onClick={startVoice}
        className="cursor-pointer text-gray-600 hover:text-black"
      />

    </div>

  );

}
