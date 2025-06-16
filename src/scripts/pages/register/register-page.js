import RegisterView from './register-view';
import RegisterModel from './register-model';
import RegisterPresenter from './register-presenter';

export default class RegisterPage {
  constructor(navigateCallback) {
    this._view = new RegisterView();
    this._model = new RegisterModel();
    this._presenter = new RegisterPresenter({ view: this._view, model: this._model, navigateCallback });
  }

  async render() {
    return this._view.render();
  }

  async afterRender() {
    await this._presenter.initialize();
  }
}