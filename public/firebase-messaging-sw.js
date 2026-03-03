importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBj29BLR64WHyFPRTWszEHGkyrMMTCpwkQ",
  authDomain: "studio-4213097962-b1ad6.firebaseapp.com",
  projectId: "studio-4213097962-b1ad6",
  messagingSenderId: "805890394961",
  appId: "1:805890394961:web:81d5ff06d6b8336804e170",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  });
});
