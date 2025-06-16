import { showFormattedDate } from "../../utils/index";

export default class DetailView {
    constructor() {
        this._onNavigate = null;
        this._map = null;
    }

    setNavigationCallback(callback) {
        this._onNavigate = callback;
    }

    render() {
        return `
      <section class="container detail-container">
        <div class="detail-header">
          <h1 class="section-title">Story Details</h1>
        </div>
        <article id="story-detail" class="story-detail-card" role="article"></article>
        <div class="map-container">
          <h2 class="map-title">Location</h2>
          <div id="map" class="map"></div>
        </div>
      </section>
    `;
    }
    displayStory(story, isBookmarked = false) {
        document.querySelector("#story-detail").innerHTML = `
      <div class="story-content">
        <h2 id="story-${story.id}" class="story-title" tabindex="0">${
            story.name
        }</h2>
        <div class="story-image-container">
          <img src="${
              story.photoUrl ||
              "https://via.placeholder.com/300x169?text=No+Image"
          }" alt="${
            story.description
        }" class="story-image" loading="lazy" onerror="this.src='https://via.placeholder.com/300x169?text=Image+Error'"/>
        </div>
        <div class="story-meta">
          <p class="story-date"><i class="fas fa-calendar-alt"></i> Posted on ${showFormattedDate(
              story.createdAt
          )}</p>          <button class="bookmark-btn ${
            isBookmarked ? "bookmarked" : ""
        }" 
                  id="bookmark-btn"
                  data-id="${story.id}" 
                  data-name="${story.name}"
                  data-description="${story.description}"
                  data-photourl="${story.photoUrl || ""}"
                  data-createdat="${story.createdAt}"
                  data-lat="${story.lat || ""}"
                  data-lon="${story.lon || ""}"
                  title="${
                      isBookmarked
                          ? "Remove from bookmarks"
                          : "Add to bookmarks"
                  }"
                  aria-label="${
                      isBookmarked
                          ? "Remove from bookmarks"
                          : "Add to bookmarks"
                  }">
            <i class="fas fa-bookmark"></i>
            ${isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
        <p class="story-description">${story.description}</p>
      </div>
    `;
    }
    setupMap(story, onMapReady) {
        // Check if map is already initialized and remove it
        if (this._map) {
            this._map.remove();
            this._map = null;
        }

        // Initialize new map
        this._map = L.map("map", {
            zoomControl: true,
            scrollWheelZoom: false,
        }).setView(
            story.lat && story.lon
                ? [story.lat, story.lon]
                : [-6.2088, 106.8456],
            5
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            className: "map-tiles",
        }).addTo(this._map);
        if (story.lat && story.lon) {
            L.marker([story.lat, story.lon], {
                icon: L.divIcon({
                    className: "custom-marker",
                    html: `<div class="marker-pin"><i class="fas fa-map-marker-alt"></i></div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                }),
            })
                .addTo(this._map)
                .bindPopup(
                    `
          <div class="map-popup">
            <h3>${story.name}</h3>
            <p>${story.description.substring(0, 100)}${
                        story.description.length > 100 ? "..." : ""
                    }</p>
          </div>
        `
                )
                .openPopup();
        }

        onMapReady();
    }

    animateStoryCard() {
        const storyCard = document.querySelector(".story-detail-card");
        if (storyCard) {
            storyCard.classList.add("animate");
        }
    }

    showErrorDialog(message, redirectToContent = false) {
        const dialog = document.createElement("dialog");
        dialog.classList.add("alert-dialog");
        dialog.innerHTML = `
      <div class="dialog-content">
        <p>${message}</p>
        <button class="dialog-button">OK</button>
      </div>
    `;
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.querySelector(".dialog-button").addEventListener("click", () => {
            dialog.close();
            dialog.remove();
            if (redirectToContent && this._onNavigate) {
                this._onNavigate("/content");
            }
        });
    }

    setupEventListeners({ onBookmarkToggle }) {
        const bookmarkBtn = document.querySelector("#bookmark-btn");
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                const button = e.target.closest(".bookmark-btn");
                const storyData = {
                    id: button.dataset.id,
                    name: button.dataset.name || "Untitled Story",
                    description:
                        button.dataset.description ||
                        "No description available",
                    photoUrl: button.dataset.photourl || "",
                    createdAt:
                        button.dataset.createdat || new Date().toISOString(),
                    lat: button.dataset.lat
                        ? parseFloat(button.dataset.lat)
                        : null,
                    lon: button.dataset.lon
                        ? parseFloat(button.dataset.lon)
                        : null,
                    bookmarkedAt: new Date().toISOString(),
                };

                const isBookmarked = button.classList.contains("bookmarked");
                await onBookmarkToggle(storyData, isBookmarked);
            });
        }
    }

    updateBookmarkButton(isBookmarked) {
        const button = document.querySelector("#bookmark-btn");
        if (button) {
            if (isBookmarked) {
                button.classList.add("bookmarked");
                button.innerHTML = '<i class="fas fa-bookmark"></i> Bookmarked';
                button.title = "Remove from bookmarks";
                button.setAttribute("aria-label", "Remove from bookmarks");
            } else {
                button.classList.remove("bookmarked");
                button.innerHTML = '<i class="fas fa-bookmark"></i> Bookmark';
                button.title = "Add to bookmarks";
                button.setAttribute("aria-label", "Add to bookmarks");
            }
        }
    }

    showMessage(message, type = "info") {
        // Create a toast notification
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "error" ? "#f44336" : "#4CAF50"};
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.style.opacity = "1";
        }, 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    cleanup() {
        // Clean up map instance
        if (this._map) {
            this._map.remove();
            this._map = null;
        }
    }
}
