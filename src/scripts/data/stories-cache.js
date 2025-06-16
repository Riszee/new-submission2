const DB_NAME = "dicoding-intermediate-db";
const DB_VERSION = 3;
const STORE_NAME = "cached-stories";

const dbPromise = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject("Error opening database");
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export async function saveStoriesToCache(stories) {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await Promise.all(
    stories.map((story) => {
      return new Promise((resolve, reject) => {
        const request = store.put(story);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    })
  );
}

export async function getCachedStories() {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function clearCachedStories() {
  const db = await dbPromise();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
