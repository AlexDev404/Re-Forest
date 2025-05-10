import { initializeApp } from 'firebase/app';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDOqj153oV9vP5cfXx9stQSKXnQxjy1JuQ",
  authDomain: "refores-71a01.firebaseapp.com",
  projectId: "refores-71a01",
  storageBucket: "refores-71a01.firebasestorage.app",
  messagingSenderId: "796033762691",
  appId: "1:796033762691:web:3a53543dc6c58eeb6c22b6"
};

// Initialize only once (safe for both SSR and CSR)
export const app = initializeApp(firebaseConfig);

// Lazy-load and guard messaging
// Inside firebase.ts

export async function initMessaging() {
	if (typeof window === 'undefined') return null;

	const { getMessaging, isSupported, onMessage } = await import('firebase/messaging');

	if (await isSupported()) {
		const messaging = getMessaging(app);

		// ✅ Listen for foreground messages
		onMessage(messaging, (payload) => {
			console.log("Message received: ", payload);

			const { title, body, icon } = payload.notification || {};
			if (Notification.permission === 'granted') {
				new Notification(title || 'New Notification', {
					body,
					icon
				});
			}
		});

		return messaging;
	} else {
		console.warn('Firebase Messaging not supported in this browser.');
		return null;
	}
}



// Handles request and token logic client-side
export async function requestNotificationPermission() {
	try {
		if (typeof window === 'undefined') return null;

		const permission = await Notification.requestPermission();
		if (permission !== 'granted') throw new Error('Permission denied.');

		const messaging = await initMessaging();
		if (!messaging) throw new Error('Messaging not initialized');

		const { getToken } = await import('firebase/messaging');
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
