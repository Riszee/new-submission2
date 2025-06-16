import { login } from '../../data/api';
import { setAuth } from '../../utils/auth';

export default class LoginModel {
  async login({ email, password }) {
    return await login({ email, password });
  }

  async saveAuthData({ userId, name, token }) {
    setAuth({ userId, name, token });
  }
}