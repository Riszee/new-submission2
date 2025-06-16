import { getAuth, isAuthenticated } from "../../utils/auth";

export default class HomePresenter {
  constructor({ view, model, navigateCallback }) {
    this._view = view;
    this._model = model;
    this._navigateCallback = navigateCallback;
  }
  async initialize() {
    this._view.showLoading();
    try {
      const auth = getAuth();
      const token = isAuthenticated() && auth?.token ? auth.token : null;

      if (!token) {
        this._view.showLoginMessage();
        this._view.initMap([]); // Tampilkan map meskipun belum login
        return;
      }

      const [storiesResponse, bookmarkedIds] = await Promise.all([
        this._model.getStories({
          page: 1,
          size: 12,
          location: 1,
          token,
        }),
        this._model.getBookmarkedIds(),
      ]);

      if (storiesResponse.error) {
        this._view.showErrorDialog(storiesResponse.message, true);
        return;
      }

      this._view.displayStories(storiesResponse.listStory, bookmarkedIds);
      this._view.initMap(storiesResponse.listStory);

      // Setup event listeners for bookmark functionality
      this._view.setupEventListeners({
        onBookmarkToggle: this._handleBookmarkToggle.bind(this),
      });
    } catch (error) {
      const msg =
        error && error.message
          ? error.message
          : String(error) || "Unknown error";
      this._view.showErrorDialog(`Failed to load stories: ${msg}`, true);
    } finally {
      this._view.hideLoading();
    }
  }

  async _handleBookmarkToggle(story, isCurrentlyBookmarked) {
    try {
      const newBookmarkStatus = await this._model.toggleBookmark(
        story,
        isCurrentlyBookmarked
      );
      this._view.updateBookmarkButton(story.id, newBookmarkStatus);

      const message = newBookmarkStatus
        ? "Story added to bookmarks!"
        : "Story removed from bookmarks!";
      this._view.showMessage(message, "success");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      this._view.showMessage(
        "Failed to update bookmark. Please try again.",
        "error"
      );
    }
  }
}
