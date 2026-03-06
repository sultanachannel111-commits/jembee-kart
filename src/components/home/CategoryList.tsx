"use client";

export default function CategoryList({
categories,
selectedCategory,
setSelectedCategory
}: any){

return(

<div className="flex gap-4 overflow-x-auto py-2">

{categories.map((cat:any)=>(

<div
key={cat.id}
onClick={()=>setSelectedCategory(cat.name)}
className="flex flex-col items-center cursor-pointer min-w-[70px]"
>

<div
className={`w-14 h-14 rounded-full border flex items-center justify-center
${selectedCategory===cat.name ? "border-pink-600" : "border-gray-300"}
`}
>

{cat.image && (
<img
src={cat.image}
className="w-full h-full rounded-full object-cover"
/>
)}

</div>

<span className="text-xs mt-1">
{cat.name}
</span>

</div>

))}

</div>

);

}
