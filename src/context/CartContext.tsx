"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const CartContext = createContext<any>(null);

export function CartProvider({ children }: any) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadCart(u.uid);
    });
    return () => unsub();
  }, []);

  const loadCart = async (uid: string) => {
    const snap = await getDocs(collection(db, "cart", uid, "items"));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCartItems(items);
  };

  const addToCart = async (product: any) => {
    if (!user) return alert("Login required");

    const ref = doc(db, "cart", user.uid, "items", product.id);

    await setDoc(ref, {
      name: product.name,
      price: product.sellPrice || product.price,
      image: product.image || "",
      quantity: 1,
      createdAt: new Date()
    });

    loadCart(user.uid);
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "cart", user.uid, "items", id));
    loadCart(user.uid);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        addToCart,
        removeFromCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
