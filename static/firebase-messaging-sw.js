// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDOqj153oV9vP5cfXx9stQSKXnQxjy1JuQ",
  authDomain: "refores-71a01.firebaseapp.com",
  projectId: "refores-71a01",
  storageBucket: "refores-71a01.firebasestorage.app",
  messagingSenderId: "796033762691",
  appId: "1:796033762691:web:3a53543dc6c58eeb6c22b6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const { title, ...rest } = payload.notification;
  self.registration.showNotification(title, rest);
});
