"use client";

import { useEffect, useState } from "react";
import { getTheme, saveTheme } from "@/services/themeService";
import toast from "react-hot-toast";

export default function ThemePage() {
  const [theme, setTheme] = useState<any>({
    background: "#0f172a",
    gradient: true,
    gradientFrom: "#0f172a",
    gradientTo: "#020617",
    header: "#020617",
    headerText: "#ffffff",
    searchBg: "#ffffff20",
    searchText: "#ffffff",
    searchIcon: "#ffffff",
    trendingBg: "#ffffff10",
    trendingText: "#ffffff",
    trendingChipBg: "#10b981",
    trendingChipText: "#000000",
    categoryColor: "#10b981",
    categoryTextColor: "#ffffff",
    categoryGradient: true,
    categoryGradientFrom: "#6366f1",
    categoryGradientTo: "#ec4899",
    cardBg: "#ffffff10",
    cardText: "#ffffff",
    priceColor: "#10b981",
    button: "#6366f1",
    buttonText: "#ffffff",
    bottomNavBg: "#020617",
    bottomNavActive: "#10b981",
    fabBg: "#10b981",
    fabGlow: "#10b981"
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const t: any = await getTheme();
      if (t) setTheme((prev: any) => ({ ...prev, ...t }));
      setLoading(false);
    }
    load();
  }, []);

  /* 🔥 AUTO TEXT COLOR LOGIC */
  function getTextColor(bg: string) {
    if (!bg || bg.startsWith("rgba")) return "#ffffff";
    const c = bg.replace("#", "");
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  /* 🔥 PRESETS */
  const applyPreset = (type: string) => {
    let newTheme = { ...theme };
    if (type === "luxury") {
      newTheme = { ...theme, background: "#020617", gradientTo: "#0f172a", button: "#f59e0b", categoryGradientFrom: "#f59e0b", priceColor: "#f59e0b" };
    } else if (type === "green") {
      newTheme = { ...theme, background: "#ecfdf5", header: "#065f46", button: "#10b981", cardText: "#000000", priceColor: "#10b981", gradient: false };
    } else if (type === "neon") {
      newTheme = { ...theme, background: "#000000", button: "#ccff00", priceColor: "#ccff00", fabBg: "#ccff00" };
    }
    setTheme(newTheme);
    toast.success(`${type} Preset Applied!`);
  };

  async function save() {
    try {
      await saveTheme(theme);
      toast.success("Theme Applied to Live App! 🚀");
    } catch (e) {
      toast.error("Save failed!");
    }
  }

  if (loading) return <div className="p-10 font-bold text-center">Loading Theme Engine...</div>;

  const ColorInput = ({ label, id }: { label: string, id: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <input 
          type="color" 
          value={theme[id]} 
          onChange={(e) => setTheme({ ...theme, [id]: e.target.value })}
          className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
        />
        <input 
          type="text" 
          value={theme[id]} 
          onChange={(e) => setTheme({ ...theme, [id]: e.target.value })}
          className="text-[10px] font-mono border rounded px-1 w-16"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">THEME BUILDER</h1>
            <p className="text-xs text-slate-400 font-bold">CUSTOMIZE JEMBEEKART VISUALS</p>
          </div>
          <button onClick={save} className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase shadow-lg shadow-purple-200 active:scale-95 transition-all">
            Save & Publish
          </button>
        </header>

        {/* PRESETS */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {["luxury", "glass", "green", "neon"].map(p => (
            <button key={p} onClick={() => applyPreset(p)} className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase hover:bg-slate-200 transition-all">
              {p} Mode
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* SECTION: BACKGROUND */}
          <div className="space-y-4">
            <h2 className="font-black text-xs text-purple-600 uppercase tracking-widest border-b pb-2">Layout & BG</h2>
            <ColorInput label="Main Background" id="background" />
            <ColorInput label="Gradient From" id="gradientFrom" />
            <ColorInput label="Gradient To" id="gradientTo" />
            <div className="flex items-center gap-2 px-3">
              <input type="checkbox" checked={theme.gradient} onChange={(e) => setTheme({...theme, gradient: e.target.checked})} />
              <span className="text-xs font-bold text-slate-500">Enable Background Gradient</span>
            </div>
          </div>

          {/* SECTION: COMPONENTS */}
          <div className="space-y-4">
            <h2 className="font-black text-xs text-purple-600 uppercase tracking-widest border-b pb-2">Elements</h2>
            <ColorInput label="Header Color" id="header" />
            <ColorInput label="Button Color" id="button" />
            <ColorInput label="Price Text" id="priceColor" />
            <ColorInput label="Category BG" id="categoryColor" />
            <button 
              onClick={() => setTheme({ ...theme, categoryTextColor: getTextColor(theme.categoryColor) })}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase"
            >
              Auto-Fix Category Contrast
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW BOX */}
        <div className="mt-12 p-6 rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center">
          <p className="text-[10px] font-black text-slate-300 uppercase mb-4">Quick Preview</p>
          <div 
            style={{ backgroundColor: theme.background, color: theme.cardText }}
            className="w-64 h-32 rounded-3xl shadow-xl flex flex-col items-center justify-center p-4"
          >
             <div style={{ backgroundColor: theme.button, color: theme.buttonText }} className="px-4 py-2 rounded-lg text-xs font-bold mb-2">
               Sample Button
             </div>
             <p style={{ color: theme.priceColor }} className="font-black">₹999.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
