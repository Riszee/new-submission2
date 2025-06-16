import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isAuthenticated, removeAuth } from "../utils/auth";

class App {
    #content = null;
    #drawerButton = null;
    #navigationDrawer = null;
    #currentPage = null;

    constructor({ navigationDrawer, drawerButton, content }) {
        this.#content = content;
        this.#drawerButton = drawerButton;
        this.#navigationDrawer = navigationDrawer;

        if (!this.#content || !this.#drawerButton || !this.#navigationDrawer) {
            console.error("App initialization failed: Missing DOM elements.");
            return;
        }

        this.#initialize();
    }

    #initialize() {
        this.#setupDrawer();
        this.#renderNavigation();
    }

    #setupDrawer() {
        this.#drawerButton.addEventListener("click", () => {
            this.#navigationDrawer.classList.toggle("open");
        });

        document.body.addEventListener("click", (event) => {
            if (
                !this.#navigationDrawer.contains(event.target) &&
                !this.#drawerButton.contains(event.target)
            ) {
                this.#navigationDrawer.classList.remove("open");
            }
        });
    }

    #renderNavigation() {
        const isLoggedIn = isAuthenticated();
        const navLinks = [
            { path: "/", label: "Home" },
            { path: "/bookmarks", label: "Bookmarks" }, // Tambahkan menu Bookmarks
            { path: "/about", label: "About" },
            { path: "/add-story", label: "Add Story" },
            ...(isLoggedIn
                ? [{ path: "/logout", label: "Logout" }]
                : [
                      { path: "/login", label: "Login" },
                      { path: "/register", label: "Register" },
                  ]),
        ];

        this.#navigationDrawer.innerHTML = `
      <ul class="nav-list">
        ${navLinks
            .map(
                (link) =>
                    `<li><a href="${link.path}" class="nav-link" ${
                        link.path === (window.location.hash.substring(1) || "/")
                            ? 'aria-current="page"'
                            : ""
                    }>${link.label}</a></li>`
            )
            .join("")}
      </ul>
    `;

        const newNavDrawer = this.#navigationDrawer.cloneNode(true);
        this.#navigationDrawer.parentNode.replaceChild(
            newNavDrawer,
            this.#navigationDrawer
        );
        this.#navigationDrawer = newNavDrawer;

        this.#navigationDrawer.addEventListener("click", (e) => {
            if (e.target.closest('a[href="/logout"]')) {
                e.preventDefault();
                removeAuth();
                this.#renderNavigation();
                window.location.hash = "/";
                this.renderPage();
            }
        });
    }

    async renderPage() {
        if (!this.#content) {
            console.error("Cannot render page: Content element is missing.");
            return;
        }

        if (
            this.#currentPage &&
            typeof this.#currentPage.cleanup === "function"
        ) {
            this.#currentPage.cleanup();
        }

        this.#renderNavigation();

        const url = getActiveRoute();
        const page = routes[url] || routes["/"];
        this.#currentPage = page;

        if (isAuthenticated() && (url === "/login" || url === "/register")) {
            window.location.hash = "/";
            return;
        }

        try {
            if (!document.startViewTransition) {
                this.#content.innerHTML = await page.render();
                setTimeout(async () => await page.afterRender(), 0);
                return;
            }

            await document.startViewTransition(async () => {
                this.#content.innerHTML = await page.render();
                setTimeout(async () => await page.afterRender(), 0);
            }).updateCallbackDone;
        } catch (error) {
            console.error("Error rendering page:", error);
            this.#content.innerHTML = `
        <p>Error loading page: ${error.message}. 
        <button onclick="window.location.reload()">Try Again</button></p>
      `;
        }
    }
}

export default App;
