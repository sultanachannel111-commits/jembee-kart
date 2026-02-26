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
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { checkVerifiedBuyer } from "@/utils/checkVerifiedBuyer";

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
    const user = getAuth().currentUser;
    if (!user) return alert("Login required");

    const verified = await checkVerifiedBuyer(user.uid, productId);

    await addDoc(collection(db, "questions"), {
      productId,
      question,
      askedBy: user.uid,
      userName: user.email,
      answer: "",
      upvotes: 0,
      upvotedBy: [],
      verifiedBuyer: verified,
      createdAt: new Date(),
      notified: false,
    });

    setQuestion("");
  };

  const upvoteQuestion = async (qData: any) => {
    const user = getAuth().currentUser;
    if (!user) return;

    if (qData.upvotedBy?.includes(user.uid)) return;

    await updateDoc(doc(db, "questions", qData.id), {
      upvotes: qData.upvotes + 1,
      upvotedBy: arrayUnion(user.uid),
    });
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">
        Questions & Answers
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Ask your question..."
        />
        <button
          onClick={askQuestion}
          className="bg-black text-white px-4 rounded"
        >
          Ask
        </button>
      </div>

      {questions.map((q) => (
        <div key={q.id} className="border p-4 rounded bg-white mb-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Q: {q.question}
            </p>

            {q.verifiedBuyer && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Verified Buyer
              </span>
            )}
          </div>

          {q.answer && (
            <p className="mt-2 text-green-600">
              A: {q.answer}
            </p>
          )}

          <button
            onClick={() => upvoteQuestion(q)}
            className="text-sm text-blue-600 mt-2"
          >
            👍 {q.upvotes || 0}
          </button>
        </div>
      ))}
    </div>
  );
}
