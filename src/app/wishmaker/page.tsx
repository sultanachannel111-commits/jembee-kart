"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function WishMaker() {
  const [theme, setTheme] = useState("birthday");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  // 🔥 DEFAULT THEMES
  const [themes, setThemes] = useState([
    "birthday",
    "love",
    "diwali",
    "eid",
    "ramzan",
    "independence",
    "durga"
  ]);

  // 🔥 CUSTOM THEME INPUT
  const [newTheme, setNewTheme] = useState("");

  // ✅ ADD CUSTOM FESTIVAL
  const addTheme = () => {
    if (!newTheme) return;

    if (themes.includes(newTheme.toLowerCase())) {
      alert("Already exists");
      return;
    }

    setThemes([...themes, newTheme.toLowerCase()]);
    setNewTheme("");
  };

  // ✅ CREATE WISH
  const createWish = async () => {
    if (!message || !name) return alert("Fill all");

    const docRef = await addDoc(collection(db, "wishes"), {
      message,
      theme,
      from: name,
      createdAt: new Date()
    });

    const link = `${window.location.origin}/wish/${docRef.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-purple-200 p-4">

      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-xl">

        <h1 className="text-3xl text-center font-bold mb-4">
          🎁 Create Wish
        </h1>

        {/* NAME */}
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl mb-3"
        />

        {/* MESSAGE */}
        <textarea
          placeholder="Write your wish..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 rounded-xl mb-4"
        />

        {/* 🔥 ADD CUSTOM FESTIVAL */}
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Add festival (ex: holi)"
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            className="flex-1 p-2 rounded-xl"
          />

          <button
            onClick={addTheme}
            className="bg-blue-500 text-white px-3 rounded-xl"
          >
            Add
          </button>
        </div>

        {/* THEMES */}
        <div className="flex gap-2 overflow-x-auto mb-4">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                theme === t ? "bg-black text-white" : "bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* PREVIEW */}
        <ThemeUI theme={theme} />

        <button
          onClick={createWish}
          className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl"
        >
          Share on WhatsApp 🚀
        </button>
      </div>
    </div>
  );
}

/* 🎬 ANIMATION SYSTEM */
function ThemeUI({ theme }: any) {

  // 🎯 CUSTOM THEMES (fallback animation)
  const custom = (
    <div className="text-center text-5xl animate-pulse">
      🎉✨ {theme} ✨🎉
    </div>
  );

  if (theme === "birthday") {
    return <div className="text-6xl text-center animate-bounce">🎂🎈🎉</div>;
  }

  if (theme === "love") {
    return <div className="text-6xl text-center animate-pulse">❤️💖💘</div>;
  }

  if (theme === "diwali") {
    return <div className="text-6xl text-center animate-pulse">🪔✨🎆</div>;
  }

  if (theme === "eid") {
    return <div className="text-6xl text-center animate-bounce">🌙🕌✨</div>;
  }

  if (theme === "ramzan") {
    return <div className="text-6xl text-center animate-pulse">🌙✨🕌</div>;
  }

  if (theme === "independence") {
    return <div className="text-6xl text-center animate-bounce">🇮🇳🇮🇳🇮🇳</div>;
  }

  if (theme === "durga") {
    return <div className="text-6xl text-center animate-pulse">🙏🪔✨</div>;
  }

  // 🔥 CUSTOM FALLBACK
  return custom;
}
