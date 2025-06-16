import { addStory, addGuestStory } from '../../data/api';
import { subscribePush } from '../../utils/notification';
import { getAuth, isAuthenticated } from '../../utils/auth';

export default class AddStoryModel {
  async addAuthenticatedStory({ description, photo, lat, lon, token }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== null && lon !== null) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    return await addStory({ description, photo, lat, lon, token });
  }

  async addGuestStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== null && lon !== null) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    return await addGuestStory({ description, photo, lat, lon });
  }

  async capturePhoto(facingMode) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode || 'user' }
      });
    } catch (error) {
      throw new Error('Camera access denied');
    }
  }

  async subscribeToNotifications() {
    return await subscribePush();
  }

  getAuthToken() {
    const auth = getAuth();
    return auth?.token || null;
  }

  isAuthenticated() {
    return isAuthenticated();
  }
}