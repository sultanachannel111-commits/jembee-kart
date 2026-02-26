"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { translateText } from "@/utils/translator";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  /* ---------------- FETCH QUESTIONS ---------------- */
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

  /* ---------------- SAVE ANSWER ---------------- */
  const answerQuestion = async (id: string) => {
    const answer = answers[id];
    if (!answer) return;

    await updateDoc(doc(db, "questions", id), {
      answer,
      answeredAt: new Date(),
      notified: true,
    });

    alert("Answer saved successfully ✅");
  };

  /* ---------------- TRANSLATE QUESTION ---------------- */
  const handleTranslateQuestion = (text: string) => {
    const translated = translateText(text);
    alert(translated);
  };

  /* ---------------- TRANSLATE ANSWER ---------------- */
  const handleTranslateAnswer = (id: string) => {
    const currentAnswer = answers[id];
    if (!currentAnswer) return;

    const translated = translateText(currentAnswer);

    setAnswers((prev) => ({
      ...prev,
      [id]: translated,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Q&A Management
      </h1>

      {questions.length === 0 && (
        <p className="text-gray-500">No questions yet.</p>
      )}

      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-white p-5 rounded-xl shadow mb-6"
        >
          {/* QUESTION */}
          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Q: {q.question}
            </p>

            {q.answer && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Answered
              </span>
            )}
          </div>

          {/* TRANSLATE QUESTION */}
          <button
            onClick={() =>
              handleTranslateQuestion(q.question)
            }
            className="text-xs text-blue-600 mt-2"
          >
            🌍 Translate Question
          </button>

          {/* ANSWER BOX */}
          <textarea
            value={answers[q.id] || ""}
            onChange={(e) =>
              setAnswers({
                ...answers,
                [q.id]: e.target.value,
              })
            }
            placeholder="Write answer..."
            className="w-full border p-3 mt-3 rounded"
          />

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => answerQuestion(q.id)}
              className="bg-black text-white px-4 py-2 rounded text-sm"
            >
              Save Answer
            </button>

            <button
              onClick={() => handleTranslateAnswer(q.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              🌍 Translate Answer
            </button>
          </div>

          {/* SHOW EXISTING ANSWER */}
          {q.answer && (
            <div className="mt-4 bg-green-50 p-3 rounded">
              <p className="text-green-700">
                A: {q.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
