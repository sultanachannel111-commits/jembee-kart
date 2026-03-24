"use client";

import { useState } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/lib/uploadImage";

export default function AddReview({ productId }: any) {

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 📸 MULTIPLE IMAGE SELECT
  const handleFileChange = (e: any) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleSubmit = async () => {

    const user = auth.currentUser;

    if (!user) return alert("Login first");
    if (!comment) return alert("Write review");

    try {
      setLoading(true);

      let imageUrls: string[] = [];

      // 📸 MULTIPLE UPLOAD
      for (let file of files) {

        const compressed = await compressImage(file);

        const storageRef = ref(
          storage,
          `reviews/${productId}/${Date.now()}-${file.name}`
        );

        await uploadBytes(storageRef, compressed);

        const url = await getDownloadURL(storageRef);

        imageUrls.push(url);
      }

      // 🔥 SAVE FIRESTORE
      await addDoc(
        collection(db, "products", productId, "reviews"),
        {
          name: user.displayName || "User",
          rating,
          comment,
          images: imageUrls, // 🔥 ARRAY SAVE
          likes: 0,
          createdAt: new Date()
        }
      );

      alert("Review added ✅");

      setComment("");
      setFiles([]);

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

      {/* ⭐ RATING */}
      <select
        value={rating}
        onChange={(e)=>setRating(Number(e.target.value))}
        className="mb-2 border p-2 rounded"
      >
        <option value={5}>⭐⭐⭐⭐⭐</option>
        <option value={4}>⭐⭐⭐⭐</option>
        <option value={3}>⭐⭐⭐</option>
        <option value={2}>⭐⭐</option>
        <option value={1}>⭐</option>
      </select>

      {/* 📸 MULTIPLE IMAGE INPUT */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-2"
      />

      {/* 🔥 PREVIEW */}
      <div className="flex gap-2 overflow-x-auto mb-2">
        {files.map((file, i) => (
          <img
            key={i}
            src={URL.createObjectURL(file)}
            className="w-20 h-20 object-cover rounded"
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Uploading..." : "Submit Review"}
      </button>

    </div>
  );
}
