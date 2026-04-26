(function(window) {
  'use strict';

  function bindHorizontalStepNavigation(element, options) {
    if (!element) {
      return;
    }

    var settings = options || {};
    var threshold = settings.threshold || 80;
    var lockMs = settings.lockMs || 360;
    var wheelDelta = 0;
    var locked = false;
    var touchStartX = 0;
    var touchStartY = 0;

    function unlock() {
      locked = false;
      wheelDelta = 0;
    }

    function navigate(direction) {
      if (locked) {
        return;
      }

      locked = true;

      if (direction > 0 && typeof settings.onNext === 'function') {
        settings.onNext();
      } else if (direction < 0 && typeof settings.onPrev === 'function') {
        settings.onPrev();
      }

      setTimeout(unlock, lockMs);
    }

    element.addEventListener('wheel', function(event) {
      if (settings.blockVerticalWheel && event.cancelable) {
        event.preventDefault();
      }

      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      wheelDelta += event.deltaX;

      if (Math.abs(wheelDelta) < threshold) {
        return;
      }

      navigate(wheelDelta > 0 ? 1 : -1);
      wheelDelta = 0;
    }, { passive: false });

    if (settings.touch) {
      element.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
      }, { passive: true });

      element.addEventListener('touchmove', function(event) {
        if (settings.blockTouchMove && event.cancelable) {
          event.preventDefault();
        }
      }, { passive: false });

      element.addEventListener('touchend', function(event) {
        var distanceX = event.changedTouches[0].clientX - touchStartX;
        var distanceY = event.changedTouches[0].clientY - touchStartY;

        if (Math.abs(distanceX) < threshold || Math.abs(distanceX) <= Math.abs(distanceY)) {
          return;
        }

        navigate(distanceX < 0 ? 1 : -1);
      }, { passive: true });
    }
  }

  window.bindHorizontalStepNavigation = bindHorizontalStepNavigation;
}(window));
