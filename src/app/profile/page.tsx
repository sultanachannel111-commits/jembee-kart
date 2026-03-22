"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  writeBatch,
  increment,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [theme, setTheme] = useState<any>({
    background: "#f8fafc",
    button: "#6366f1"
  });

  const router = useRouter();

  // 🔥 LOAD THEME
  useEffect(() => {
    const loadTheme = async () => {
      const snap = await getDoc(doc(db, "settings", "theme"));
      if (snap.exists()) setTheme(snap.data());
    };
    loadTheme();
  }, []);

  // 🔐 AUTH + DATA
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Orders
      const q = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));

      // Profile
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 🔴 CANCEL ORDER
  const cancelOrder = async (orderId: string) => {

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;

    const orderData = orderSnap.data();

    const batch = writeBatch(db);

    batch.update(orderRef, { status: "Cancelled" });

    for (const item of orderData.products || []) {
      const productRef = doc(db, "products", item.productId);
      batch.update(productRef, {
        stock: increment(item.quantity),
      });
    }

    await batch.commit();

    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: "Cancelled" } : o)
    );

    alert("Cancelled ✅");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const saveProfile = async () => {
    await setDoc(doc(db, "users", user.uid), { name, phone }, { merge: true });
    setEditingProfile(false);
  };

  const saveAddress = async () => {
    await setDoc(doc(db, "users", user.uid), { address }, { merge: true });
    setEditingAddress(false);
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, ${theme.background}, #e0f2fe)`
      }}
    >

      {/* 🔥 PROFILE GLASS CARD */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-6 shadow-2xl">

        <div className="flex flex-col items-center">

          {/* AVATAR */}
          <div
            style={{ background: theme.button }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
          >
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          {/* INFO */}
          {editingProfile ? (
            <>
              <input
                className="w-full mt-4 p-3 rounded-xl bg-white/60 backdrop-blur border"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
              <input
                className="w-full mt-2 p-3 rounded-xl bg-white/60 backdrop-blur border"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
              />
              <button
                onClick={saveProfile}
                style={{ background: theme.button }}
                className="mt-3 text-white py-2 rounded-xl w-full shadow"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mt-3">
                {name || "Jembee User"}
              </h2>
              <p className="text-sm text-gray-700">{user.email}</p>

              <button
                onClick={() => setEditingProfile(true)}
                className="mt-2 text-sm text-blue-600"
              >
                Edit Profile
              </button>
            </>
          )}

          {/* STATS */}
          <div className="mt-4 flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 text-red-500 font-semibold"
          >
            Logout
          </button>

        </div>
      </div>

      {/* 🔥 ADDRESS GLASS */}
      <div className="mt-6 backdrop-blur-xl bg-white/30 border rounded-2xl p-4 shadow">

        <h3 className="font-bold mb-2">🏠 Address</h3>

        {editingAddress ? (
          <>
            <textarea
              className="w-full p-3 rounded-xl bg-white/60"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              onClick={saveAddress}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-xl"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <p>{address || "No address added"}</p>
            <button
              onClick={() => setEditingAddress(true)}
              className="text-sm text-blue-600 mt-2"
            >
              Edit
            </button>
          </>
        )}
      </div>

      {/* 🔥 ORDERS GLASS */}
      <div className="mt-6">

        <h3 className="font-bold mb-3">📦 Orders</h3>

        {orders.map((order) => (
          <div
            key={order.id}
            className="backdrop-blur-xl bg-white/30 border rounded-2xl p-4 mb-3 shadow"
          >
            <p className="text-sm font-semibold">
              #{order.id.slice(0, 8)}
            </p>

            <p className="text-xs text-gray-600 mt-1">
              {order.status}
            </p>

            <p className="mt-1 font-bold">
              ₹{order.totalAmount}
            </p>

            {order.status !== "Delivered" && (
              <button
                onClick={() => cancelOrder(order.id)}
                className="text-red-500 text-xs mt-2"
              >
                Cancel
              </button>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}
