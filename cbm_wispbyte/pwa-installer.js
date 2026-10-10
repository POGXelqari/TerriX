(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .catch((err) => console.error("SW error:", err));
    });
  }

  let defPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    defPrompt = e;
    const btn = document.getElementById("pwaInstallBtn");
    if (btn) {
      btn.style.display = "inline-flex";
      btn.onclick = async () => {
        if (!defPrompt) return;
        defPrompt.prompt();
        const { outcome } = await defPrompt.userChoice;
        if (outcome === "accepted") btn.style.display = "none";
        defPrompt = null;
      };
    }
  });

  // Track appinstalled event
  window.addEventListener("appinstalled", () => {
    const btn = document.getElementById("pwaInstallBtn");
    if (btn) btn.style.display = "none";
    defPrompt = null;
  });
})();
