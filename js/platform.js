(function () {
  'use strict';
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true'));
  });
  nav.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
  });
document.querySelectorAll('[data-demo-src]').forEach(function (button) {
  var container = button.closest('.sensor-card');
  var image = container.querySelector('.demo-image');
  var stop = container.querySelector('.demo-stop');
  var status = container.querySelector('.sensor-demo-status');
  function restore() {
    image.src = image.dataset.poster;
    stop.hidden = true;
    button.hidden = false;
    button.setAttribute('aria-pressed', 'false');
  }
  button.addEventListener('click', function () {
    status.textContent = 'Loading demo…';
    image.onload = function () { status.textContent = ''; };
    image.onerror = function () {
      image.onload = null;
      image.onerror = null;
      restore();
      status.textContent = 'Demo could not load. Open the example on GitHub to see the source.';
      button.focus({ preventScroll: true });
    };
    image.src = button.dataset.demoSrc;
    button.hidden = true;
    button.setAttribute('aria-pressed', 'true');
    stop.hidden = false;
    stop.focus({ preventScroll: true });
  });
  stop.addEventListener('click', function () {
    image.onload = null;
    image.onerror = null;
    status.textContent = '';
    restore();
    button.focus({ preventScroll: true });
  });
});
})();

(function () {
  'use strict';
  var galleries = document.querySelectorAll('[data-example-gallery]');
  if (!galleries.length) return;
  var viewer = document.querySelector('.build-viewer');
  var image = viewer.querySelector('.build-viewer-image');
  var info = viewer.querySelector('.build-viewer-info');
  var counter = viewer.querySelector('.build-viewer-counter');
  var current = 0;
  var items = [];
  var origin;
  var request;
  function show(index) {
    current = (index + items.length) % items.length;
    var item = items[current];
    image.src = item.href;
    image.alt = item.querySelector('img').alt;
    var hideCaption = item.closest('[data-example-gallery]').hasAttribute('data-hide-caption');
    viewer.querySelector('.build-viewer-caption').hidden = hideCaption;
    viewer.setAttribute('aria-label', image.alt);
    counter.textContent = (current + 1) + ' / ' + items.length;
    info.hidden = true;
    info.textContent = '';
    if (request) request.abort();
    if (item.dataset.infoSrc) {
      request = new AbortController();
      fetch(item.dataset.infoSrc, { signal: request.signal })
        .then(function (response) { if (!response.ok) throw new Error('No image description'); return response.text(); })
        .then(function (text) { info.textContent = text.trim(); info.hidden = !text.trim(); })
        .catch(function () {});
    }
  }
  galleries.forEach(function (gallery) {
  gallery.addEventListener('click', function (event) {
    var link = event.target.closest('[data-build-image]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    items = Array.from(gallery.querySelectorAll('[data-build-image]')).filter(function (item) { return !item.closest('figure').hidden; });
    origin = link;
    show(items.indexOf(link));
    viewer.showModal();
    document.documentElement.classList.add('build-viewer-open');
  });
  });
  viewer.querySelector('[data-viewer-prev]').addEventListener('click', function () { show(current - 1); });
  viewer.querySelector('[data-viewer-next]').addEventListener('click', function () { show(current + 1); });
  viewer.querySelector('[data-viewer-close]').addEventListener('click', function () { viewer.close(); });
  viewer.addEventListener('click', function (event) {
    if (event.target !== viewer) return;
    var rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  viewer.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('close', function () {
    document.documentElement.classList.remove('build-viewer-open');
    if (request) request.abort();
    image.removeAttribute('src');
    if (origin) origin.focus({ preventScroll: true });
  });
})();
