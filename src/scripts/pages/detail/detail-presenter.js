import { getAuth } from "../../utils/auth";
import { parseActivePathname } from "../../routes/url-parser";

export default class DetailPresenter {
    constructor({ view, model, navigateCallback }) {
        this._view = view;
        this._model = model;
        this._navigateCallback = navigateCallback;
    }
    async initialize() {
        const auth = getAuth();
        if (!auth) {
            this._navigateCallback("/login");
            return;
        }

        const { id } = parseActivePathname();
        try {
            const [storyResponse, isBookmarked] = await Promise.all([
                this._model.getStoryDetail(id, auth.token),
                this._model.isBookmarked(id),
            ]);

            if (storyResponse.error) {
                this._view.showErrorDialog(storyResponse.message, true);
                return;
            }

            this._view.displayStory(storyResponse.story, isBookmarked);
            this._view.setupMap(storyResponse.story, () => {
                this._view.animateStoryCard();
            });

            // Setup event listeners for bookmark functionality
            this._view.setupEventListeners({
                onBookmarkToggle: this._handleBookmarkToggle.bind(this),
            });
        } catch (error) {
            this._view.showErrorDialog(
                `Failed to load story: ${error.message}`,
                true
            );
        }
    }

    async _handleBookmarkToggle(story, isCurrentlyBookmarked) {
        try {
            const newBookmarkStatus = await this._model.toggleBookmark(
                story,
                isCurrentlyBookmarked
            );
            this._view.updateBookmarkButton(newBookmarkStatus);

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
