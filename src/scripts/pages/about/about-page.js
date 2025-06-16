import AboutView from './about-view';
import AboutModel from './about-model';
import AboutPresenter from './about-presenter';

export default class AboutPage {
  constructor() {
    this._view = new AboutView();
    this._model = new AboutModel();
    this._presenter = new AboutPresenter({ view: this._view, model: this._model });
  }

  async render() {
    return this._view.render();
  }

  async afterRender() {
    await this._presenter.initialize();
  }
}