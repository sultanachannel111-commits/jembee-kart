// ⭐ FAKE REVIEW GENERATOR
export function generateFakeReviews(count = 3) {

  const names = ["Rahul", "Amit", "Sohail", "Imran", "Vikash", "Arjun"];
  const comments = [
    "Very good quality 🔥",
    "Worth the price 👍",
    "Fabric is amazing 😍",
    "Perfect fitting 👌",
    "Highly recommended 💯",
    "Nice product, fast delivery 🚀"
  ];

  return Array.from({ length: count }).map(() => ({
    name: names[Math.floor(Math.random() * names.length)],
    rating: (Math.random() * 1 + 4).toFixed(1), // 4–5 rating
    comment: comments[Math.floor(Math.random() * comments.length)],
    fake: true
  }));
}


// ⭐ MERGE REAL + FAKE REVIEWS
export function getMixedReviews(product: any) {

  const realReviews = product.reviewsData || []; // firestore se
  const fakeReviews = generateFakeReviews(3);

  return [...realReviews, ...fakeReviews];
}
