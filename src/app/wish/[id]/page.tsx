"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

export default function WishPage() {

  const { id }: any = useParams();
  const [data, setData] = useState<any>(null);
  const [showGifts, setShowGifts] = useState(true);

  const cardRef = useRef<any>(null);
  const audioRef = useRef<any>(null);

  useEffect(() => {
    load();

    setTimeout(() => {
      confetti({ particleCount: 120, spread: 100 });
    }, 800);
  }, []);

  const load = async () => {
    const ref = doc(db, "wishes", id);
    const snap = await getDoc(ref);
    if (snap.exists()) setData(snap.data());
  };

  const downloadImage = async () => {
    const canvas = await html2canvas(cardRef.current);
    const link = document.createElement("a");
    link.download = "wish.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!data) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative">

      <audio ref={audioRef} src="/music.mp3" loop />

      {/* MAIN */}
      <div
        ref={cardRef}
        className="w-full h-screen flex flex-col items-center justify-center text-center px-4"
      >

        <ThemeUI theme={data.theme} name={data.from} />

        <h1 className="text-4xl font-bold mt-4 animate-pulse">
          {data.message}
        </h1>

        <p className="mt-4 text-lg">
          From: <span className="text-yellow-400">{data.from}</span>
        </p>

        {/* TOGGLE */}
        {data.gifts?.length > 0 && (
          <button
            onClick={() => setShowGifts(!showGifts)}
            className="mt-4 bg-white text-black px-3 py-1 rounded"
          >
            {showGifts ? "Hide Gifts ❌" : "Show Gifts 🎁"}
          </button>
        )}

        {/* GIFTS */}
        {showGifts && data.gifts?.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {data.gifts.map((p: any, i: number) => (
              <div key={i} className="bg-white text-black p-2 rounded-xl">
                <img
                  src={p.image}
                  className="h-24 w-full object-cover rounded"
                />
                <p className="text-xs">{p.name}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* DOWNLOAD */}
      <button
        onClick={downloadImage}
        className="absolute bottom-6 bg-green-500 px-4 py-2 rounded"
      >
        Download 📸
      </button>

    </div>
  );
}

/* THEME */
function ThemeUI({ theme, name }: any) {

  if (theme === "birthday") {
    return <div className="text-8xl animate-bounce">🎂🎈🎉</div>;
  }

  if (theme === "love") {
    return <div className="text-8xl animate-pulse">❤️💖💘</div>;
  }

  if (theme === "diwali") {
    return <div className="text-8xl animate-pulse">🪔✨🎆</div>;
  }

  if (theme === "independence") {
    return (
      <div className="flex flex-col items-center">
        <div className="text-8xl animate-[wave_2s_infinite]">🇮🇳</div>
        <h2 className="text-2xl mt-2 text-orange-400">{name}</h2>
      </div>
    );
  }

  return <div className="text-6xl animate-pulse">🎉 {theme} 🎉</div>;
}
