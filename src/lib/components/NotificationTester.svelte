<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import { getMessaging, getToken, onMessage } from 'firebase/messaging';

	const firebaseConfig = {
		apiKey: 'AIzaSyDOqj153oV9vP5cfXx9stQSKXnQxjy1JuQ',
		authDomain: 'refores-71a01.firebaseapp.com',
		projectId: 'refores-71a01',
		storageBucket: 'refores-71a01.firebasestorage.app',
		messagingSenderId: '796033762691',
		appId: '1:796033762691:web:3a53543dc6c58eeb6c22b6'
	};

	const app = initializeApp(firebaseConfig);
	const messaging = getMessaging(app);

	let fcmToken = '';
	let notification = '';

	const vapidKey =
		'BA4wrqh7jf14Tfu9jUl6Q9FH7bAtpM8tWew4lwpZYb5hZXCXWn8UhWcJpTb6QXTEPf0EKjb2cDJFv-8NMC8c_2k';

	async function getFcmToken() {
		try {
			fcmToken = await getToken(messaging, { vapidKey });
			console.log('✅ Token:', fcmToken);
			notification = 'Token retrieved successfully. Check console.';
		} catch (err) {
			console.error('❌ Token Error:', err);
			notification = 'Error getting token.';
		}
	}

	// Foreground message handling
	onMessage(messaging, (payload) => {
		console.log('📩 Foreground message:', payload);
		alert(`Foreground Push:\n${payload.notification?.title}\n${payload.notification?.body}`);
	});
</script>

<button onclick={getFcmToken} class="rounded bg-blue-600 px-4 py-2 text-white">
	Get Notification Token
</button>

{#if notification}
	<p class="mt-2 text-sm text-green-600">{notification}</p>
{/if}
