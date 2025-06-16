import { register } from '../../data/api';

export default class RegisterModel {
  async register({ name, email, password }) {
    return await register({ name, email, password });
  }
}