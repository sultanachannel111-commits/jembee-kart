// ⭐ NAMES
const names = [
  "Amit","Rahul","Imran","Sohail","Vikash","Arjun","Rohit","Salman",
  "Faizan","Nadeem","Asif","Sameer","Karan","Deepak","Ankit","Manish",
  "Zaid","Shahid","Wasim","Irfan","Nitin","Yash","Abhishek","Adil",
  "Tariq","Farhan","Ayaan","Rehan","Bilal","Junaid","Sandeep","Pankaj",
  "Ajay","Raj","Suraj","Ramesh","Naresh","Kishan","Harsh","Prakash",
  "Sunny","Monty","Lucky","Vicky","Sonu","Monu","Guddu","Chintu"
];

// ⭐ COMMENTS
const comments = {
  5: [
    "Amazing quality 🔥",
    "Worth every rupee 💯",
    "Perfect fitting 👌",
    "Loved it 😍",
    "Highly recommended 💥"
  ],
  4: [
    "Very good product 👍",
    "Nice fabric 😊",
    "Value for money 💰",
    "Good quality 👌"
  ],
  3: [
    "Average product 😐",
    "Okay for price 👍",
    "Not bad 🙂"
  ],
  2: [
    "Quality could be better 😕",
    "Not as expected 😐"
  ],
  1: [
    "Bad experience 😞",
    "Very poor quality ❌"
  ]
};

// ⭐ FAKE IMAGES (public folder)
const fakeImages = [
  "/reviews/review1.jpg",
  "/reviews/review2.jpg",
  "/reviews/review3.jpg",
  "/reviews/review4.jpg",
  "/reviews/review5.jpg"
];

// ⭐ RANDOM PICK
function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ⭐ MAIN GENERATOR
export function generateFakeReviews(productId: string) {

  const seed = productId?.charCodeAt(0) || 10;

  const total = (seed % 10) + 15; // 👉 15–25 reviews

  let reviews: any[] = [];

  for (let i = 1; i <= total; i++) {

    let rating = 5;

    // ⭐ LOGIC (Premium distribution)
    if (i % 15 === 0) rating = 2;     // 15 me 1 → 2⭐
    else if (i % 10 === 0) rating = 3; // 10 me 1 → 3⭐
    else if (i % 5 === 0) rating = 4;  // thoda 4⭐ mix
    else rating = 5;

    reviews.push({
      id: `fake-${productId}-${i}`, // 🔥 unique id
      name: getRandom(names),
      rating,
      comment: getRandom(comments[rating]),
      image: Math.random() > 0.5 ? getRandom(fakeImages) : "", // 🔥 fake image
      likes: Math.floor(Math.random() * 20), // 🔥 random likes
      createdAt: new Date(),
      fake: true
    });
  }

  return reviews;
}


// ⭐ MIX REAL + FAKE
export function getMixedReviews(product: any) {

  const real = product?.reviewsData || [];

  // 🔥 ensure real reviews also safe
  const realFormatted = real.map((r:any, i:number)=>({
    id: r.id || `real-${i}`,
    name: r.name || "User",
    rating: r.rating || 5,
    comment: r.comment || "",
    image: r.image || "",
    likes: r.likes || 0,
    createdAt: r.createdAt || new Date(),
    fake: false
  }));

  const fake = generateFakeReviews(product?.id);

  return [...realFormatted, ...fake];
}


// ⭐ ⭐ ⭐ PREMIUM STATS SYSTEM
export function getReviewStats(reviews: any[]) {

  let stats = {
    total: reviews.length,
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  let totalRating = 0;

  reviews.forEach(r => {

    const star = Math.round(Number(r.rating) || 0);

    if (star >= 1 && star <= 5) {
      stats[star as 1|2|3|4|5]++;
      totalRating += star;
    }

  });

  const average = stats.total
    ? (totalRating / stats.total).toFixed(1)
    : "0";

  return {
    stats,
    average
  };
}
