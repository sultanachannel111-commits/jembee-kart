export function generateFakeReview(productName: string) {
  const names = ["Rahul", "Sneha", "Amit", "Pooja", "Arjun"];
  const comments = [
    "Amazing quality!",
    "Worth every rupee.",
    "Highly recommended.",
    "Loved it ❤️",
    "Best purchase so far.",
  ];

  return {
    name: names[Math.floor(Math.random() * names.length)],
    rating: Math.floor(Math.random() * 2) + 4,
    comment: `${comments[Math.floor(Math.random() * comments.length)]} - ${productName}`,
  };
}
