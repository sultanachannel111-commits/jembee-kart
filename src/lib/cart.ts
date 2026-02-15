export function addToCart(product: any) {
  if (typeof window === "undefined") return;

  const existingCart = localStorage.getItem("cart");
  const cart = existingCart ? JSON.parse(existingCart) : [];

  cart.push(product);

  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getCart() {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function clearCart() {
  localStorage.removeItem("cart");
}
