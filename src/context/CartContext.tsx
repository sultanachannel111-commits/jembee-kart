"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { getFinalPrice } from "@/utils/getFinalPrice";

const CartContext = createContext<any>(null);

export function CartProvider({ children }: any) {

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  /* ================= AUTH + REALTIME CART ================= */

  useEffect(() => {

    let unsubscribeCart: any;

    const unsubAuth = onAuthStateChanged(auth, (u) => {

      setUser(u);

      if (u) {

        const cartRef = collection(db, "carts", u.uid, "items");

        // 🔥 REALTIME LISTENER
        unsubscribeCart = onSnapshot(cartRef, (snap) => {

          const items = snap.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }));

          setCartItems(items);

        });

      } else {
        setCartItems([]);
      }

    });

    return () => {
      unsubAuth();
      if (unsubscribeCart) unsubscribeCart();
    };

  }, []);

  /* ================= ADD TO CART ================= */

  const addToCart = async (product: any) => {

    if (!user) {
      alert("Login required 🔐");
      return;
    }

    try {

      const ref = doc(
        db,
        "carts",
        user.uid,
        "items",
        product.id
      );

      // 🔥 FINAL PRICE CALCULATION
      const finalPrice =
        product.finalPrice ||
        getFinalPrice(product) ||
        product.sellPrice ||
        product.price ||
        0;

      await setDoc(ref, {

        productId: product.id,
        name: product.name,

        sellPrice:
          product.sellPrice ||
          product.price ||
          0,

        discount:
          product.discount ||
          0,

        price: finalPrice,

        image:
          product.image ||
          product.imageUrl ||
          "",

        quantity: 1,

        createdAt: new Date()

      });

      // ❌ NO NEED loadCart (realtime auto update)

    } catch (err) {
      console.log(err);
      alert("Error adding to cart");
    }

  };

  /* ================= REMOVE ================= */

  const removeFromCart = async (id: string) => {

    if (!user) return;

    try {

      await deleteDoc(
        doc(db, "carts", user.uid, "items", id)
      );

    } catch (err) {
      console.log(err);
    }

  };

  /* ================= COUNT ================= */

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (

    <CartContext.Provider
      value={{

        cartItems,
        cartCount,
        addToCart,
        removeFromCart

      }}
    >

      {children}

    </CartContext.Provider>

  );

}

export const useCart = () => useContext(CartContext);
