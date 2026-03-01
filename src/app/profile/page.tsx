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
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [address, setAddress] = useState("");
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

        // Fetch Address
        const addressDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (addressDoc.exists()) {
          setAddress(addressDoc.data().address || "");
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

  const handlePhotoUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

        <div className="flex justify-center">
          <div className="relative">
            <img
              src={
                photo ||
                user?.photoURL ||
                "https://ui-avatars.com/api/?name=" + user?.email
              }
              className="w-24 h-24 rounded-full object-cover border-4 border-pink-200"
            />
            <label className="absolute bottom-0 right-0 bg-pink-600 text-white p-1 rounded-full cursor-pointer text-xs">
              ✏
              <input
                type="file"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-4">
          {user?.displayName || "Jembee User"}
        </h2>

        <p className="text-gray-500 text-sm">{user?.email}</p>

        <div className="mt-4 flex justify-center gap-6">
          <div>
            <p className="font-bold text-lg">{orders.length}</p>
            <p className="text-gray-500 text-xs">Total Orders</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
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
              placeholder="Enter your full address..."
            />
            <button
              onClick={saveAddress}
              className="mt-2 bg-green-500 text-white px-4 py-1 rounded-lg text-sm"
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
              className="bg-white rounded-xl p-4 shadow mb-3"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Order ID: {order.id.slice(0, 8)}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {order.status || "Processing"}
                </span>
              </div>

              <div className="text-sm text-gray-600 mt-2">
                ₹{order.totalAmount}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
            }
