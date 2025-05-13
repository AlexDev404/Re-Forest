// src/lib/server/firebase.ts
import {
	FIREBASE_CONFIG_CLIENT_EMAIL,
	FIREBASE_CONFIG_PRIVATE_KEY,
	FIREBASE_CONFIG_PROJECT_ID
} from '$env/static/private';
import admin, { type ServiceAccount } from 'firebase-admin';

const serviceAccount: ServiceAccount = {
	// type: FIREBASE_CONFIG_TYPE,
	projectId: FIREBASE_CONFIG_PROJECT_ID,
	// private_key_id: FIREBASE_CONFIG_PRIVATE_KEY_ID,
	privateKey: FIREBASE_CONFIG_PRIVATE_KEY.replace(/\\n/g, '\n'),
	clientEmail: FIREBASE_CONFIG_CLIENT_EMAIL
	// client_id: FIREBASE_CONFIG_CLIENT_ID,
	// auth_uri: FIREBASE_CONFIG_AUTH_URI,
	// token_uri: FIREBASE_CONFIG_TOKEN_URI,
	// auth_provider_x509_cert_url:FIREBASE_CONFIG_AUTH_PROVIDER_CERT_URL,
	// client_x509_cert_url: FIREBASE_CONFIG_CLIENT_CERT_URL,
	// universe_domain: FIREBASE_CONFIG_UNIVERSE_DOMAIN
};

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	});
}

export const messaging = admin.messaging();
