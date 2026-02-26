"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "questions"), (snap) => {
      setQuestions(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  const answerQuestion = async (id: string, answer: string) => {
    await updateDoc(doc(db, "questions", id), {
      answer,
      answeredAt: new Date(),
      notified: true,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Q&A Management
      </h1>

      {questions.map((q) => (
        <div key={q.id} className="bg-white p-4 rounded shadow mb-4">
          <p><b>Q:</b> {q.question}</p>

          <textarea
            placeholder="Write answer..."
            className="w-full border p-2 mt-2 rounded"
            onBlur={(e) =>
              answerQuestion(q.id, e.target.value)
            }
          />

          {q.answer && (
            <p className="text-green-600 mt-2">
              A: {q.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
