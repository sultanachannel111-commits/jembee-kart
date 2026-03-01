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
  updateDoc,
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

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);

        // Fetch Orders
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);
        const orderData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(orderData);

        // Fetch Profile Data
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || currentUser.displayName || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const saveProfile = async () => {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { name, phone },
      { merge: true }
    );

    setEditingProfile(false);
  };

  const saveAddress = async () => {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { address },
      { merge: true }
    );

    setEditingAddress(false);
  };

  const cancelOrder = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: "Cancelled",
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "Cancelled" } : o
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white p-4 pt-[96px]">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-pink-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>

        {editingProfile ? (
          <>
            <input
              className="w-full border rounded-lg p-2 mt-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />

            <input
              className="w-full border rounded-lg p-2 mt-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
            />

            <button
              onClick={saveProfile}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg w-full"
            >
              Save Profile
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mt-4">
              {name || "Jembee User"}
            </h2>

            <p className="text-gray-500 text-sm">{user?.email}</p>

            <p className="text-gray-600 text-sm mt-1">
              📱 {phone || "No phone added"}
            </p>

            <button
              onClick={() => setEditingProfile(true)}
              className="mt-2 text-pink-600 text-sm font-semibold"
            >
              Edit Profile
            </button>
          </>
        )}

        <div className="mt-4 flex justify-center">
          <div>
            <p className="font-bold text-lg">{orders.length}</p>
            <p className="text-gray-500 text-xs">Total Orders</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-xl font-semibold"
        >
          🚪 Logout
        </button>
      </div>

      {/* ADDRESS SECTION */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-4">
        <h3 className="font-bold mb-2">🏠 Delivery Address</h3>

        {editingAddress ? (
          <>
            <textarea
              className="w-full border rounded-lg p-2 text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full address..."
            />
            <button
              onClick={saveAddress}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Save Address
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {address || "No address added yet."}
            </p>
            <button
              onClick={() => setEditingAddress(true)}
              className="mt-2 text-pink-600 text-sm font-semibold"
            >
              {address ? "Change Address" : "Add Address"}
            </button>
          </>
        )}
      </div>

      {/* MY ORDERS */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-3">📦 My Orders</h3>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow text-gray-500 text-sm">
            No orders yet.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4 shadow mb-4"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Order ID: {order.id.slice(0, 8)}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {order.status || "Placed"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width:
                        order.status === "Placed"
                          ? "25%"
                          : order.status === "Processing"
                          ? "50%"
                          : order.status === "Shipped"
                          ? "75%"
                          : order.status === "Delivered"
                          ? "100%"
                          : order.status === "Cancelled"
                          ? "100%"
                          : "25%",
                    }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-2">
                ₹{order.totalAmount}
              </div>

              {/* Cancel Button */}
              {order.status !== "Shipped" &&
                order.status !== "Delivered" &&
                order.status !== "Cancelled" && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="mt-2 text-red-600 text-xs font-semibold"
                  >
                    Cancel Order
                  </button>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
