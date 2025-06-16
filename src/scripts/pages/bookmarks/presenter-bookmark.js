import BookmarkModel from './model-bookmark.js';
import BookmarkView from './view-bookmark.js';

const BookmarkPresenter = {
  async init(container) {
    container.innerHTML = BookmarkView.renderContainer();

    const bookmarks = await BookmarkModel.getAllBookmarks();
    BookmarkView.renderBookmarks(bookmarks);
  },
};

export default BookmarkPresenter;
