// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyDOqj153oV9vP5cfXx9stQSKXnQxjy1JuQ",
  authDomain: "refores-71a01.firebaseapp.com",
  projectId: "refores-71a01",
  storageBucket: "refores-71a01.appspot.com",
  messagingSenderId: "796033762691",
  appId: "1:796033762691:web:3a53543dc6c58eeb6c22b6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// This will handle background notifications
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
