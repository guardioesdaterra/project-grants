// This is the service worker for the EcoTrack Global PWA

const CACHE_NAME = "ecotrack-global-v1"

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/grid-overlay.png",
  "/scanline.png",
  "/noise.png",
  "/marker-icon.png",
  "/marker-shadow.png",
]

// Install event - precache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - network first with cache fallback strategy
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // For HTML pages, use network first strategy
  if (event.request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || caches.match("/")
          })
        }),
    )
    return
  }

  // For other assets, use cache first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        // Don't cache responses that aren't successful
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Background sync for offline submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "submit-activity") {
    event.waitUntil(syncActivities())
  }
})

// Function to sync activities when back online
async function syncActivities() {
  const db = await openDatabase()
  const tx = db.transaction("offline-activities", "readwrite")
  const store = tx.objectStore("offline-activities")

  const activities = await store.getAll()

  for (const activity of activities) {
    try {
      // Attempt to send the activity to the server
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activity),
      })

      if (response.ok) {
        // If successful, remove from IndexedDB
        await store.delete(activity.id)
      }
    } catch (error) {
      console.error("Failed to sync activity:", error)
    }
  }
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request =\
