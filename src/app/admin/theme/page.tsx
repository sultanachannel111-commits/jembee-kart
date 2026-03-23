"use client";

import { useEffect, useState } from "react";
import { getTheme, saveTheme } from "@/services/themeService";

export default function ThemePage() {

  const [theme, setTheme] = useState<any>({
    background: "#ffffff",
    header: "#065f46",
    button: "#10b981",
    card: "#ffffff",
    statusBar: "#000000",

    // 🔥 CATEGORY COLORS
    categoryColor: "#10b981",
    categoryTextColor: "#ffffff",
    categoryGradient: false,
    categoryGradientFrom: "#10b981",
    categoryGradientTo: "#065f46",

    gradient: false,
    gradientFrom: "#ec4899",
    gradientTo: "#8b5cf6",

    mode: "light"
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
    if (!bg) return "#000";

    const c = bg.replace("#", "");
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  /* 🔥 LUXURY PRESETS */
  function applyPreset(type: string) {

    if (type === "luxury") {
      setTheme({
        ...theme,
        background: "#0f172a",
        card: "#111827",
        header: "#020617",
        button: "#f59e0b",
        categoryColor: "#f59e0b",
        categoryTextColor: "#000000",
        mode: "dark"
      });
    }

    if (type === "gradientLuxury") {
      setTheme({
        ...theme,
        background: "#020617",
        card: "#111827",
        header: "#020617",
        button: "#6366f1",
        categoryGradient: true,
        categoryGradientFrom: "#6366f1",
        categoryGradientTo: "#ec4899",
        categoryTextColor: "#ffffff"
      });
    }

    if (type === "green") {
      setTheme({
        ...theme,
        background: "#ecfdf5",
        header: "#065f46",
        button: "#10b981",
        categoryColor: "#10b981",
        categoryTextColor: "#ffffff"
      });
    }
  }

  /* SAVE */
  async function save() {
    await saveTheme(theme);
    alert("Theme Saved 🔥");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold">🔥 ULTRA THEME BUILDER</h1>

      {/* 🔥 PRESETS */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => applyPreset("luxury")} className="bg-black text-white px-4 py-2 rounded">
          Luxury
        </button>

        <button onClick={() => applyPreset("gradientLuxury")} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded">
          Gradient Luxury
        </button>

        <button onClick={() => applyPreset("green")} className="bg-green-600 text-white px-4 py-2 rounded">
          Green
        </button>
      </div>

      {/* 🔥 CATEGORY SETTINGS */}
      <div className="bg-white p-4 rounded shadow space-y-4">

        <h2 className="font-bold text-lg">Category Design</h2>

        {/* Gradient toggle */}
        <label>
          <input
            type="checkbox"
            checked={theme.categoryGradient}
            onChange={(e) =>
              setTheme({ ...theme, categoryGradient: e.target.checked })
            }
          /> Enable Gradient
        </label>

        {theme.categoryGradient && (
          <div className="flex gap-4">
            <input
              type="color"
              value={theme.categoryGradientFrom}
              onChange={(e) =>
                setTheme({ ...theme, categoryGradientFrom: e.target.value })
              }
            />

            <input
              type="color"
              value={theme.categoryGradientTo}
              onChange={(e) =>
                setTheme({ ...theme, categoryGradientTo: e.target.value })
              }
            />
          </div>
        )}

        {/* Background */}
        <div>
          <p>Category Background</p>
          <input
            type="color"
            value={theme.categoryColor}
            onChange={(e) =>
              setTheme({ ...theme, categoryColor: e.target.value })
            }
          />
        </div>

        {/* TEXT AUTO */}
        <div>
          <p>Category Text</p>
          <input
            type="color"
            value={theme.categoryTextColor}
            onChange={(e) =>
              setTheme({ ...theme, categoryTextColor: e.target.value })
            }
          />

          <button
            onClick={() =>
              setTheme({
                ...theme,
                categoryTextColor: getTextColor(theme.categoryColor)
              })
            }
            className="ml-3 px-3 py-1 bg-gray-200 rounded"
          >
            Auto Text
          </button>
        </div>

      </div>

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
