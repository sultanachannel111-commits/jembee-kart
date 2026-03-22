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

    // ⭐ LOGIC
    if (i % 15 === 0) rating = 2;     // 15 me 1 → 2⭐
    else if (i % 10 === 0) rating = 3; // 10 me 1 → 3⭐
    else if (i % 5 === 0) rating = 4;  // thoda 4⭐ mix
    else rating = 5;

    reviews.push({
      name: getRandom(names),
      rating,
      comment: getRandom(comments[rating]),
      fake: true
    });
  }

  return reviews;
}


// ⭐ MIX REAL + FAKE
export function getMixedReviews(product: any) {

  const real = product?.reviewsData || [];
  const fake = generateFakeReviews(product?.id);

  return [...real, ...fake];
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
    const star = Math.round(r.rating);
    stats[star as 1|2|3|4|5]++;

    totalRating += star;
  });

  const average = stats.total
    ? (totalRating / stats.total).toFixed(1)
    : 0;

  return {
    stats,
    average
  };
}
