import {
  saveReport,
  deleteReport,
  getReport,
  getAllBookmarkedReports,
} from '../../data/indexed-DB.js';

const BookmarkModel = {
  async saveBookmark(report) {
    return saveReport(report);
  },

  async deleteBookmark(id) {
    return deleteReport(id);
  },

  async getBookmark(id) {
    return getReport(id);
  },

  async getAllBookmarks() {
    return getAllBookmarkedReports();
  },

  async isBookmarked(id) {
    const result = await getReport(id);
    return !!result;
  },
};

export default BookmarkModel;