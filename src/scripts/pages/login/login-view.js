export default class LoginView {
    constructor() {
        this.form = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.loadingContainer = null;
        this.emailError = null;
        this.passwordError = null;
        this._onNavigate = null;
    }
    setNavigationCallback(callback) {
        this._onNavigate =
            callback ||
            ((path) => {
                window.location.hash = path;
            });
    }

    render() {
        return `
      <section class="container register-section">
        <h1 class="section-title">Login to Your Account</h1>
        <form id="login-form" class="register-form">
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
          <button type="submit" class="submit-button">Login</button>
        </form>
        <p class="register-link">Don't have an account? <a href="/register">Register here</a></p>
        <div class="loading-container" aria-live="polite" aria-busy="false">
          <div class="loader" aria-label="Loading"></div>
        </div>
      </section>
    `;
    }

    initializeDOM() {
        this.form = document.querySelector("#login-form");
        this.emailInput = document.querySelector("#email");
        this.passwordInput = document.querySelector("#password");
        this.loadingContainer = document.querySelector(".loading-container");
        this.emailError = document.querySelector("#email-error");
        this.passwordError = document.querySelector("#password-error");
    }

    setupEventListeners({ onSubmitForm }) {
        this.initializeDOM();

        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            this.clearErrors();
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value.trim();
            await onSubmitForm({ email, password });
        });
    }

    showLoading() {
        this.loadingContainer.classList.add("active");
        this.loadingContainer.setAttribute("aria-busy", "true");
    }

    hideLoading() {
        this.loadingContainer.classList.remove("active");
        this.loadingContainer.setAttribute("aria-busy", "false");
    }

    showError(field, message) {
        if (field === "email") {
            this.emailError.textContent = message;
            this.emailError.style.display = "block";
        } else if (field === "password") {
            this.passwordError.textContent = message;
            this.passwordError.style.display = "block";
        }
    }

    clearErrors() {
        this.emailError.textContent = "";
        this.emailError.style.display = "none";
        this.passwordError.textContent = "";
        this.passwordError.style.display = "none";
    }
    showDialog(message, success = false) {
        const dialog = document.createElement("dialog");
        dialog.classList.add("alert-dialog");
        dialog.innerHTML = `
      <div class="dialog-content">
        <p>${message}</p>
        <button class="dialog-button">OK</button>
      </div>
    `;
        document.body.appendChild(dialog);
        dialog.showModal();
        const dialogButton = dialog.querySelector(".dialog-button");
        dialogButton.focus();

        if (success) {
            dialogButton.addEventListener("click", () => {
                dialog.close();
                dialog.remove();
                this._onNavigate("/");
            });
            // Auto redirect after 1.5 seconds
            setTimeout(() => {
                if (dialog.open) {
                    dialog.close();
                    dialog.remove();
                    this._onNavigate("/");
                }
            }, 1500);
        } else {
            dialogButton.addEventListener("click", () => {
                dialog.close();
                dialog.remove();
            });
        }
    }
}
