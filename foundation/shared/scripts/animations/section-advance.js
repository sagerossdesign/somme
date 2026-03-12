import { clamp } from '../utils.js';

const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const getPageTop = (element) => window.scrollY + element.getBoundingClientRect().top;

const isViewportCenteredOn = (section) => {
  const rect = section.getBoundingClientRect();
  const centerY = window.innerHeight * 0.5;
  return rect.top <= centerY && rect.bottom >= centerY;
};

const animateScrollTo = (targetY, duration, onComplete) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();
  let frameId = null;

  const tick = (now) => {
    const rawProgress = clamp((now - startTime) / duration, 0, 1);
    const easedProgress = easeInOutCubic(rawProgress);
    window.scrollTo(0, startY + distance * easedProgress);

    if (rawProgress < 1) {
      frameId = requestAnimationFrame(tick);
      return;
    }

    frameId = null;
    window.scrollTo(0, targetY);
    onComplete?.();
  };

  frameId = requestAnimationFrame(tick);

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  };
};

const wait = (duration, onComplete) => {
  const timeoutId = window.setTimeout(() => {
    onComplete?.();
  }, duration);

  return () => {
    window.clearTimeout(timeoutId);
  };
};

export const initSectionAdvance = ({
  heroSelector = '#top',
  storySelector = '#story',
  teaSelector = '#tea',
  footerSelector = '#footer',
  wheelThreshold = 1,
  touchThreshold = 12,
  duration = 1150,
  storyFadeDuration = 800,
  storyToTeaDuration = 850,
  gestureCooldown = 260,
} = {}) => {
  const heroSection = document.querySelector(heroSelector);
  const storySection = document.querySelector(storySelector);
  const teaSection = document.querySelector(teaSelector);
  const footerSection = document.querySelector(footerSelector);
  const header = document.querySelector('.site-header');
  const teaLinks = [
    ...document.querySelectorAll(`a[href="${teaSelector}"]`),
  ];

  if (!heroSection || !storySection || !teaSection || !footerSection) {
    return () => {};
  }

  let locked = false;
  let cancelScrollAnimation = null;
  let cancelPendingPhase = null;
  let gestureLockedUntil = 0;
  let touchStartY = null;
  let touchLocked = false;

  const lockGestureCooldown = () => {
    gestureLockedUntil = performance.now() + gestureCooldown;
  };

  const setHeaderMode = (mode) => {
    if (!header) {
      return;
    }

    header.classList.toggle('is-on-light', mode === 'tea');
  };

  setHeaderMode('default');

  const runLockedTransition = (targetY, afterTransition, transitionDuration = duration) => {
    if (cancelScrollAnimation) {
      cancelScrollAnimation();
    }

    locked = true;
    cancelScrollAnimation = animateScrollTo(targetY, transitionDuration, () => {
      cancelScrollAnimation = null;
      const shouldUnlock = afterTransition?.();

      if (shouldUnlock !== false) {
        locked = false;
        lockGestureCooldown();
      }
    });
  };

  const runStoryExitTransition = ({
    targetY,
    afterTransition,
    transitionDuration = duration,
  } = {}) => {
    const storyController = storySection.__scrollSequenceController || null;

    if (cancelPendingPhase) {
      cancelPendingPhase();
      cancelPendingPhase = null;
    }

    if (cancelScrollAnimation) {
      cancelScrollAnimation();
      cancelScrollAnimation = null;
    }

    locked = true;
    storyController?.hide({ duration: storyFadeDuration });
    cancelPendingPhase = wait(storyFadeDuration, () => {
      cancelPendingPhase = null;
      runLockedTransition(targetY, afterTransition, transitionDuration);
    });
  };

  const transitionToTea = () => {
    const teaController = teaSection.__teaFeatureController || null;
    const storyController = storySection.__scrollSequenceController || null;

    if (locked || teaController?.animating) {
      return false;
    }

    storyController?.hide();
    runLockedTransition(getPageTop(teaSection), () => {
      setHeaderMode('tea');

      const started = teaController?.play(() => {
        locked = false;
        lockGestureCooldown();
      });

      return started ? false : true;
    }, storyToTeaDuration);

    return true;
  };

  const handleAdvance = (direction) => {
    const teaController = teaSection.__teaFeatureController || null;
    const storyController = storySection.__scrollSequenceController || null;

    if (isViewportCenteredOn(heroSection)) {
      if (direction > 0) {
        storyController?.hide();
        runLockedTransition(getPageTop(storySection), () => {
          setHeaderMode('default');
          storyController?.show({ duration: storyFadeDuration });
        });
        return true;
      }

      return false;
    }

    if (isViewportCenteredOn(storySection)) {
      if (direction < 0) {
        runStoryExitTransition({
          targetY: getPageTop(heroSection),
          afterTransition: () => {
            setHeaderMode('default');
          },
        });
        return true;
      }

      if (direction > 0) {
        runStoryExitTransition({
          targetY: getPageTop(teaSection),
          afterTransition: () => {
            setHeaderMode('tea');
            const started = teaController?.play(() => {
              locked = false;
              lockGestureCooldown();
            });

            return started ? false : true;
          },
          transitionDuration: storyToTeaDuration,
        });
        return true;
      }

      return false;
    }

    if (isViewportCenteredOn(teaSection) && direction < 0 && !teaController?.animating) {
      storyController?.hide();
      runLockedTransition(getPageTop(heroSection), () => {
        setHeaderMode('default');
      });
      return true;
    }

    if (
      isViewportCenteredOn(teaSection) &&
      direction > 0 &&
      teaController?.completed &&
      !teaController?.animating
    ) {
      runLockedTransition(getPageTop(footerSection), () => {
        setHeaderMode('default');
      });
      return true;
    }

    if (isViewportCenteredOn(footerSection) && direction < 0) {
      runLockedTransition(getPageTop(teaSection), () => {
        setHeaderMode('tea');
      });
      return true;
    }

    return false;
  };

  const onWheel = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    const direction = Math.sign(event.deltaY);
    const intent = Math.abs(event.deltaY);
    const now = performance.now();

    if (!direction || intent < wheelThreshold) {
      if (locked) {
        event.preventDefault();
      }

      return;
    }

    if (locked) {
      event.preventDefault();
      return;
    }

    if (now < gestureLockedUntil) {
      event.preventDefault();
      return;
    }

    if (handleAdvance(direction)) {
      event.preventDefault();
    }
  };

  const onTouchStart = (event) => {
    touchStartY = event.touches[0]?.clientY ?? null;
    touchLocked = locked;
  };

  const onTouchMove = (event) => {
    if (event.defaultPrevented || touchStartY === null) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? touchStartY;
    const deltaY = touchStartY - currentY;
    const direction = Math.sign(deltaY);
    const now = performance.now();

    if (locked || touchLocked) {
      event.preventDefault();
      return;
    }

    if (now < gestureLockedUntil) {
      event.preventDefault();
      return;
    }

    if (!direction || Math.abs(deltaY) < touchThreshold) {
      return;
    }

    if (handleAdvance(direction)) {
      touchLocked = true;
      touchStartY = currentY;
      event.preventDefault();
    }
  };

  const onTouchEnd = () => {
    touchStartY = null;
    touchLocked = false;
  };

  const onTeaLinkClick = (event) => {
    event.preventDefault();
    transitionToTea();
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  teaLinks.forEach((link) => {
    link.addEventListener('click', onTeaLinkClick);
  });

  return () => {
    if (cancelPendingPhase) {
      cancelPendingPhase();
    }

    if (cancelScrollAnimation) {
      cancelScrollAnimation();
    }

    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
    teaLinks.forEach((link) => {
      link.removeEventListener('click', onTeaLinkClick);
    });
  };
};
