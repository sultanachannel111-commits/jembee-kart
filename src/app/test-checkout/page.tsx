import CheckoutButton from "@/components/CheckoutButton";

export default function TestPage() {
  const product = {
    id: "test1",
    sellerId: "admin",
    sku: "MVnHs-Wh-S",
    printTypeId: 1,
    costPrice: 100,
    sellingPrice: 199,
    designLink: "https://example.com/design.jpg",
    mockupLink: "https://example.com/mockup.jpg"
  };

  return (
    <div className="p-10">
      <CheckoutButton product={product} />
    </div>
  );
}
