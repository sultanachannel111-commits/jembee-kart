export type User = {
  uid: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'customer' | 'seller' | 'admin';
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  createdAt: any; // Firestore Timestamp
};

export type OrderStatus = 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';

export type Order = {
  id: string; // Firestore doc ID
  orderId: string; // Custom ID like JM-XXXXX
  userId: string;
  productId: string;
  sellerId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  status: OrderStatus;
  trackingId?: string;
  createdAt: any; // Firestore Timestamp
  productDetails: {
      name: string;
      price: number;
      imageUrl: string;
  }
};
