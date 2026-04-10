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
  updateDoc
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

        // ORDERS
        const oSnap = await getDocs(collection(db, "orders"));

        const userOrders: any[] = [];

        oSnap.forEach((d) => {
          if (d.data().userId === u.uid) {
            userOrders.push({ id: d.id, ...d.data() });
          }
        });

        setOrders(userOrders);

        // ADDRESSES
        const q = query(
          collection(db, "addresses"),
          where("userId", "==", u.uid)
        );

        const aSnap = await getDocs(q);

        const addrList: any[] = [];

        aSnap.forEach((d) =>
          addrList.push({ id: d.id, ...d.data() })
        );

        setAddresses(addrList);

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
      userId: user.uid
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
      <div className="bg-white p-5 rounded-xl text-center mb-4">
        <h1 className="font-bold text-lg">{name}</h1>
        <p className="text-sm text-gray-400">{user?.email}</p>

        <button
          onClick={() => auth.signOut()}
          className="text-red-500 mt-2"
        >
          Logout
        </button>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-4 rounded-xl mb-4">

        <div className="flex justify-between mb-2">
          <h2 className="font-bold">Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)}>+</button>
        </div>

        {showAddressForm && (
          <div className="space-y-2 mb-3">
            <input placeholder="Street" value={newAddress.street}
              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              className="border p-2 w-full rounded"
            />
            <input placeholder="City" value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
              className="border p-2 w-full rounded"
            />
            <input placeholder="Zip" value={newAddress.zip}
              onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})}
              className="border p-2 w-full rounded"
            />
            <input placeholder="Phone" value={newAddress.phone}
              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
              className="border p-2 w-full rounded"
            />
            <button onClick={saveAddress} className="bg-black text-white w-full py-2 rounded">
              Save
            </button>
          </div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="flex justify-between border-b py-2 text-sm">
            <div>
              {a.address}, {a.city} - {a.pincode}
              <br />
              📞 {a.phone}
            </div>
            <button onClick={() => deleteAddr(a.id)} className="text-red-500">
              Delete
            </button>
          </div>
        ))}

      </div>

      {/* ORDERS */}
      <h2 className="font-bold mb-2">Orders</h2>

      {orders.map(o => (
        <div key={o.id} className="bg-white p-3 rounded-xl mb-3 flex gap-3">

          <img src={o.items?.[0]?.image} className="w-14 h-14 rounded" />

          <div className="flex-1">
            <p className="font-bold text-sm">{o.items?.[0]?.name}</p>
            <p className="text-green-600">₹{o.total}</p>
            <p className="text-xs">{o.status}</p>
          </div>

          <button
            onClick={() => router.push(`/track/${o.id}`)}
            className="bg-gray-200 px-2 rounded"
          >
            Track
          </button>

          <button
            onClick={() => {
              setSelectedOrder(o);
              setShowHelp(true);
            }}
            className="bg-black text-white px-2 rounded"
          >
            ?
          </button>

        </div>
      ))}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-white p-5 rounded-xl w-[90%]">

            {(selectedOrder?.status === "PENDING" ||
              selectedOrder?.status === "PLACED") && (
              <button
                onClick={() => handleOrderAction(selectedOrder.id, "CANCEL")}
                className="w-full bg-red-500 text-white py-2 mb-2 rounded"
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
                className="w-full bg-yellow-500 text-white py-2 mb-2 rounded"
              >
                Return Order
              </button>
            )}

            <button
              onClick={() => setShowHelp(false)}
              className="w-full border py-2 rounded"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* RETURN FORM */}
      {showReturnForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-white p-5 rounded-xl w-[90%]">

            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setReturnReason(r)}
                className={`block w-full p-2 mb-2 border rounded ${
                  returnReason === r ? "bg-black text-white" : ""
                }`}
              >
                {r}
              </button>
            ))}

            {returnReason === "Other" && (
              <textarea
                placeholder="Write reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full border p-2 mb-2"
              />
            )}

            <button
              onClick={() => handleOrderAction(selectedOrder.id, "RETURN_SUBMIT")}
              className="w-full bg-green-500 text-white py-2 rounded"
            >
              Submit
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
