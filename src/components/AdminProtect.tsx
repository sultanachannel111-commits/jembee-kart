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

      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
          router.push("/");
          return;
        }

        const data = userDoc.data();

        // ✅ admin aur seller dono allowed
        if (data.role !== "admin" && data.role !== "seller") {
          router.push("/");
          return;
        }

        setLoading(false);

      } catch (error) {
        console.log(error);
        router.push("/");
      }

    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-10">Checking access...</div>;
  }

  return <>{children}</>;
}
