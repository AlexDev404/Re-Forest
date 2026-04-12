import { api } from './client';

export const notificationAdapter = {
  async saveFcmToken(fcmToken: string, deviceInfo: string): Promise<{ success: boolean }> {
    return api.post('/save-fcm-token', { fcmToken, deviceInfo });
  }
};
