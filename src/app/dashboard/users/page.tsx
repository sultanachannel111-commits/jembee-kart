"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(list);
  };

  const changeRole = async (id: string, newRole: string) => {
    await updateDoc(doc(db, "users", id), {
      role: newRole,
    });
    fetchUsers();
  };

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "users", id), {
      isBlocked: !currentStatus,
    });
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users Management 👥</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{user.email}</p>
              <p>Role: {user.role}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    user.isBlocked
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </p>
            </div>

            <div className="flex gap-3">

              {/* Role Change */}
              <select
                value={user.role}
                onChange={(e) =>
                  changeRole(user.id, e.target.value)
                }
                className="border p-1 rounded"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>

              {/* Block Toggle */}
              <button
                onClick={() =>
                  toggleBlock(user.id, user.isBlocked)
                }
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                {user.isBlocked ? "Unblock" : "Block"}
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteUser(user.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
