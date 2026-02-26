export function generateSmartAnswer(
  question: string,
  product: any
) {
  const q = question.toLowerCase();

  if (q.includes("cotton")) {
    return "Yes, this product is made from high-quality cotton material.";
  }

  if (q.includes("wash")) {
    return "Yes, this product is machine washable and easy to maintain.";
  }

  if (q.includes("delivery")) {
    return "Delivery usually takes 3-5 working days.";
  }

  if (q.includes("size")) {
    return "This product follows standard sizing. Please check size chart.";
  }

  return `This product features: ${product.description}`;
}
