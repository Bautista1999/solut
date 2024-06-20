// src/lib/stores/notifications.js
import { GetAmountNewNotifications } from '$lib/data_functions/notifications';
import { writable } from 'svelte/store';

export const notificationCount = writable(0);

export async function updateNotificationCount() {
    const count = await GetAmountNewNotifications(); // Replace this with your actual function to get the notification count
    notificationCount.set(count);
}
