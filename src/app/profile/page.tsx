"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    zip: "",
    phone: ""
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [showHelp, setShowHelp] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [returnReason, setReturnReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const router = useRouter();

  const reasons = [
    "Product is damaged",
    "Different from images",
    "Size/Fit issue",
    "Quality not as expected",
    "Other"
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      try {
        const userSnap = await getDoc(doc(db, "users", u.uid));

        setName(
          userSnap.exists()
            ? userSnap.data().name
            : u.email?.split("@")[0]
        );

        // ORDERS (Sorted by Newest First)
        // Note: Make sure you have a 'createdAt' field in your Firestore orders
        const ordersRef = collection(db, "orders");
        const oQuery = query(ordersRef, where("userId", "==", u.uid));
        const oSnap = await getDocs(oQuery);

        const userOrders: any[] = [];
        oSnap.forEach((d) => {
          userOrders.push({ id: d.id, ...d.data() });
        });
        
        // Sorting manually by createdAt or server timestamp to show new products on top
        setOrders(userOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

        // ADDRESSES (Sorted by Newest First)
        const aRef = collection(db, "addresses");
        const q = query(
          aRef,
          where("userId", "==", u.uid)
        );

        const aSnap = await getDocs(q);
        const addrList: any[] = [];
        aSnap.forEach((d) =>
          addrList.push({ id: d.id, ...d.data() })
        );

        setAddresses(addrList.reverse()); // Latest added address on top

      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [mounted, router]);

  // ================= ADDRESS =================

  const saveAddress = async () => {

    if (!newAddress.street || !newAddress.zip || newAddress.phone.length < 10) {
      return alert("Fill all fields");
    }

    const fullAddress = `${newAddress.street}, ${newAddress.city}`;

    const ref = await addDoc(collection(db, "addresses"), {
      address: fullAddress,
      city: newAddress.city,
      pincode: newAddress.zip,
      phone: newAddress.phone,
      userId: user.uid,
      createdAt: new Date()
    });

    setAddresses([
      {
        id: ref.id,
        address: fullAddress,
        city: newAddress.city,
        pincode: newAddress.zip,
        phone: newAddress.phone
      },
      ...addresses
    ]);

    setNewAddress({ street: "", city: "", zip: "", phone: "" });
    setShowAddressForm(false);
  };

  const deleteAddr = async (id: string) => {
    await deleteDoc(doc(db, "addresses", id));
    setAddresses(addresses.filter(a => a.id !== id));
  };

  // ================= ORDER ACTION =================

  const handleOrderAction = async (orderId: string, actionType: string) => {

    if (actionType === "CANCEL") {
      if (!confirm("Cancel this order?")) return;

      await updateDoc(doc(db, "orders", orderId), {
        status: "CANCELLED"
      });

      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: "CANCELLED" } : o
      ));

      setShowHelp(false);
      return;
    }

    if (actionType === "RETURN_SUBMIT") {

      const finalReason =
        returnReason === "Other" ? customReason : returnReason;

      if (!finalReason) return alert("Enter reason");

      await updateDoc(doc(db, "orders", orderId), {
        status: "RETURN_REQUESTED",
        returnReason: finalReason
      });

      await addDoc(collection(db, "returns"), {
        orderId: orderId,
        userId: user.uid,
        reason: finalReason,
        status: "PENDING",
        createdAt: new Date()
      });

      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: "RETURN_REQUESTED" } : o
      ));

      alert("Return request sent ✅");

      setShowReturnForm(false);
      setReturnReason("");
      setCustomReason("");
    }
  };

  if (!mounted || loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-20">

      {/* PROFILE */}
      <div className="bg-white p-5 rounded-xl text-center mb-4 border">
        <h1 className="font-bold text-lg uppercase">{name}</h1>
        <p className="text-sm text-gray-400">{user?.email}</p>

        <button
          onClick={() => auth.signOut()}
          className="text-red-500 mt-2 text-xs font-bold"
        >
          Logout
        </button>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-4 rounded-xl mb-4 border">

        <div className="flex justify-between mb-2">
          <h2 className="font-bold">Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-black text-white w-6 h-6 rounded-full">+</button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-3 bg-gray-50 p-3 rounded-lg">
            <input placeholder="Street" value={newAddress.street}
              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              className="border p-2 w-full rounded text-sm"
            />
            <input placeholder="City" value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
              className="border p-2 w-full rounded text-sm"
            />
            <input placeholder="Zip" value={newAddress.zip}
              onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})}
              className="border p-2 w-full rounded text-sm"
            />
            <input placeholder="Phone" value={newAddress.phone}
              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
              className="border p-2 w-full rounded text-sm"
            />
            <button onClick={saveAddress} className="bg-black text-white w-full py-2 rounded font-bold">
              Save Address
            </button>
          </div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="flex justify-between border-b last:border-0 py-3 text-sm">
            <div>
              <p className="font-medium">{a.address}</p>
              <p className="text-gray-500">{a.pincode}</p>
              <p className="text-gray-400 text-xs mt-1">📞 {a.phone}</p>
            </div>
            <button onClick={() => deleteAddr(a.id)} className="text-red-400 font-bold text-xs uppercase">
              Delete
            </button>
          </div>
        ))}

      </div>

      {/* ORDERS */}
      <h2 className="font-bold mb-2">Recent Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="bg-white p-3 rounded-xl mb-3 flex gap-3 border shadow-sm">

          <img src={o.items?.[0]?.image || "/placeholder.png"} className="w-14 h-14 rounded object-cover" />

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate uppercase">{o.items?.[0]?.name}</p>
            <p className="text-black font-bold">₹{o.total}</p>
            <p className={`text-[10px] font-bold uppercase ${o.status === 'CANCELLED' ? 'text-red-500' : 'text-gray-400'}`}>{o.status}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/track/${o.id}`)}
              className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold"
            >
              Track
            </button>

            <button
              onClick={() => {
                setSelectedOrder(o);
                setShowHelp(true);
              }}
              className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              ?
            </button>
          </div>

        </div>
      ))}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-2xl w-[85%] max-w-sm">
            <h3 className="font-bold mb-4 text-center">Order Options</h3>

            {(selectedOrder?.status === "PENDING" ||
              selectedOrder?.status === "PLACED") && (
              <button
                onClick={() => handleOrderAction(selectedOrder.id, "CANCEL")}
                className="w-full bg-red-500 text-white py-3 mb-2 rounded-xl font-bold uppercase text-xs"
              >
                Cancel Order
              </button>
            )}

            {selectedOrder?.status === "DELIVERED" && (
              <button
                onClick={() => {
                  setShowReturnForm(true);
                  setShowHelp(false);
                }}
                className="w-full bg-orange-500 text-white py-3 mb-2 rounded-xl font-bold uppercase text-xs"
              >
                Return Order
              </button>
            )}

            <button
              onClick={() => setShowHelp(false)}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold uppercase text-xs"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* RETURN FORM */}
      {showReturnForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-2xl w-[85%] max-w-sm">
            <h3 className="font-bold mb-4 text-center">Select Reason</h3>

            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setReturnReason(r)}
                className={`block w-full p-3 mb-2 border rounded-xl text-xs font-bold transition-all ${
                  returnReason === r ? "bg-black text-white" : "bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}

            {returnReason === "Other" && (
              <textarea
                placeholder="Write reason here..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full border p-3 mb-2 rounded-xl text-xs bg-gray-50 outline-none"
                rows={3}
              />
            )}

            <div className="flex gap-2 mt-4">
               <button
                onClick={() => setShowReturnForm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold uppercase text-xs"
              >
                Back
              </button>
              <button
                onClick={() => handleOrderAction(selectedOrder.id, "RETURN_SUBMIT")}
                className="flex-2 w-full bg-green-600 text-white py-3 rounded-xl font-bold uppercase text-xs"
              >
                Submit Return
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
