"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminProtect({ children }: any) {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        router.push("/auth");
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        router.push("/");
        setLoading(false);
        return;
      }

      const data = snap.data();

      // ❗ ONLY ADMIN
      if (data.role === "admin") {
        setLoading(false);
      } else {
        router.push("/");
        setLoading(false);
      }

    });

    return () => unsub();

  }, []);

  if (loading) return <div className="p-5">Checking admin...</div>;

  return children;
}
