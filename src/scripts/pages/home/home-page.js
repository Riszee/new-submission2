import HomeView from "./home-view";
import HomeModel from "./home-model";
import HomePresenter from "./home-presenter";

export default class HomePage {
    constructor(navigateCallback) {
        this._view = new HomeView();
        this._model = new HomeModel();
        this._presenter = new HomePresenter({
            view: this._view,
            model: this._model,
            navigateCallback,
        });
    }

    async render() {
        return this._view.render();
    }

    async afterRender() {
        await this._presenter.initialize();
    }

    cleanup() {
        this._view.cleanup();
    }
}
