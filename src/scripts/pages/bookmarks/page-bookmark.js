import BookmarkPresenter from './presenter-bookmark.js';

export default class BookmarksPage {
  constructor() {
    this._presenter = BookmarkPresenter;
  }

  async render() {
    return '<div id="bookmark-page" class="bookmark-content"></div>';
  }

  async afterRender() {
    const container = document.querySelector('#bookmark-page');
    await this._presenter.init(container);
  }
}
