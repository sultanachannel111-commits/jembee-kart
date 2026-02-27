"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  total: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load Local Cart First
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // 🔹 Sync From Firestore When User Login
  useEffect(() => {
    if (!user) return;

    const loadFirestoreCart = async () => {
      const snap = await getDoc(doc(db, "cart", user.uid));

      if (snap.exists()) {
        const firestoreCart = snap.data().items || [];
        setCart(firestoreCart);
        localStorage.setItem("cart", JSON.stringify(firestoreCart));
      } else {
        await setDoc(doc(db, "cart", user.uid), {
          items: cart,
        });
      }
    };

    loadFirestoreCart();
  }, [user]);

  // 🔹 Sync To Firestore + Local
  useEffect(() => {
    if (loading) return;

    localStorage.setItem("cart", JSON.stringify(cart));

    if (user) {
      setDoc(
        doc(db, "cart", user.uid),
        { items: cart },
        { merge: true }
      );
    }
  }, [cart, user, loading]);

  // 🔹 Add To Cart
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // 🔹 Remove Completely
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // 🔹 Increase Qty
  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // 🔹 Decrease Qty (Remove if 0)
  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 🔹 Clear Cart
  const clearCart = () => {
    setCart([]);
  };

  // 🔹 Correct Total
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔹 Correct Count (Badge)
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        total,
        cartCount,
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
