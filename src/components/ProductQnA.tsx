"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductQnA({ productId }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "questions"),
      where("productId", "==", productId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setQuestions(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [productId]);

  const askQuestion = async () => {
    await addDoc(collection(db, "questions"), {
      productId,
      question,
      answer: "",
      createdAt: new Date(),
    });

    setQuestion("");
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">
        Questions & Answers
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={askQuestion}
          className="bg-black text-white px-4 rounded"
        >
          Ask
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="border p-3 rounded bg-white">
            <p className="font-semibold">Q: {q.question}</p>
            {q.answer && (
              <p className="text-green-600 mt-2">
                A: {q.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
