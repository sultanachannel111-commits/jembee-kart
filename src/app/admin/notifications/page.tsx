"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

import { Bell, Trash2, Send } from "lucide-react";

export default function AdminNotifications() {

  const [message,setMessage] = useState("");
  const [notifications,setNotifications] = useState<any[]>([]);

  useEffect(()=>{

    const unsub = onSnapshot(collection(db,"notifications"),(snap)=>{

      const list = snap.docs.map(d=>({
        id:d.id,
        ...d.data()
      }));

      setNotifications(list);

    });

    return ()=>unsub();

  },[]);



  const sendNotification = async ()=>{

    if(!message.trim()) return;

    await addDoc(collection(db,"notifications"),{

      message:message,
      createdAt:serverTimestamp(),
      read:false

    });

    setMessage("");

  };


  const remove = async(id:string)=>{

    if(!confirm("Delete notification?")) return;

    await deleteDoc(doc(db,"notifications",id));

  };



  return(

    <div className="p-6">

      {/* TITLE */}

      <div className="flex items-center gap-2 mb-6">
        <Bell className="text-purple-600"/>
        <h1 className="text-2xl font-bold">
          Admin Notifications
        </h1>
      </div>


      {/* SEND BOX */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <h2 className="font-bold mb-3">
          Send Notification
        </h2>

        <div className="flex gap-3">

          <input
            type="text"
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            placeholder="Write notification..."
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={sendNotification}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <Send size={16}/>
            Send
          </button>

        </div>

      </div>



      {/* NOTIFICATION LIST */}

      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="font-bold mb-4">
          All Notifications
        </h2>

        <div className="space-y-3">

          {notifications.map((n)=> (

            <div
              key={n.id}
              className="flex items-center justify-between border p-3 rounded-lg"
            >

              <div>

                <p className="font-medium">
                  {n.message}
                </p>

                <p className="text-xs text-gray-500">
                  {n.createdAt?.toDate?.().toLocaleString?.()}
                </p>

              </div>

              <button
                onClick={()=>remove(n.id)}
                className="text-red-500"
              >
                <Trash2 size={18}/>
              </button>

            </div>

          ))}

        </div>

      </div>


    </div>

  );

}
