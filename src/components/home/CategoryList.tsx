"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CategoryList({
  categories,
  selectedCategory,
  setSelectedCategory
}) {

  const [theme, setTheme] = useState<any>({});

  // 🔥 THEME LOAD (ADMIN CONTROL)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "theme"), (snap) => {
      if (snap.exists()) {
        setTheme(snap.data());
      }
    });

    return () => unsub();
  }, []);

  return (
  <div className="flex gap-4 overflow-x-auto py-3 px-2 no-scrollbar overflow-hidden">

      {categories.map((cat) => {

        const isActive = selectedCategory === cat.name;

        // 🔥 PRIORITY (CATEGORY > ADMIN > DEFAULT)
        const bgColor =
          cat.bgColor ||
          theme?.categoryColor ||
          "#22c55e";

        const textColor =
          cat.textColor ||
          theme?.categoryTextColor ||
          "#ffffff";

        // 🔥 GRADIENT SUPPORT
        const gradientBg =
          cat.gradient ||
          (theme?.categoryGradient
            ? `linear-gradient(135deg, ${theme.categoryGradientFrom}, ${theme.categoryGradientTo})`
            : null);

        const finalBg = gradientBg || bgColor;

        // 🔥 INACTIVE BACKGROUND (FIXED)
        const inactiveBg =
          theme?.card ||
          "rgba(255,255,255,0.6)";

        return (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className="flex flex-col items-center cursor-pointer min-w-[90px] transition-all duration-300"
          >

            {/* 🔥 BOX */}
            <div
              style={{
                background: isActive ? finalBg : inactiveBg,

                boxShadow: isActive
                  ? `0 12px 30px ${bgColor}66`
                  : "0 4px 12px rgba(0,0,0,0.08)",

                backdropFilter: "blur(10px)"
              }}
              className={`
                w-20 h-20 rounded-2xl flex items-center justify-center
                transition-all duration-300 border
                ${isActive
                  ? "scale-110 border-transparent"
                  : "border-gray-200"}
              `}
            >

              {/* 🔥 IMAGE */}
              {cat.image && (
                <img
                  src={cat.image}
                  className="w-12 h-12 object-contain"
                />
              )}

            </div>

            {/* 🔥 TEXT */}
            <span
              style={{
                color: isActive
                  ? textColor
                  : theme?.mode === "dark"
                    ? "#9ca3af"
                    : "#6b7280"
              }}
              className={`
                text-xs mt-2 text-center transition-all duration-300
                ${isActive ? "font-semibold scale-105" : ""}
              `}
            >
              {cat.name}
            </span>
           {/* 🔥 UNDERLINE */}
{isActive && (
  <div
    style={{ background: bgColor }}
    className="h-1 w-6 rounded-full mt-1"
  />
)}

          </div>
        );
      })}

    </div>
  );
}
