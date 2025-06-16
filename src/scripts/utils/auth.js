const AUTH_KEY = 'auth';

export function setAuth({ userId, name, token }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ userId, name, token }));
}

export function getAuth() {
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

export function removeAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  return !!getAuth();
}