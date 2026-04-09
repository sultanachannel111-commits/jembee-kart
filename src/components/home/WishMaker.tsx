"use client";

import { useRouter } from "next/navigation";

export default function WishMaker() {
  const router = useRouter();

  const items = [
    { name: "New Year", emoji: "🎉" },
    { name: "Diwali", emoji: "🪔" },
    { name: "Birthday", emoji: "🎂" },
    { name: "Love", emoji: "❤️" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => router.push(`/create/${item.name.toLowerCase()}`)}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="w-[65px] h-[65px] rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-2xl text-white shadow">
            {item.emoji}
          </div>

          <p className="text-xs mt-1 font-medium">
            {item.name}
          </p>
        </div>
      ))}
    </div>
  );
}
