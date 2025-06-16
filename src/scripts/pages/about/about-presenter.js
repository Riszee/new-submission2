export default class AboutPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async initialize() {
    this._view.renderProfile(this._model.getProfile());
  }
}