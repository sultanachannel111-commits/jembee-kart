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

      // User login check
      if (!user) {
        router.push("/auth");
        return;
      }

      try {

        const userDoc = await getDoc(doc(db, "users", user.uid));

        // User document check
        if (!userDoc.exists()) {
          router.push("/");
          return;
        }

        const data = userDoc.data();

        // Admin role check
        if (data.role !== "admin") {
          router.push("/");
          return;
        }

        // Allow admin
        setLoading(false);

      } catch (error) {
        console.error("Admin check error:", error);
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
