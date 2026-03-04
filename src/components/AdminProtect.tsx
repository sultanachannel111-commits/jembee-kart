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

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.push("/");
          return;
        }

        const data = userSnap.data();

        // ✅ Admin OR Seller allowed
        if (data.role === "admin" || data.role === "seller") {
          setLoading(false);
        } else {
          router.push("/");
        }

      } catch (error) {
        console.log(error);
        router.push("/");
      }

    });

    return () => unsubscribe();

  }, [router]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
