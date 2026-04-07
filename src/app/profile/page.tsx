"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const router = useRouter();

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      console.log("🔥 AUTH USER:", u);

      if (!u) {
        console.log("❌ USER NOT LOGGED IN");
        setTimeout(() => router.push("/login"), 0);
        return;
      }

      setUser(u);

      // ✅ SAFE DEBUG
      console.log("USER UID:", u?.uid);

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      console.log("🔥 USER SNAP:", snap.data());

      if (snap.exists()) {
        const data = snap.data() || {};

        setName(data?.name || "");
        setAddress(data?.address || "");
      }

      const snapOrders = await getDocs(collection(db, "orders"));

      let arr = [];

      snapOrders.forEach(d => {
        const data = d.data();

        if (data?.userId === u.uid) {

          // ✅ SAFE LOG
          console.log("ORDER:", data?.items?.[0]?.name);

          arr.push({ id: d.id, ...data });
        }
      });

      setOrders(arr);

    });

    return () => unsub();

  }, []);

  return (
    <div className="p-4">

      <h1>DEBUG MODE 🐛</h1>

      {/* ✅ FIXED */}
      <p>User Email: {user?.email?.toUpperCase() || "Loading..."}</p>

      <p>Name: {name}</p>
      <p>Address: {address}</p>

      <h2>Orders</h2>

      {Array.isArray(orders) && orders.map((o, i) => (

        <div key={i}>

          {/* ✅ SAFE */}
          <p>{o?.items?.[0]?.name || "No name"}</p>

          {/* ✅ SAFE */}
          <p>
            {o?.createdAt?.toDate
              ? o.createdAt.toDate().toLocaleString()
              : "No date"}
          </p>

        </div>

      ))}

    </div>
  );
}
