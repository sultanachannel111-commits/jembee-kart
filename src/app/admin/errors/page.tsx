"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ErrorAdminPage() {

  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchErrors = async () => {
    const q = query(collection(db, "errors"), orderBy("time", "desc"));
    const snap = await getDocs(q);

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setErrors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const deleteError = async (id:string) => {
    await deleteDoc(doc(db,"errors",id));
    fetchErrors();
  };

  if (loading) return <div className="p-5">Loading errors...</div>;

  return (
    <div className="min-h-screen p-5 bg-gray-100">

      <h1 className="text-2xl font-bold mb-4">
        🔥 Error Logs ({errors.length})
      </h1>

      {errors.length === 0 && (
        <p>No errors found 🎉</p>
      )}

      <div className="space-y-4">

        {errors.map((e) => (
          <div
            key={e.id}
            className="bg-white p-4 rounded-xl shadow border border-red-200"
          >

            {/* MESSAGE */}
            <p className="font-semibold text-red-600">
              {e.message}
            </p>

            {/* FILE */}
            {e.file && (
              <p className="text-sm text-gray-600">
                📄 {e.file}
              </p>
            )}

            {/* LINE */}
            {e.line && (
              <p className="text-sm text-gray-600">
                📍 Line: {e.line}
              </p>
            )}

            {/* PAGE */}
            {e.page && (
              <p className="text-xs text-blue-600 break-all">
                🌐 {e.page}
              </p>
            )}

            {/* STACK */}
            {e.stack && (
              <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                {e.stack}
              </pre>
            )}

            {/* DELETE BUTTON */}
            <button
              onClick={() => deleteError(e.id)}
              className="mt-3 px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}
