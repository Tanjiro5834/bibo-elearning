/* Background photo slideshow for login pages (prev / pause / next).
   Static login pages start it automatically; the student SPA calls
   window.initBgSlideshow() every time it renders the login view. */
(function () {
  const INTERVAL = 5000;
  const PAUSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const PLAY_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  // Shared across inits so re-rendering never leaves an old timer running
  let timer = null;
  let onVisibility = null;

  function teardown() {
    clearInterval(timer);
    timer = null;
    if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
    onVisibility = null;
  }

  function initBgSlideshow() {
    teardown();

    const root = document.querySelector(".bg-slideshow");
    if (!root) return;

    const slides = Array.from(root.querySelectorAll(".bg-slide"));
    if (slides.length < 2) {
      root.querySelector(".bg-controls")?.remove();
      return;
    }

    const prevBtn = root.querySelector("[data-prev]");
    const nextBtn = root.querySelector("[data-next]");
    const pauseBtn = root.querySelector("[data-pause]");

    let index = Math.max(0, slides.findIndex((s) => s.classList.contains("active")));
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(n) {
      slides[index].classList.remove("active");
      index = (n + slides.length) % slides.length;
      slides[index].classList.add("active");
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (paused) return;
      timer = setInterval(() => {
        if (!root.isConnected) return teardown(); // SPA navigated away from login
        show(index + 1);
      }, INTERVAL);
    }
    function renderPause() {
      pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
      pauseBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
    }

    prevBtn.addEventListener("click", () => { show(index - 1); start(); });
    nextBtn.addEventListener("click", () => { show(index + 1); start(); });
    pauseBtn.addEventListener("click", () => { paused = !paused; renderPause(); start(); });

    onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    renderPause();
    start();
  }

  window.initBgSlideshow = initBgSlideshow;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBgSlideshow);
  } else {
    initBgSlideshow();
  }
})();