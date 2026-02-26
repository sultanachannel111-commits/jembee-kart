"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import StarRating from "./StarRating";

export default function ProductReviews({ productId }: any) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  /* REAL REVIEWS */
  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(data);
    });

    return () => unsub();
  }, [productId]);

  /* FAKE REVIEWS (AUTO GENERATED) */
  const fakeReviews = [
    { name: "Rahul", rating: 5, comment: "Amazing quality!" },
    { name: "Sneha", rating: 4, comment: "Very nice product 👍" },
    { name: "Amit", rating: 5, comment: "Worth the price." },
  ];

  const submitReview = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Login required");
      return;
    }

    await addDoc(collection(db, "reviews"), {
      productId,
      userId: user.uid,
      rating,
      comment,
      createdAt: new Date(),
    });

    setComment("");
  };

  const allReviews = [...reviews, ...fakeReviews];

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

      {/* ADD REVIEW */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <StarRating rating={rating} />
        <textarea
          className="w-full border p-2 mt-2 rounded"
          placeholder="Write your review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={submitReview}
          className="bg-black text-white px-4 py-2 rounded mt-2"
        >
          Submit Review
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {allReviews.map((r, i) => (
          <div key={i} className="border p-3 rounded bg-white">
            <StarRating rating={r.rating} />
            <p className="text-sm mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
