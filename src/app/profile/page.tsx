"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc
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
        router.push("/login");
        return;
      }

      setUser(u);

      // 🔥 BUG 1 (intentional)
      console.log("USER UID:", u.uid.toUpperCase()); // ❌ crash if undefined

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      console.log("🔥 USER SNAP:", snap.data());

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name);
        setAddress(data.address);
      }

      const snapOrders = await getDocs(collection(db, "orders"));

      let arr = [];

      snapOrders.forEach(d => {
        const data = d.data();

        // 🔥 BUG 2 (intentional crash)
        if (data.userId === u.uid) {
          console.log("ORDER:", data.items[0].name.toUpperCase()); // ❌ crash if undefined
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

      {/* 🔥 BUG 3 */}
      <p>User Email: {user.email.toUpperCase()}</p> {/* ❌ crash */}

      <p>Name: {name}</p>
      <p>Address: {address}</p>

      <h2>Orders</h2>

      {orders.map((o, i) => (

        <div key={i}>

          {/* 🔥 BUG 4 */}
          <p>{o.items[0].name.toUpperCase()}</p>

          {/* 🔥 BUG 5 */}
          <p>{o.createdAt.toDate().toLocaleString()}</p>

        </div>

      ))}

    </div>
  );
}
