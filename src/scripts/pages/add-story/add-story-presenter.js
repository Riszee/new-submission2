export default class AddStoryPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async initialize() {
    this._view.setupEventListeners({
      onCapturePhoto: this._handleCapturePhoto.bind(this),
      onSubmitForm: this._handleSubmitForm.bind(this),
      onCloseDialog: this._handleCloseDialog.bind(this),
      onMapClick: this._handleMapClick.bind(this),
    });
    this._view.setupMap();
  }

  async _handleCapturePhoto(facingMode) {
    try {
      const stream = await this._model.capturePhoto(facingMode);
      return stream;
    } catch (error) {
      this._view.showDialog(error.message, false);
      return null;
    }
  }

  async _handleSubmitForm({ description, photo, lat, lon }) {
    if (!photo) {
      this._view.showDialog('Photo is required', false);
      return;
    }

    if (photo.size > 1024 * 1024) {
      this._view.showDialog('Photo must be less than 1MB', false);
      return;
    }

    this._view.showLoading();
    try {
      const token = this._model.getAuthToken();
      const isAuth = this._model.isAuthenticated();
      let response;
      if (isAuth && token) {
        response = await this._model.addAuthenticatedStory({ description, photo, lat, lon, token });
      } else {
        response = await this._model.addGuestStory({ description, photo, lat, lon });
      }

      await this._model.subscribeToNotifications();
      this._view.showDialog('Story posted successfully!', true);
    } catch (error) {
      this._view.showDialog(`Failed to post story: ${error.message}`, false);
    } finally {
      this._view.hideLoading();
    }
  }

  _handleMapClick(lat, lng, map) {
    this._view.updateMapMarker(lat, lng, map);
  }

  _handleCloseDialog() {
    this._view.cleanup();
  }
}