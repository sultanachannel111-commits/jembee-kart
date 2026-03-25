"use client";

import { useState } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import { compressImage } from "@/lib/uploadImage";

export default function AddReview({ productId }: any) {

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 📸 SELECT
  const handleFileChange = (e: any) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  // 📸 CAMERA
  const handleCamera = (e: any) => {
    const file = e.target.files[0];
    if (file) setFiles((prev) => [...prev, file]);
  };

  // 🖱 DRAG DROP
  const handleDrop = (e: any) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleDragOver = (e: any) => e.preventDefault();

  // ❌ REMOVE
  const removeImage = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  // 🔄 REORDER
  const moveImage = (from: number, to: number) => {
    const updated = [...files];
    const item = updated.splice(from, 1)[0];
    updated.splice(to, 0, item);
    setFiles(updated);
  };

  const handleSubmit = async () => {

    const user = auth.currentUser;

    if (!user) return alert("Login first");
    if (!comment) return alert("Write review");

    try {
      setLoading(true);
      setProgress(0);

      let uploaded = 0;
      let imageUrls: string[] = [];

      // ⚡ PARALLEL UPLOAD
      await Promise.all(
        files.map(async (file) => {

          const compressed = await compressImage(file);

          const storageRef = ref(
            storage,
            `reviews/${productId}/${Date.now()}-${file.name}`
          );

          const uploadTask = uploadBytesResumable(storageRef, compressed);

          await new Promise<void>((resolve, reject) => {

            uploadTask.on(
              "state_changed",
              null,
              reject,
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                imageUrls.push(url);

                uploaded++;
                setProgress(Math.round((uploaded / files.length) * 100));

                resolve();
              }
            );

          });

        })
      );

      await addDoc(
        collection(db, "products", productId, "reviews"),
        {
          name: user.displayName || "User",
          rating,
          comment,
          images: imageUrls,
          likes: 0,
          createdAt: new Date()
        }
      );

      alert("Review added ✅");

      setComment("");
      setFiles([]);
      setProgress(0);

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">

      <h3 className="font-bold mb-2">Write Review</h3>

      {/* TEXT */}
      <textarea
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
        placeholder="Write review..."
        className="w-full border p-2 rounded mb-2"
      />

      {/* RATING */}
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

      {/* DRAG AREA */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed p-4 text-center rounded mb-2"
      >
        Drag & Drop Images
      </div>

      {/* FILE INPUT */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-2"
      />

      {/* CAMERA INPUT */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCamera}
        className="mb-2"
      />

      {/* PREVIEW + REORDER */}
      <div className="flex gap-2 overflow-x-auto mb-2">
        {files.map((file, i) => (
          <div key={i} className="relative">

            <img
              src={URL.createObjectURL(file)}
              className="w-20 h-20 object-cover rounded"
            />

            {/* REMOVE */}
            <button
              onClick={() => removeImage(i)}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
            >
              ✕
            </button>

            {/* REORDER */}
            {i > 0 && (
              <button
                onClick={() => moveImage(i, i - 1)}
                className="absolute bottom-0 left-0 bg-black text-white text-xs px-1"
              >
                ←
              </button>
            )}

            {i < files.length - 1 && (
              <button
                onClick={() => moveImage(i, i + 1)}
                className="absolute bottom-0 right-0 bg-black text-white text-xs px-1"
              >
                →
              </button>
            )}

          </div>
        ))}
      </div>

      {/* PROGRESS */}
      {loading && (
        <div className="w-full bg-gray-200 h-2 rounded mb-2">
          <div
            className="bg-green-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? `Uploading ${progress}%` : "Submit Review"}
      </button>

    </div>
  );
}
