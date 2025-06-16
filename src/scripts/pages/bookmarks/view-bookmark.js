import { showFormattedDate } from "../../utils/index.js";
import {
  deleteReport as deleteReportDB,
  getReport,
  saveReport,
  getAllBookmarkedReports,
} from "../../data/indexed-DB.js";

const BookmarkView = {
  renderContainer() {
    return `
      <section class="bookmark-section">
        <div class="bookmark-header">
          <div class="header-content">
            <i class="fas fa-bookmark header-icon"></i>
            <h2 class="section-title">Bookmarked Stories</h2>
            <p class="section-subtitle">Your collection of saved stories</p>
          </div>
        </div>
        <div id="bookmark-list" class="bookmark-grid"></div>
      </section>
    `;
  },
  renderBookmarks(bookmarks) {
    const container = document.querySelector("#bookmark-list");
    if (!bookmarks.length) {
      container.innerHTML = `
        <div class="empty-bookmark-state">
          <div class="empty-icon-container">
            <i class="fas fa-bookmark empty-icon"></i>
            <div class="empty-icon-bg"></div>
          </div>
          <h3 class="empty-title">No Bookmarks Yet</h3>
          <p class="empty-description">Start building your personal collection by bookmarking stories you love!</p>
          <div class="empty-actions">
            <a href="/" class="btn-primary browse-btn">
              <i class="fas fa-compass"></i>
              <span>Explore Stories</span>
            </a>
          </div>
          <div class="empty-decoration">
            <div class="decoration-circle"></div>
            <div class="decoration-circle"></div>
            <div class="decoration-circle"></div>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = bookmarks
      .map(
        (story) => `
        <article class="story-card" aria-labelledby="story-title-${story.id}">
          <div class="story-info">
            <h2 class="story-title" id="story-title-${story.id}">${
          story.name || story.title || "Untitled Story"
        }</h2>
            <img src="${
              story.photoUrl ||
              story.photo ||
              story.image ||
              story.thumbnail ||
              story.pictureUrl ||
              story.imageUrl ||
              ""
            }"
                 alt="Photo by ${story.name || "Unknown"}"
                 class="story-img" onerror="this.style.display='none';" loading="lazy" />
            <p class="story-desc">${
              story.description || "No description available"
            }</p>
            <p class="story-date">${
              story.bookmarkedAt ? showFormattedDate(story.bookmarkedAt) : ""
            }</p>
            <div class="story-actions">
              <a href="/stories/${
                story.id
              }" class="bookmark-btn view-btn" data-id="${
          story.id
        }"><i class="fas fa-eye"></i> View Details</a>
              <button class="bookmark-btn bookmarked delete-btn" data-id="${
                story.id
              }"><i class="fas fa-bookmark"></i> Bookmarked</button>
            </div>
          </div>
        </article>
      `
      )
      .join("");

    this._addEventListeners();
  },
  async init() {
    try {
      const bookmarks = await getAllBookmarkedReports();
      console.log("Loaded bookmarks:", bookmarks); // Debug log
      this.renderBookmarks(bookmarks);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      const container = document.querySelector("#bookmark-list");
      container.innerHTML =
        "<p>Error loading bookmarks. Please try again later.</p>";
    }
  },

  _addEventListeners() {
    const container = document.querySelector("#bookmark-list");

    // View details button handler
    container.addEventListener("click", async (e) => {
      if (e.target.classList.contains("view-btn")) {
        const reportId = e.target.dataset.id;
        // Navigasi ke halaman detail story
        window.location.hash = `/stories/${reportId}`;
      }
    });

    // Delete bookmark button handler
    container.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const reportId = e.target.dataset.id;
        try {
          await deleteReportDB(reportId);
          // Refresh the bookmarks list
          this.init();
        } catch (error) {
          console.error("Error deleting bookmark:", error);
        }
      }
    });
  },
};

export default BookmarkView;
