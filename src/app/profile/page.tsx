"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    name: "",
    phone: ""
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState<any>({
    label: "Home",
    address: "",
    city: "",
    pincode: ""
  });

  const [orders, setOrders] = useState<any[]>([]);

  const router = useRouter();

  // 🔥 LOAD USER
  useEffect(() => {

    onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // 🔥 PROFILE
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }

      // 🔥 ADDRESSES
      const addrSnap = await getDocs(collection(db, "users", u.uid, "addresses"));
      const addrArr:any[] = [];
      addrSnap.forEach(d=>addrArr.push({ id:d.id, ...d.data() }));
      setAddresses(addrArr);

      // 🔥 ORDERS
      const orderSnap = await getDocs(collection(db, "orders"));
      const orderArr:any[] = [];

      orderSnap.forEach(d=>{
        const data:any = d.data();
        if (data.userId === u.uid) {
          orderArr.push({ id:d.id, ...data });
        }
      });

      setOrders(orderArr);

    });

  }, []);

  // 💾 SAVE PROFILE
  const saveProfile = async () => {
    await setDoc(doc(db, "users", user.uid), profile, { merge: true });
    alert("Profile updated ✅");
  };

  // 📦 ADD ADDRESS
  const addAddress = async () => {

    if (!newAddress.address) return alert("Enter address");

    const ref = await addDoc(
      collection(db, "users", user.uid, "addresses"),
      {
        ...newAddress,
        isDefault: addresses.length === 0
      }
    );

    setAddresses([...addresses, { id: ref.id, ...newAddress }]);

    setNewAddress({
      label: "Home",
      address: "",
      city: "",
      pincode: ""
    });
  };

  // ❌ DELETE ADDRESS
  const deleteAddress = async (id:string) => {

    await deleteDoc(doc(db, "users", user.uid, "addresses", id));

    setAddresses(addresses.filter(a=>a.id!==id));
  };

  // ⭐ SET DEFAULT
  const setDefault = async (id:string) => {

    for (const a of addresses) {
      await updateDoc(
        doc(db, "users", user.uid, "addresses", a.id),
        { isDefault: a.id === id }
      );
    }

    const updated = addresses.map(a=>({
      ...a,
      isDefault: a.id === id
    }));

    setAddresses(updated);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="p-4 space-y-6 pb-24">

      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* 👤 PROFILE */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-2">

        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e)=>setProfile({...profile,name:e.target.value})}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Phone"
          value={profile.phone}
          onChange={(e)=>setProfile({...profile,phone:e.target.value})}
          className="w-full border p-2 rounded"
        />

        <input
          value={user?.email}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />

        <button onClick={saveProfile} className="bg-black text-white w-full p-2 rounded">
          Save Profile
        </button>

      </div>

      {/* 📍 ADD ADDRESS */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-2">

        <h2 className="font-bold">Add Address</h2>

        <select
          value={newAddress.label}
          onChange={(e)=>setNewAddress({...newAddress,label:e.target.value})}
          className="w-full border p-2 rounded"
        >
          <option>Home</option>
          <option>Work</option>
        </select>

        <input
          placeholder="Address"
          value={newAddress.address}
          onChange={(e)=>setNewAddress({...newAddress,address:e.target.value})}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="City"
          value={newAddress.city}
          onChange={(e)=>setNewAddress({...newAddress,city:e.target.value})}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Pincode"
          value={newAddress.pincode}
          onChange={(e)=>setNewAddress({...newAddress,pincode:e.target.value})}
          className="w-full border p-2 rounded"
        />

        <button onClick={addAddress} className="bg-blue-600 text-white w-full p-2 rounded">
          Add Address
        </button>

      </div>

      {/* 📦 ADDRESS LIST */}
      <div className="space-y-2">

        {addresses.map(a=>(
          <div key={a.id} className="bg-white p-3 rounded-xl shadow">

            <p className="font-semibold">{a.label}</p>
            <p>{a.address}</p>
            <p>{a.city} - {a.pincode}</p>

            {a.isDefault && <p className="text-green-600 text-sm">Default</p>}

            <div className="flex gap-3 mt-2">

              <button onClick={()=>setDefault(a.id)} className="text-blue-600 text-sm">
                Set Default
              </button>

              <button onClick={()=>deleteAddress(a.id)} className="text-red-500 text-sm">
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* 📦 ORDERS */}
      <div>

        <h2 className="font-bold mb-2">My Orders</h2>

        {orders.map(o=>(
          <div key={o.id} className="bg-white p-3 mb-2 rounded-xl shadow">

            <p>Order ID: {o.id}</p>
            <p>Total: ₹{o.total}</p>
            <p>Status: {o.status}</p>

            <button
              onClick={()=>router.push(`/track/${o.id}`)}
              className="text-blue-600 text-sm"
            >
              Track Order
            </button>

          </div>
        ))}

      </div>

      {/* 🚪 LOGOUT */}
      <button onClick={logout} className="bg-red-500 text-white w-full p-3 rounded-xl">
        Logout
      </button>

    </div>
  );
}
