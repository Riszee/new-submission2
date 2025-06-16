import LoginView from "./login-view";
import LoginModel from "./login-model";
import LoginPresenter from "./login-presenter";

export default class LoginPage {
    constructor(navigate) {
        this._navigate =
            navigate ||
            ((path) => {
                window.location.hash = path;
            });
        this._view = new LoginView();
        this._model = new LoginModel();
        this._presenter = new LoginPresenter({
            view: this._view,
            model: this._model,
        });
    }

    async render() {
        return this._view.render();
    }

    async afterRender() {
        this._view.setNavigationCallback(this._navigate);
        await this._presenter.initialize();
    }

    cleanup() {}
}
