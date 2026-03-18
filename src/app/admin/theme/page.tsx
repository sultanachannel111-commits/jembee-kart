"use client";

import { useEffect, useState } from "react";
import { getTheme, saveTheme } from "@/services/themeService";

export default function ThemePage() {

  const [theme, setTheme] = useState<any>({
    background: "#ffffff",
    header: "#ec4899",
    button: "#ec4899",
    card: "#ffffff",
    statusBar: "#000000",

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
      if (t) setTheme({ ...theme, ...t });
      setLoading(false);
    }
    load();
  }, []);

  /* AUTO TEXT COLOR */
  function getTextColor(bg: string) {
    const c = bg.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  /* AUTO PRESETS */
  function applyPreset(type: string) {
    if (type === "dark") {
      setTheme({
        ...theme,
        background: "#000000",
        card: "#1f1f1f",
        header: "#111827",
        button: "#2563eb",
        statusBar: "#000000",
        mode: "dark"
      });
    }

    if (type === "pink") {
      setTheme({
        ...theme,
        background: "#fff1f2",
        card: "#ffffff",
        header: "#ec4899",
        button: "#ec4899",
        statusBar: "#ec4899",
        mode: "light"
      });
    }

    if (type === "green") {
      setTheme({
        ...theme,
        background: "#ecfdf5",
        card: "#ffffff",
        header: "#065f46",
        button: "#10b981",
        statusBar: "#065f46",
        mode: "light"
      });
    }
  }

  /* SAVE */
  async function save() {
    await saveTheme(theme);
    alert("Theme Saved 🔥");
  }

  /* EXPORT */
  function exportTheme() {
    const data = JSON.stringify(theme);
    navigator.clipboard.writeText(data);
    alert("Theme copied!");
  }

  /* IMPORT */
  function importTheme(e: any) {
    try {
      const data = JSON.parse(e.target.value);
      setTheme(data);
    } catch {
      alert("Invalid JSON");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold">🔥 PRO THEME BUILDER</h1>

      {/* PRESETS */}
      <div className="flex gap-3">
        <button onClick={() => applyPreset("dark")} className="bg-black text-white px-4 py-2 rounded">Dark</button>
        <button onClick={() => applyPreset("pink")} className="bg-pink-500 text-white px-4 py-2 rounded">Pink</button>
        <button onClick={() => applyPreset("green")} className="bg-green-600 text-white px-4 py-2 rounded">Green</button>
      </div>

      {/* GRADIENT TOGGLE */}
      <div>
        <label className="mr-2">Gradient</label>
        <input
          type="checkbox"
          checked={theme.gradient}
          onChange={(e) => setTheme({ ...theme, gradient: e.target.checked })}
        />
      </div>

      {theme.gradient && (
        <div className="flex gap-4">
          <input type="color" value={theme.gradientFrom}
            onChange={(e) => setTheme({ ...theme, gradientFrom: e.target.value })} />
          <input type="color" value={theme.gradientTo}
            onChange={(e) => setTheme({ ...theme, gradientTo: e.target.value })} />
        </div>
      )}

      {/* DAY NIGHT */}
      <button
        onClick={() =>
          setTheme({
            ...theme,
            mode: theme.mode === "dark" ? "light" : "dark"
          })
        }
        className="px-4 py-2 bg-gray-800 text-white rounded"
      >
        Toggle {theme.mode === "dark" ? "Light" : "Dark"}
      </button>

      {/* PREVIEW */}
      <div
        className="p-6 rounded-xl shadow"
        style={{
          background: theme.gradient
            ? `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`
            : theme.background
        }}
      >

        <div
          className="p-4 rounded mb-4"
          style={{
            background: theme.header,
            color: getTextColor(theme.header)
          }}
        >
          JembeeKart
        </div>

        <div
          className="p-4 rounded shadow"
          style={{ background: theme.card }}
        >
          Sample Product

          <button
            className="mt-2 px-4 py-2 rounded"
            style={{
              background: theme.button,
              color: getTextColor(theme.button)
            }}
          >
            Buy Now
          </button>
        </div>

      </div>

      {/* COLORS */}
      <div className="grid md:grid-cols-2 gap-4">

        {["background", "header", "button", "card", "statusBar"].map((key) => (
          <div key={key} className="bg-white p-4 rounded shadow">

            <p className="mb-2 capitalize">{key}</p>

            <input
              type="color"
              value={theme[key]}
              onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
            />

            <input
              type="text"
              value={theme[key]}
              onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
              className="block mt-2 border px-2 py-1 w-full"
            />

          </div>
        ))}

      </div>

      {/* EXPORT IMPORT */}
      <div className="space-y-2">
        <button onClick={exportTheme} className="bg-blue-600 text-white px-4 py-2 rounded">
          Export Theme
        </button>

        <textarea
          placeholder="Paste theme JSON here..."
          onChange={importTheme}
          className="w-full border p-2"
        />
      </div>

      {/* SAVE */}
      <button onClick={save} className="bg-purple-600 text-white px-6 py-2 rounded">
        Save Theme
      </button>

    </div>
  );
}
