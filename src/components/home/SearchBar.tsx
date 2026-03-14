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

  const handleChange = (value: string) => {
    setSearch(value);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      setSearch(search);
    }
  };

  return (

    <div className="bg-white shadow-sm rounded-full px-4 py-2 flex items-center gap-2">

      <Search size={18} />

      <input
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        className="flex-1 outline-none text-sm"
      />

      <Mic
        size={20}
        onClick={startVoice}
        className="cursor-pointer text-gray-600"
      />

    </div>

  );

}
