export default class LoginPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async initialize() {
    this._view.setupEventListeners({
      onSubmitForm: this._handleSubmitForm.bind(this),
    });
  }

  async _handleSubmitForm({ email, password }) {
    if (!email) {
      this._view.showError('email', 'Email is required');
      return;
    }
    if (!password) {
      this._view.showError('password', 'Password is required');
      return;
    }

    this._view.showLoading();
    try {
      const response = await this._model.login({ email, password });
      if (response.error) {
        this._view.showDialog(response.message, false);
        return;
      }
      await this._model.saveAuthData({
        userId: response.loginResult.userId,
        name: response.loginResult.name,
        token: response.loginResult.token,
      });
      this._view.showDialog('Login successful!', true);
    } catch (error) {
      this._view.showDialog(`Login failed: ${error.message}`, false);
    } finally {
      this._view.hideLoading();
    }
  }
}