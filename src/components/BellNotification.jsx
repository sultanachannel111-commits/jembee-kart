"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BellNotification() {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const audio = new Audio("/notification.mp3");

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const newOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔥 New order detect
      if (newOrders.length > notifications.length) {
        setShowPopup(true);

        if (soundOn) {
          audio.loop = true; // 🔁 repeat sound
          audio.play();
        }
      }

      setNotifications(newOrders);
    });

    return () => unsubscribe();
  }, [notifications.length, soundOn]);

  // 🔕 Stop sound
  const stopSound = () => {
    const audio = document.querySelector("audio");
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setSoundOn(false);
    setShowPopup(false);
  };

  return (
    <>
      {/* 🔥 Notification Popup */}
      {showPopup && (
        <div className="fixed top-20 right-4 z-50 bg-white shadow-2xl rounded-xl p-4 w-72 border animate-slide-in">

          <p className="font-semibold text-sm mb-2">
            🛒 New Order Received!
          </p>

          <p className="text-xs text-gray-500 mb-3">
            Customer ne abhi order place kiya hai
          </p>

          {/* 🔘 Buttons */}
          <div className="flex gap-2">
            <button
              onClick={stopSound}
              className="flex-1 bg-red-500 text-white text-xs py-2 rounded-lg"
            >
              🔕 Stop
            </button>

            <button
              onClick={() => setShowPopup(false)}
              className="flex-1 bg-gray-200 text-xs py-2 rounded-lg"
            >
              Close
            </button>
          </div>

        </div>
      )}

      {/* Hidden audio element */}
      <audio src="/notification.mp3" />
    </>
  );
}
