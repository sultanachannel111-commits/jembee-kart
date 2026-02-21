"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/* ================= TYPES ================= */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | null>(null);

/* ================= PROVIDER ================= */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  /* 🔥 AUTH LISTENER */
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUserId(null);
        setItems([]);
        return;
      }

      setUserId(user.uid);

      const cartRef = doc(db, "cart", user.uid);

      // 🔥 REALTIME SNAPSHOT (multi device support)
      const unsubscribeSnapshot = onSnapshot(cartRef, (snap) => {
        if (snap.exists()) {
          setItems(snap.data().products || []);
        } else {
          setItems([]);
        }
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  /* 🔥 ADD TO CART */
  const addToCart = async (product: CartItem) => {
    if (!userId) {
      alert("Please login first");
      return;
    }

    const cartRef = doc(db, "cart", userId);
    const snap = await getDoc(cartRef);

    let updatedItems: CartItem[] = [];

    if (snap.exists()) {
      const existing = snap.data().products || [];

      const index = existing.findIndex(
        (item: CartItem) => item.id === product.id
      );

      if (index !== -1) {
        existing[index].quantity += product.quantity || 1;
        updatedItems = existing;
      } else {
        updatedItems = [...existing, product];
      }

      await updateDoc(cartRef, {
        products: updatedItems,
      });
    } else {
      updatedItems = [product];

      await setDoc(cartRef, {
        products: updatedItems,
      });
    }
  };

  /* 🔥 REMOVE PRODUCT */
  const removeFromCart = async (productId: string) => {
    if (!userId) return;

    const cartRef = doc(db, "cart", userId);
    const snap = await getDoc(cartRef);

    if (!snap.exists()) return;

    const existing = snap.data().products || [];

    const updated = existing.filter(
      (item: CartItem) => item.id !== productId
    );

    await updateDoc(cartRef, {
      products: updated,
    });
  };

  /* 🔥 UPDATE QUANTITY */
  const updateQuantity = async (
    productId: string,
    quantity: number
  ) => {
    if (!userId) return;

    const cartRef = doc(db, "cart", userId);
    const snap = await getDoc(cartRef);

    if (!snap.exists()) return;

    const existing = snap.data().products || [];

    const updated = existing.map((item: CartItem) =>
      item.id === productId
        ? { ...item, quantity }
        : item
    );

    await updateDoc(cartRef, {
      products: updated,
    });
  };

  /* 🔥 CLEAR CART */
  const clearCart = async () => {
    if (!userId) return;

    const cartRef = doc(db, "cart", userId);

    await setDoc(cartRef, {
      products: [],
    });
  };

  /* 🔥 TOTAL CALCULATION */
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
