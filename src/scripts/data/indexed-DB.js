const DB_NAME = "dicoding-intermediate-db";
const DB_VERSION = 3;
const STORE_NAME = "bookmarked-reports";
const STORE_NAME_STORIES = "cached-stories";

const dbPromise = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject("Error opening database");
    };
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
        store.createIndex("bookmarkedAt", "bookmarkedAt", {
          unique: false,
        });
      }
      // Tambahkan pembuatan object store untuk stories cache
      if (!db.objectStoreNames.contains(STORE_NAME_STORIES)) {
        db.createObjectStore(STORE_NAME_STORIES, { keyPath: "id" });
      }
    };
  });
};

// Menyimpan satu report ke dalam database
export async function saveReport(report) {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.put(report);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Menghapus report berdasarkan id
export async function deleteReport(id) {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Mengambil satu report berdasarkan id
export async function getReport(id) {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Mengambil semua report yang sudah dibookmark
export async function getAllBookmarkedReports() {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Simpan stories ke IndexedDB
export async function saveStoriesToCache(stories) {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME_STORIES, "readwrite");
  const store = tx.objectStore(STORE_NAME_STORIES);
  // Clear old cache
  await store.clear();
  // Simpan semua stories baru
  for (const story of stories) {
    store.put(story);
  }
  return tx.complete;
}

// Ambil semua stories dari IndexedDB
export async function getCachedStories() {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME_STORIES, "readonly");
  const store = tx.objectStore(STORE_NAME_STORIES);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
