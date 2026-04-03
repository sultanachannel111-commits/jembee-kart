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

  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: ""
  });

  const [addresses, setAddresses] = useState([]);

  const [newAddress, setNewAddress] = useState({
    label: "Home",
    address: "",
    city: "",
    pincode: ""
  });

  const router = useRouter();

  // 🔥 LOAD USER DATA
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // 👤 PROFILE LOAD
      const snap = await getDoc(doc(db, "users", u.uid));

      if (snap.exists()) {
        setProfile(snap.data());
      }

      // 📍 ADDRESS LOAD
      const addrSnap = await getDocs(collection(db, "users", u.uid, "addresses"));

      const arr = [];
      addrSnap.forEach(d => arr.push({ id: d.id, ...d.data() }));

      setAddresses(arr);
    });

    return () => unsub();

  }, []);

  // 💾 SAVE PROFILE
  const saveProfile = async () => {

    await setDoc(
      doc(db, "users", user.uid),
      profile,
      { merge: true }
    );

    alert("Profile updated ✅");
  };

  // 📦 ADD ADDRESS (🔥 IMPORTANT FIX)
  const addAddress = async () => {

    if (!newAddress.address) return alert("Enter address");

    const addrRef = collection(db, "users", user.uid, "addresses");

    // ❌ remove old default
    const snap = await getDocs(addrRef);

    await Promise.all(
      snap.docs.map(d =>
        updateDoc(d.ref, { isDefault: false })
      )
    );

    // ✅ ADD NEW ADDRESS WITH PROFILE DATA
    const dataToSave = {
      ...newAddress,
      name: profile.name || "User",
      phone: profile.phone || "0000000000",
      email: user.email || "",
      isDefault: true,
      createdAt: new Date()
    };

    const ref = await addDoc(addrRef, dataToSave);

    setAddresses([
      ...addresses.map(a => ({ ...a, isDefault: false })),
      { id: ref.id, ...dataToSave }
    ]);

    // reset
    setNewAddress({
      label: "Home",
      address: "",
      city: "",
      pincode: ""
    });
  };

  // ❌ DELETE ADDRESS
  const deleteAddress = async (id) => {

    await deleteDoc(doc(db, "users", user.uid, "addresses", id));

    let updated = addresses.filter(a => a.id !== id);

    // 🔥 ensure one default always
    if (!updated.some(a => a.isDefault) && updated.length > 0) {

      await updateDoc(
        doc(db, "users", user.uid, "addresses", updated[0].id),
        { isDefault: true }
      );

      updated[0].isDefault = true;
    }

    setAddresses(updated);
  };

  // ⭐ SET DEFAULT
  const setDefault = async (id) => {

    const addrRef = collection(db, "users", user.uid, "addresses");

    const snap = await getDocs(addrRef);

    await Promise.all(
      snap.docs.map(d =>
        updateDoc(d.ref, { isDefault: d.id === id })
      )
    );

    setAddresses(
      addresses.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="p-4 space-y-6 pb-24">

      <h1 className="text-2xl font-bold">My Profile 👤</h1>

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
          value={user?.email || ""}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />

        <button
          onClick={saveProfile}
          className="bg-black text-white w-full p-2 rounded"
        >
          Save Profile
        </button>

      </div>

      {/* 📍 ADD ADDRESS */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-2">

        <h2 className="font-bold">Add Address 📍</h2>

        <select
          value={newAddress.label}
          onChange={(e)=>setNewAddress({...newAddress,label:e.target.value})}
          className="w-full border p-2 rounded"
        >
          <option>Home</option>
          <option>Work</option>
        </select>

        <input
          placeholder="Full Address"
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

        <button
          onClick={addAddress}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Add Address
        </button>

      </div>

      {/* 📦 ADDRESS LIST */}
      <div className="space-y-3">

        {addresses.map(a=>(
          <div key={a.id} className="bg-white p-4 rounded-xl shadow">

            <p className="font-semibold">{a.name}</p>
            <p>{a.phone}</p>
            <p className="text-sm text-gray-500">{a.email}</p>

            <p className="mt-2">{a.address}</p>
            <p>{a.city} - {a.pincode}</p>

            {a.isDefault && (
              <p className="text-green-600 text-sm mt-1">Default</p>
            )}

            <div className="flex gap-3 mt-3">

              {!a.isDefault && (
                <button
                  onClick={()=>setDefault(a.id)}
                  className="text-blue-600 text-sm"
                >
                  Set Default
                </button>
              )}

              <button
                onClick={()=>deleteAddress(a.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* 🚪 LOGOUT */}
      <button
        onClick={logout}
        className="bg-red-500 text-white w-full p-3 rounded-xl"
      >
        Logout
      </button>

    </div>
  );
}
