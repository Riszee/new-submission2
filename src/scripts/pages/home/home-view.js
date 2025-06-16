import { showFormattedDate } from "../../utils/index";

export default class HomeView {
  constructor() {
    this._onNavigate = null;
    this._map = null;
  }

  setNavigationCallback(callback) {
    this._onNavigate = callback;
  }

  render() {
    return `
      <section class="container">
        <h1 class="section-title">Explore Stories</h1>
        <div class="map-container">
          <div id="map" class="map" style="display: block; height: 350px;"></div>
        </div>
        <div class="loading-container" id="loading" aria-live="polite" aria-busy="false">
          <div class="loader" aria-label="Loading"></div>
        </div>
        <div id="stories-list" class="stories-grid"></div>
      </section>
    `;
  }

  showLoading() {
    const loadingContainer = document.querySelector("#loading");
    if (loadingContainer) {
      loadingContainer.classList.add("active");
      loadingContainer.setAttribute("aria-busy", "true");
    } else {
      console.warn("Loading container not found in DOM");
    }
  }

  hideLoading() {
    const loadingContainer = document.querySelector("#loading");
    if (loadingContainer) {
      loadingContainer.classList.remove("active");
      loadingContainer.setAttribute("aria-busy", "false");
    } else {
      console.warn("Loading container not found in DOM");
    }
  }

  showLoginMessage() {
    const storiesList = document.querySelector("#stories-list");
    storiesList.innerHTML = `
      <p class="login-message">Please <a href="/login">login</a> first to view stories.</p>
    `;
  }
  displayStories(stories, bookmarkedIds = []) {
    const storiesList = document.querySelector("#stories-list");
    storiesList.innerHTML = stories
      .map((story) => {
        const isBookmarked = bookmarkedIds.includes(story.id);
        return `
      <article role="article" aria-labelledby="story-${
        story.id
      }" class="story-card">
        <h2 id="story-${story.id}">${story.name}</h2>
        <img src="${story.photoUrl || "/images/logo-384.png"}" alt="${
          story.description
        }" loading="lazy" onerror="this.src='/images/logo-384.png'"/>
        <p>${story.description.substring(0, 100)}${
          story.description.length > 100 ? "..." : ""
        }</p>
        <p class="story-date">Posted on ${showFormattedDate(
          story.createdAt
        )}</p>
        <div class="story-actions">
          <a href="/stories/${
            story.id
          }" class="story-link">View Details</a>          <button class="bookmark-btn ${
          isBookmarked ? "bookmarked" : ""
        }" 
                  data-id="${story.id}" 
                  data-name="${story.name}"
                  data-description="${story.description}"
                  data-photourl="${story.photoUrl || ""}"
                  data-createdat="${story.createdAt}"
                  data-lat="${story.lat || ""}"
                  data-lon="${story.lon || ""}"
                  title="${
                    isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
                  }"
                  aria-label="${
                    isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
                  }">
            <i class="fas fa-bookmark"></i>
            ${isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
      </article>
    `;
      })
      .join("");
  }
  initMap(stories) {
    if (!window.L) {
      console.error("Leaflet library is not loaded.");
      return;
    }

    // Check if map is already initialized and remove it
    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    // Initialize new map
    this._map = L.map("map").setView([-6.2088, 106.8456], 5);

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri",
      }
    );
    osm.addTo(this._map);

    const baseLayers = {
      OpenStreetMap: osm,
      Satellite: satellite,
    };
    L.control.layers(baseLayers).addTo(this._map);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(this._map)
          .bindPopup(
            `<b>${story.name}</b><br>${story.description.substring(0, 100)}${
              story.description.length > 100 ? "..." : ""
            }`
          );
      }
    });
  }

  setupEventListeners({ onBookmarkToggle }) {
    const storiesList = document.querySelector("#stories-list");
    if (storiesList) {
      storiesList.addEventListener("click", async (e) => {
        if (e.target.closest(".bookmark-btn")) {
          e.preventDefault();
          const button = e.target.closest(".bookmark-btn");
          const storyData = {
            id: button.dataset.id,
            name: button.dataset.name || "Untitled Story",
            description:
              button.dataset.description || "No description available",
            photoUrl: button.dataset.photourl || "",
            createdAt: button.dataset.createdat || new Date().toISOString(),
            lat: button.dataset.lat ? parseFloat(button.dataset.lat) : null,
            lon: button.dataset.lon ? parseFloat(button.dataset.lon) : null,
            bookmarkedAt: new Date().toISOString(),
          };

          const isBookmarked = button.classList.contains("bookmarked");
          await onBookmarkToggle(storyData, isBookmarked);
        }
      });
    }
  }

  updateBookmarkButton(storyId, isBookmarked) {
    const button = document.querySelector(`[data-id="${storyId}"]`);
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

  showErrorDialog(message, redirectToHome = false) {
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
      if (redirectToHome && this._onNavigate) {
        this._onNavigate("/");
      }
    });
  }

  cleanup() {
    // Clean up map instance
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}
