export default class RegisterView {
  constructor() {
    this.form = null;
    this.nameInput = null;
    this.emailInput = null;
    this.passwordInput = null;
    this.loadingContainer = null;
    this.nameError = null;
    this.emailError = null;
    this.passwordError = null;
    this._onNavigate = null;
  }

  setNavigationCallback(callback) {
    this._onNavigate = callback;
  }

  render() {
    return `
      <section class="container register-section">
        <h1 class="section-title">Create Your Account</h1>
        <form id="register-form" class="register-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Enter your name">
            <p class="error-message" id="name-error"></p>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
            <p class="error-message" id="email-error"></p>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="Enter your password">
            <p class="error-message" id="password-error"></p>
          </div>
          <button type="submit" class="submit-button">Register</button>
        </form>
        <p class="login-link">Already have an account? <a href="/login">Login here</a></p>
        <div class="loading-container" aria-live="polite" aria-busy="false">
          <div class="loader" aria-label="Loading"></div>
        </div>
      </section>
    `;
  }

  initializeDOM() {
    this.form = document.querySelector('#register-form');
    this.nameInput = document.querySelector('#name');
    this.emailInput = document.querySelector('#email');
    this.passwordInput = document.querySelector('#password');
    this.loadingContainer = document.querySelector('.loading-container');
    this.nameError = document.querySelector('#name-error');
    this.emailError = document.querySelector('#email-error');
    this.passwordError = document.querySelector('#password-error');
  }

  setupEventListeners({ onSubmitForm }) {
    this.initializeDOM();

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors();
      const name = this.nameInput.value.trim();
      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value.trim();
      await onSubmitForm({ name, email, password });
    });
  }

  showLoading() {
    this.loadingContainer.classList.add('active');
    this.loadingContainer.setAttribute('aria-busy', 'true');
  }

  hideLoading() {
    this.loadingContainer.classList.remove('active');
    this.loadingContainer.setAttribute('aria-busy', 'false');
  }

  showError(field, message) {
    if (field === 'name') {
      this.nameError.textContent = message;
      this.nameError.style.display = 'block';
    } else if (field === 'email') {
      this.emailError.textContent = message;
      this.emailError.style.display = 'block';
    } else if (field === 'password') {
      this.passwordError.textContent = message;
      this.passwordError.style.display = 'block';
    }
  }

  clearErrors() {
    this.nameError.textContent = '';
    this.nameError.style.display = 'none';
    this.emailError.textContent = '';
    this.emailError.style.display = 'none';
    this.passwordError.textContent = '';
    this.passwordError.style.display = 'none';
  }

  showDialog(message, success = false) {
    const dialog = document.createElement('dialog');
    dialog.classList.add('alert-dialog');
    dialog.innerHTML = `
      <div class="dialog-content">
        <p>${message}</p>
        <button class="dialog-button">OK</button>
      </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.querySelector('.dialog-button').addEventListener('click', () => {
      dialog.close();
      dialog.remove();
      if (success && this._onNavigate) {
        this._onNavigate('/login');
      }
    });
  }
}