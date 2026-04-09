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

  const cardRef = useRef<any>(null);
  const audioRef = useRef<any>(null);

  // ================= LOAD =================
  useEffect(() => {
    load();

    // 🎆 CONFETTI
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
      });
    }, 800);

  }, []);

  const load = async () => {
    const ref = doc(db, "wishes", id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setData(snap.data());
    }
  };

  // ================= DOWNLOAD =================
  const downloadImage = async () => {
    const canvas = await html2canvas(cardRef.current);
    const link = document.createElement("a");
    link.download = "wish.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // ================= PLAY MUSIC =================
  const playMusic = () => {
    audioRef.current.play();
  };

  if (!data) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative">

      {/* 🎵 MUSIC */}
      <audio ref={audioRef} src="/music.mp3" loop />

      <button
        onClick={playMusic}
        className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded"
      >
        🔊 Play Music
      </button>

      {/* 🎥 REEL STYLE CARD */}
      <div
        ref={cardRef}
        className="w-full h-screen flex flex-col items-center justify-center text-center px-4"
      >

        {/* 🎬 ANIMATION */}
        <ThemeUI theme={data.theme} name={data.from} />

        {/* MESSAGE */}
        <h1 className="text-4xl font-bold mt-4 animate-pulse">
          {data.message}
        </h1>

        {/* FROM */}
        <p className="mt-4 text-lg">
          From: <span className="text-yellow-400">{data.from}</span>
        </p>

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

/* ================= THEME ================= */

function ThemeUI({ theme, name }: any) {

  if (theme === "birthday") {
    return (
      <div className="text-8xl animate-bounce">
        🎂🎈🎉
      </div>
    );
  }

  if (theme === "love") {
    return (
      <div className="text-8xl animate-pulse">
        ❤️💖💘
      </div>
    );
  }

  if (theme === "diwali") {
    return (
      <div className="text-8xl animate-pulse">
        🪔✨🎆
      </div>
    );
  }

  if (theme === "independence") {
    return (
      <div className="flex flex-col items-center">
        <div className="text-8xl animate-[wave_2s_infinite]">🇮🇳</div>

        {/* 🔥 NAME ON FLAG */}
        <h2 className="text-2xl mt-2 animate-pulse text-orange-400">
          {name}
        </h2>
      </div>
    );
  }

  // DEFAULT
  return (
    <div className="text-6xl animate-pulse">
      🎉 {theme} 🎉
    </div>
  );
}
