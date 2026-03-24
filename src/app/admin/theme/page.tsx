"use client";

import { useEffect, useState } from "react";
import { getTheme, saveTheme } from "@/services/themeService";

export default function ThemePage() {

  const [theme, setTheme] = useState<any>({
    // 🌈 BACKGROUND
    background: "#0f172a",
    gradient: true,
    gradientFrom: "#0f172a",
    gradientTo: "#020617",

    // 🔝 HEADER
    header: "#020617",
    headerText: "#ffffff",

    // 🔍 SEARCH
    searchBg: "#ffffff20",
    searchText: "#ffffff",
    searchIcon: "#ffffff",

    // 🔥 TRENDING
    trendingBg: "#ffffff10",
    trendingText: "#ffffff",
    trendingChipBg: "#10b981",
    trendingChipText: "#000000",

    // 🧩 CATEGORY
    categoryColor: "#10b981",
    categoryTextColor: "#ffffff",
    categoryGradient: true,
    categoryGradientFrom: "#6366f1",
    categoryGradientTo: "#ec4899",

    // 🛍 PRODUCT
    cardBg: "#ffffff10",
    cardText: "#ffffff",
    priceColor: "#10b981",

    // 🔘 BUTTON
    button: "#6366f1",
    buttonText: "#ffffff",

    // 📱 BOTTOM NAV
    bottomNavBg: "#020617",
    bottomNavActive: "#10b981",

    // 💬 FLOATING
    fabBg: "#10b981",
    fabGlow: "#10b981"
  });

  const [loading, setLoading] = useState(true);

  /* LOAD */
  useEffect(() => {
    async function load() {
      const t: any = await getTheme();
      if (t) setTheme((prev:any) => ({ ...prev, ...t }));
      setLoading(false);
    }
    load();
  }, []);

  /* 🔥 AUTO TEXT COLOR */
  function getTextColor(bg: string) {
    if (!bg) return "#fff";

    const c = bg.replace("#", "");
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  /* 🔥 PRESETS */
  function applyPreset(type: string) {

    if (type === "luxury") {
      setTheme({
        ...theme,
        background: "#020617",
        gradient: true,
        gradientFrom: "#020617",
        gradientTo: "#0f172a",

        header: "#020617",
        button: "#f59e0b",

        cardBg: "#ffffff10",
        cardText: "#ffffff",

        categoryGradient: true,
        categoryGradientFrom: "#f59e0b",
        categoryGradientTo: "#ef4444",

        priceColor: "#f59e0b",
        fabBg: "#f59e0b",
        fabGlow: "#f59e0b"
      });
    }

    if (type === "glass") {
      setTheme({
        ...theme,
        background: "#0f172a",
        cardBg: "#ffffff10",
        trendingBg: "#ffffff10",
        searchBg: "#ffffff20",
        header: "#020617",
        button: "#6366f1"
      });
    }

    if (type === "green") {
      setTheme({
        ...theme,
        background: "#ecfdf5",
        header: "#065f46",
        button: "#10b981",
        cardBg: "#ffffff",
        cardText: "#000",
        priceColor: "#10b981"
      });
    }
  }

  /* SAVE */
  async function save() {
    await saveTheme(theme);
    alert("🔥 Theme Saved");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">🔥 ULTRA GLASS THEME BUILDER</h1>

      {/* 🔥 PRESETS */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={()=>applyPreset("luxury")} className="bg-black text-white px-4 py-2 rounded">
          Luxury
        </button>

        <button onClick={()=>applyPreset("glass")} className="bg-white/20 text-black px-4 py-2 rounded">
          Glass
        </button>

        <button onClick={()=>applyPreset("green")} className="bg-green-600 text-white px-4 py-2 rounded">
          Green
        </button>
      </div>

      {/* 🔥 ALL COLORS */}
      <div className="grid md:grid-cols-2 gap-4">

        {Object.keys(theme).map((key) => (

          <div key={key} className="bg-white p-4 rounded shadow">

            <p className="mb-2 capitalize">{key}</p>

            {typeof theme[key] === "boolean" ? (
              <input
                type="checkbox"
                checked={theme[key]}
                onChange={(e)=>setTheme({...theme,[key]:e.target.checked})}
              />
            ) : (
              <>
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(e)=>setTheme({...theme,[key]:e.target.value})}
                />

                <input
                  type="text"
                  value={theme[key]}
                  onChange={(e)=>setTheme({...theme,[key]:e.target.value})}
                  className="block mt-2 border px-2 py-1 w-full"
                />
              </>
            )}

          </div>

        ))}

      </div>

      {/* 🔥 AUTO TEXT BUTTON */}
      <button
        onClick={() =>
          setTheme({
            ...theme,
            categoryTextColor: getTextColor(theme.categoryColor)
          })
        }
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Auto Category Text
      </button>

      {/* 🔥 SAVE */}
      <button
        onClick={save}
        className="bg-purple-600 text-white px-6 py-2 rounded"
      >
        Save Theme
      </button>

    </div>
  );
}
