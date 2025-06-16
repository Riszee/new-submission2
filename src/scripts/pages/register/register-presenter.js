export default class RegisterPresenter {
  constructor({ view, model, navigateCallback }) {
    this._view = view;
    this._model = model;
    this._navigateCallback = navigateCallback;
  }

  async initialize() {
    this._view.setupEventListeners({
      onSubmitForm: this._handleSubmitForm.bind(this),
    });
  }

  async _handleSubmitForm({ name, email, password }) {
    if (!name) {
      this._view.showError('name', 'Name is required');
      return;
    }
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
      const response = await this._model.register({ name, email, password });
      if (response.error) {
        this._view.showDialog(response.message);
        return;
      }
      this._view.showDialog('Registration successful! Please login.', true);
    } catch (error) {
      this._view.showDialog(`Registration failed: ${error.message}`);
    } finally {
      this._view.hideLoading();
    }
  }
}