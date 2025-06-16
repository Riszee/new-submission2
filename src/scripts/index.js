import App from "./pages/app";
import "../styles/styles.css";
import "regenerator-runtime/runtime";
import {
  subscribePush,
  unsubscribePush,
  isPushNotificationSupported,
} from "./utils/notification";

const app = new App({
  navigationDrawer: document.querySelector("#navigation-drawer"),
  drawerButton: document.querySelector("#drawer-button"),
  content: document.querySelector("#main-content"),
});

// Web Push Notification logic
async function handleWebPushNotification() {
  if (!isPushNotificationSupported()) return;
  if (!sessionStorage.getItem("pushSubscribed")) {
    const token = localStorage.getItem("token");
    if (token) {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission === "granted") {
        try {
          const result = await subscribePush();
          if (!result.error) {
            alert("Push notifications subscribed successfully!");
            sessionStorage.setItem("pushSubscribed", "true");
          } else {
            alert(
              `Failed to subscribe to push notifications: ${result.message}`
            );
          }
        } catch (err) {
          alert(`Failed to subscribe to push notifications: ${err.message}`);
        }
      } else if (permission === "denied") {
        alert(
          "You have blocked notifications. Please enable them in your browser settings to receive push notifications."
        );
      }
    }
  }
}

window.addEventListener("popstate", () => {
  app.renderPage();
});

window.addEventListener("hashchange", () => {
  app.renderPage();
});

window.addEventListener("DOMContentLoaded", () => {
  app.renderPage();
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (
      link &&
      link.getAttribute("href") &&
      link.getAttribute("href").startsWith("/")
    ) {
      e.preventDefault();
      window.location.hash = link.getAttribute("href");
    }
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Service Worker registered");
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }
  handleWebPushNotification();
});
