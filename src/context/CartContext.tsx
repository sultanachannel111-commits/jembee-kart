"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  total: number;
  addToCart: (item: CartItem) => Promise<void>;
  increaseQty: (id: string) => Promise<void>;
  decreaseQty: (id: string) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // 🔥 REAL-TIME FIRESTORE LISTENER
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }

    const cartRef = collection(db, "cart", user.uid, "items");

    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CartItem[];

      setCart(items);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Add To Cart
  const addToCart = async (item: CartItem) => {
    if (!user) return;

    const itemRef = doc(db, "cart", user.uid, "items", item.id);

    await setDoc(itemRef, item, { merge: true });
  };

  // 🔹 Increase Qty
  const increaseQty = async (id: string) => {
    if (!user) return;

    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const itemRef = doc(db, "cart", user.uid, "items", id);

    await setDoc(itemRef, {
      ...item,
      quantity: item.quantity + 1,
    });
  };

  // 🔹 Decrease Qty
  const decreaseQty = async (id: string) => {
    if (!user) return;

    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity <= 1) {
      await deleteDoc(doc(db, "cart", user.uid, "items", id));
    } else {
      await setDoc(doc(db, "cart", user.uid, "items", id), {
        ...item,
        quantity: item.quantity - 1,
      });
    }
  };

  // 🔹 Remove Item
  const removeFromCart = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "cart", user.uid, "items", id));
  };

  // 🔹 Clear Cart
  const clearCart = async () => {
    if (!user) return;

    for (const item of cart) {
      await deleteDoc(doc(db, "cart", user.uid, "items", item.id));
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        total,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
