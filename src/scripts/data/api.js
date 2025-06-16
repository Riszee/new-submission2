import CONFIG from "../config";
import { saveStoriesToCache, getCachedStories } from "./indexed-DB";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  GUEST_STORIES: `${CONFIG.BASE_URL}/stories/guest`,
  NOTIFICATION_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function register({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return await response.json();
}

export async function login({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

export async function addStory({ description, photo, lat, lon, token }) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== null && lon !== null) {
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  const response = await fetch(ENDPOINTS.STORIES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to add story");
  }
  return data;
}

export async function addGuestStory({ description, photo, lat, lon }) {
  const formData = new FormData();

  formData.append("description", description);
  formData.append("photo", photo);
  if (lat !== null && lon !== null) {
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  const response = await fetch(ENDPOINTS.GUEST_STORIES, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to add guest story");
  }
  return data;
}

export async function getStories({ page = 1, size = 10, location = 0, token }) {
  if (!navigator.onLine) {
    // Offline: ambil dari IndexedDB
    return { listStory: await getCachedStories(), offline: true };
  }
  const url = new URL(ENDPOINTS.STORIES);
  url.searchParams.append("page", page);
  url.searchParams.append("size", size);
  url.searchParams.append("location", location);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (response.ok && data.listStory) {
    // Online: simpan ke IndexedDB
    await saveStoriesToCache(data.listStory);
  }
  return data;
}

export async function getStoryDetail(id, token) {
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function subscribeNotification(subscription, token) {
  const response = await fetch(ENDPOINTS.NOTIFICATION_SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });
  return await response.json();
}

export async function unsubscribeNotification(endpoint, token) {
  const response = await fetch(ENDPOINTS.NOTIFICATION_SUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });
  return await response.json();
}
