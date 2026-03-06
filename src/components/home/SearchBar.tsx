"use client";

import { Search, Mic } from "lucide-react";
import { startVoiceSearch } from "@/services/voiceSearchService";

export default function SearchBar({
search,
setSearch
}:any){

return(

<div className="bg-white shadow-sm rounded-full px-4 py-2 flex items-center gap-2">

<Search size={18}/>

<input
type="text"
placeholder="Search products..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="flex-1 outline-none"
/>

<Mic
size={20}
className="cursor-pointer text-gray-600"
onClick={()=>startVoiceSearch(setSearch)}
/>

</div>

);

}
