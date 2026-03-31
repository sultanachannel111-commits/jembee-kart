"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminProtect({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      console.log("🔐 ADMIN CHECK USER:", user?.email);

      // ❌ NOT LOGGED IN
      if (!user) {
        console.log("❌ No user → redirect auth");
        router.push("/auth");
        setLoading(false);
        return;
      }

      try {

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // ❌ USER DOC MISSING
        if (!userSnap.exists()) {
          console.log("❌ User doc missing");

          router.push("/"); // safe fallback
          setLoading(false);
          return;
        }

        const data = userSnap.data();

        console.log("🔥 ROLE:", data.role);

        // ✅ ADMIN + SELLER ALLOWED
        if (data.role === "admin" || data.role === "seller") {
          console.log("✅ ACCESS GRANTED");
          setLoading(false);
        } 
        else {
          console.log("❌ ACCESS DENIED");
          router.push("/");
          setLoading(false);
        }

      } catch (error) {
        console.log("🔥 ERROR:", error);
        router.push("/");
        setLoading(false);
      }

    });

    return () => unsubscribe();

  }, [router]);

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="p-10 text-center">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
