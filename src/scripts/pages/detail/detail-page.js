import DetailView from "./detail-view";
import DetailModel from "./detail-model";
import DetailPresenter from "./detail-presenter";

export default class DetailPage {
    constructor(navigateCallback) {
        this._view = new DetailView();
        this._model = new DetailModel();
        this._presenter = new DetailPresenter({
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
