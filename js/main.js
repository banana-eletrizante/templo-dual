import { App } from "./ui/app.js";

const root = document.getElementById("app");
const app = new App(root);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.__tdPrompt = event;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

export { app };
