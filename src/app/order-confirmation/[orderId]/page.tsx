import { Header } from '@/components/header';
import { OrderConfirmationClient } from '@/components/order-confirmation-client';
import { getOrderByOrderId, getProductById } from '@/lib/data';

// The param is named `orderId` in the route, but for this demo, we'll use it as productId to find the product
// since the custom orderId is not unique enough to be a slug without more complex logic.
// In a real app, you would pass the Firestore document ID or a truly unique orderId.
export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const product = await getProductById(params.orderId);
  // This is a simplified lookup for demo purposes.
  // In a real app, you might pass the real orderId and look it up directly.
  const order = product ? { 
      orderId: `JM-DEMO`, 
      status: 'Confirmed', 
      shippingAddress: 'Your specified address',
      productDetails: {
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      }
      // other fields would be here
  } as any : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 md:px-6">
          <OrderConfirmationClient order={order} product={product} />
        </div>
      </main>
    </div>
  );
}
