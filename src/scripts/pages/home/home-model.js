import { getStories as fetchStories } from "../../data/api";
import {
  saveReport,
  deleteReport,
  getReport,
  getAllBookmarkedReports,
} from "../../data/indexed-DB";
import {
  saveStoriesToCache,
  getCachedStories,
  clearCachedStories,
} from "../../data/stories-cache";

export default class HomeModel {
  async getStories({ page = 1, size = 10, location = 0, token }) {
    try {
      const response = await fetchStories({ page, size, location, token });
      if (response && response.listStory) {
        await clearCachedStories();
        await saveStoriesToCache(response.listStory);
      }
      return response;
    } catch (error) {
      // Fallback ke cache jika fetch gagal
      const cachedStories = await getCachedStories();
      if (cachedStories && cachedStories.length > 0) {
        return {
          listStory: cachedStories,
          error: false,
          message: "Menampilkan data cache",
        };
      } else {
        // Pastikan error yang dilempar selalu punya message
        throw new Error(
          error && error.message
            ? error.message
            : "Gagal memuat stories dan cache kosong"
        );
      }
    }
  }

  async getAllBookmarks() {
    return await getAllBookmarkedReports();
  }

  async getBookmarkedIds() {
    try {
      const bookmarks = await getAllBookmarkedReports();
      return bookmarks.map((bookmark) => bookmark.id);
    } catch (error) {
      console.error("Error getting bookmarked IDs:", error);
      return [];
    }
  }

  async toggleBookmark(story, isCurrentlyBookmarked) {
    try {
      if (isCurrentlyBookmarked) {
        await deleteReport(story.id);
        return false;
      } else {
        await saveReport(story);
        return true;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      throw error;
    }
  }

  async isBookmarked(storyId) {
    try {
      const result = await getReport(storyId);
      return !!result;
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      return false;
    }
  }
}
