"use client";

import { useState } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/lib/uploadImage";

export default function AddReview({ productId }: any) {

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    const user = auth.currentUser;

    if (!user) return alert("Login first");
    if (!comment) return alert("Write review");

    try {

      setLoading(true);

      let imageUrl = "";

      // 📸 COMPRESS + UPLOAD
      if (file) {

        const compressed = await compressImage(file);

        const storageRef = ref(
          storage,
          `reviews/${productId}/${Date.now()}`
        );

        await uploadBytes(storageRef, compressed);

        imageUrl = await getDownloadURL(storageRef);
      }

      // 🔥 SAVE FIRESTORE
      await addDoc(
        collection(db, "products", productId, "reviews"),
        {
          name: user.displayName || "User",
          rating,
          comment,
          image: imageUrl,
          likes: 0,
          createdAt: new Date()
        }
      );

      alert("Review added ✅");

      setComment("");
      setFile(null);

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">

      <h3 className="font-bold mb-2">Write Review</h3>

      <textarea
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
        placeholder="Write review..."
        className="w-full border p-2 rounded mb-2"
      />

      {/* 📸 CAMERA */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e:any)=>setFile(e.target.files[0])}
        className="mb-2"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Uploading..." : "Submit Review"}
      </button>

    </div>
  );
}
