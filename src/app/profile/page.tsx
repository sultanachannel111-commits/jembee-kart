"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
    address: ""
  });

  const router = useRouter();

  // ================= LOAD =================
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);

      // ORDERS
      const snapOrders = await getDocs(collection(db, "orders"));

      let arr: any[] = [];
      snapOrders.forEach(d => {
        const data = d.data();
        if (data.userId === u.uid) {
          arr.push({ id: d.id, ...data });
        }
      });

      setOrders(arr);

      // ADDRESSES
      const addSnap = await getDocs(
        collection(db, "users", u.uid, "addresses")
      );

      let addArr: any[] = [];
      addSnap.forEach(d => addArr.push({ id: d.id, ...d.data() }));

      setAddresses(addArr);

    });

    return () => unsub();

  }, []);

  // ================= ADD ADDRESS =================
  const addAddress = async () => {

    const { name, phone, city, pincode, address } = form;

    if (!name || !phone || !city || !pincode || !address) {
      return alert("Fill all fields");
    }

    await addDoc(
      collection(db, "users", user.uid, "addresses"),
      { ...form, createdAt: new Date() }
    );

    setForm({
      name: "", phone: "", city: "", state: "", pincode: "", address: ""
    });

    location.reload();
  };

  // ================= DELETE =================
  const deleteAddress = async (id: string) => {
    await deleteDoc(doc(db, "users", user.uid, "addresses", id));
    setAddresses(addresses.filter(a => a.id !== id));
  };

  // ================= UI =================
  return (

    <div className="p-4 min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white">

      {/* ADDRESS FORM */}
      <div className="glass p-4 rounded-2xl mb-5">

        <h2 className="font-bold mb-3">Add Address 📍</h2>

        <div className="grid gap-2">

          <input placeholder="Full Name"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
            className="glass-input"/>

          <input placeholder="Phone"
            value={form.phone}
            onChange={(e)=>setForm({...form,phone:e.target.value})}
            className="glass-input"/>

          <input placeholder="City"
            value={form.city}
            onChange={(e)=>setForm({...form,city:e.target.value})}
            className="glass-input"/>

          <input placeholder="State"
            value={form.state}
            onChange={(e)=>setForm({...form,state:e.target.value})}
            className="glass-input"/>

          <input placeholder="Pincode"
            value={form.pincode}
            onChange={(e)=>setForm({...form,pincode:e.target.value})}
            className="glass-input"/>

          <textarea placeholder="Full Address"
            value={form.address}
            onChange={(e)=>setForm({...form,address:e.target.value})}
            className="glass-input"/>

          <button onClick={addAddress} className="btn-blue">
            Save Address
          </button>

        </div>

      </div>

      {/* SAVED ADDRESSES */}
      <div className="glass p-4 rounded-2xl mb-5">

        <h2 className="font-bold mb-2">My Addresses</h2>

        {addresses.map(a=>(
          <div key={a.id} className="flex justify-between mb-2">

            <div className="text-sm">
              <p className="font-semibold">{a.name}</p>
              <p>{a.address}</p>
              <p>{a.city} - {a.pincode}</p>
            </div>

            <button onClick={()=>deleteAddress(a.id)} className="text-red-500">
              Delete
            </button>

          </div>
        ))}

      </div>

      {/* ORDERS */}
      <h2 className="text-xl font-bold mb-3">My Orders 📦</h2>

      {orders.map(o=>{

        const item = o.items?.[0] || {};
        const image = item.image || "/no-image.png";

        return (
          <div key={o.id} className="glass p-4 rounded-2xl mb-4">

            <div className="flex gap-3">
              <img src={image} className="w-16 h-16 rounded-lg"/>
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-green-600">₹{o.total}</p>
              </div>
            </div>

            <button
              onClick={()=>router.push(`/track/${o.id}`)}
              className="text-blue-600 mt-2"
            >
              Track Order →
            </button>

          </div>
        );
      })}

    </div>
  );
}
