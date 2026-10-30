(function () {
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
  const INTERVAL = 5000;

  const PAUSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const PLAY_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  let index = 0;
  let timer = null;
  let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(n) {
    slides[index].classList.remove("active");
    index = (n + slides.length) % slides.length;
    slides[index].classList.add("active");
  }
  function stop() { clearInterval(timer); timer = null; }
  function start() { stop(); if (!paused && slides.length > 1) timer = setInterval(() => show(index + 1), INTERVAL); }
  function renderPause() {
    pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
    pauseBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
  }

  prevBtn.addEventListener("click", () => { show(index - 1); start(); });
  nextBtn.addEventListener("click", () => { show(index + 1); start(); });
  pauseBtn.addEventListener("click", () => { paused = !paused; renderPause(); start(); });

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  renderPause();
  start();
})();