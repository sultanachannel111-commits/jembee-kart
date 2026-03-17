import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ---------------------------
GET THEME
----------------------------*/
export const getTheme = async () => {
  try {
    console.log("📥 GET THEME CALLED");

    const snap = await getDoc(doc(db, "settings", "theme"));

    if (!snap.exists()) {
      console.log("⚠️ No theme found, using default");

      return {
        background: "#ffffff",
        header: "#ec4899",
        button: "#ec4899",
        card: "#ffffff",
      };
    }

    console.log("✅ THEME LOADED:", snap.data());
    return snap.data();

  } catch (error) {
    console.error("❌ GET THEME ERROR:", error);

    return {
      background: "#ffffff",
      header: "#ec4899",
      button: "#ec4899",
      card: "#ffffff",
    };
  }
};


/* ---------------------------
SAVE THEME (🔥 FIXED + DEBUG)
----------------------------*/
export const saveTheme = async (theme: any) => {
  try {
    console.log("🔥 TRY SAVE:", theme);

    await setDoc(
      doc(db, "settings", "theme"),
      {
        ...theme,
        updatedAt: new Date(),
      },
      { merge: true } // 🔥 VERY IMPORTANT
    );

    console.log("✅ SAVED IN FIRESTORE");

  } catch (error) {
    console.error("❌ FIRESTORE SAVE ERROR:", error);
  }
};


/* ---------------------------
RESET THEME
----------------------------*/
export const resetTheme = async () => {
  try {
    console.log("♻️ RESET THEME");

    await setDoc(
      doc(db, "settings", "theme"),
      {
        background: "#ffffff",
        header: "#ec4899",
        button: "#ec4899",
        card: "#ffffff",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log("✅ RESET DONE");

  } catch (error) {
    console.error("❌ RESET ERROR:", error);
  }
};
