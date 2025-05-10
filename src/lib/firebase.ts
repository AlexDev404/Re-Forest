//file: src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDOqj153oV9vP5cfXx9stQSKXnQxjy1JuQ",
  authDomain: "refores-71a01.firebaseapp.com",
  projectId: "refores-71a01",
  storageBucket: "refores-71a01.firebasestorage.app",
  messagingSenderId: "796033762691",
  appId: "1:796033762691:web:3a53543dc6c58eeb6c22b6"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function requestNotificationPermission() {
	try {
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') throw new Error('Permission denied.');

		const token = await getToken(messaging, {
			vapidKey: 'BA4wrqh7jf14Tfu9jUl6Q9FH7bAtpM8tWew4lwpZYb5hZXCXWn8UhWcJpTb6QXTEPf0EKjb2cDJFv-8NMC8c_2k'
		});

		console.log('FCM Token:', token);

		// ✅ Send to backend
		await fetch('/api/save-fcm-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fcmToken: token,
				deviceInfo: navigator.userAgent
			})
		});

		return token;
	} catch (err) {
		console.error('Error getting permission or token:', err);
		return null;
	}
}
