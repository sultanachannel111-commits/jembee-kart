import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ===========================
🔥 DEFAULT THEME (FULL APP)
=========================== */
export const DEFAULT_THEME = {
  version: 2,

  // 🌈 Background
  background: "#ffffff",
  gradient: false,
  gradientFrom: "#0f172a",
  gradientTo: "#111827",

  // 🔝 Header
  header: "#111827",
  headerText: "#ffffff",

  // 🔍 Search
  searchBg: "#ffffff",
  searchText: "#000000",
  searchIcon: "#6b7280",

  // 🔥 Trending
  trendingBg: "#ffffff",
  trendingText: "#000000",
  trendingChipBg: "#eeeeee",
  trendingChipText: "#000000",

  // 🧩 Category
  categoryColor: "#22c55e",
  categoryTextColor: "#ffffff",
  categoryGradient: false,
  categoryGradientFrom: "#22c55e",
  categoryGradientTo: "#16a34a",

  // 🛍 Product Card
  cardBg: "#ffffff",
  cardText: "#000000",
  priceColor: "#16a34a",

  // 🔘 Button
  button: "#22c55e",
  buttonText: "#ffffff",

  // 📱 Bottom Nav
  bottomNavBg: "#ffffff",
  bottomNavActive: "#22c55e",

  // 💬 Floating Button (WhatsApp)
  fabBg: "#22c55e",
  fabGlow: "#22c55e",

  // 🕒 Meta
  updatedAt: null,
};

/* ===========================
📥 GET THEME
=========================== */
export const getTheme = async () => {
  try {
    console.log("📥 GET THEME START");

    const ref = doc(db, "settings", "theme");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.log("⚠️ No theme found → using DEFAULT");

      return DEFAULT_THEME;
    }

    const data = snap.data();

    // 🔥 merge with default (safety)
    const finalTheme = {
      ...DEFAULT_THEME,
      ...data,
    };

    console.log("✅ THEME LOADED:", finalTheme);

    return finalTheme;

  } catch (error) {
    console.error("❌ GET THEME ERROR:", error);

    return DEFAULT_THEME;
  }
};

/* ===========================
💾 SAVE THEME
=========================== */
export const saveTheme = async (theme: any) => {
  try {
    console.log("🔥 SAVE THEME START");

    if (!theme) {
      console.warn("⚠️ Empty theme passed");
      return;
    }

    const ref = doc(db, "settings", "theme");

    const cleanTheme = {
      ...DEFAULT_THEME,
      ...theme,
      version: 2,
      updatedAt: new Date(),
    };

    await setDoc(ref, cleanTheme, {
      merge: true, // 🔥 SAFE UPDATE
    });

    console.log("✅ THEME SAVED SUCCESSFULLY");

  } catch (error) {
    console.error("❌ SAVE THEME ERROR:", error);
  }
};

/* ===========================
♻️ RESET THEME
=========================== */
export const resetTheme = async () => {
  try {
    console.log("♻️ RESET THEME START");

    const ref = doc(db, "settings", "theme");

    await setDoc(
      ref,
      {
        ...DEFAULT_THEME,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log("✅ THEME RESET DONE");

  } catch (error) {
    console.error("❌ RESET ERROR:", error);
  }
};

/* ===========================
⚡ QUICK UPDATE (PARTIAL)
=========================== */
export const updateThemeField = async (key: string, value: any) => {
  try {
    console.log("⚡ UPDATE FIELD:", key, value);

    const ref = doc(db, "settings", "theme");

    await setDoc(
      ref,
      {
        [key]: value,
        updatedAt: new Date(),
      },
      { merge: true }
    );

  } catch (error) {
    console.error("❌ UPDATE FIELD ERROR:", error);
  }
};
