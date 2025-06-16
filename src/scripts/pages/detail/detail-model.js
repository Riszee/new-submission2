import { getStoryDetail } from "../../data/api";
import { saveReport, deleteReport, getReport } from "../../data/indexed-DB";

export default class DetailModel {
    async getStoryDetail(id, token) {
        return await getStoryDetail(id, token);
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
