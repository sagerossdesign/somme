import { clamp } from '../utils.js';

const getLineProgress = (progress, index, count) => {
  const introShare = 0.04;
  const slot = (1 - introShare) / Math.max(count, 1);
  const start = introShare + slot * index;
  return (progress - start) / slot;
};

const getLineOpacity = (progress, index, count) => {
  const localProgress = getLineProgress(progress, index, count);

  if (localProgress <= 0 || localProgress >= 1) {
    return 0;
  }

  if (localProgress < 0.4) {
    return localProgress / 0.4;
  }

  if (localProgress <= 0.6) {
    return 1;
  }

  return (1 - localProgress) / 0.4;
};

const getSectionProgress = (section) => {
  const rect = section.getBoundingClientRect();
  const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
  const travelled = clamp(-rect.top, 0, scrollable);
  return travelled / scrollable;
};

const applyLineState = (lines, progress) => {
  lines.forEach((line, index) => {
    if (line.dataset.manualLock === 'true') {
      return;
    }

    const opacity = getLineOpacity(progress, index, lines.length);
    line.style.opacity = opacity.toFixed(3);
    line.style.transform = 'translate(-50%, -50%)';
  });
};

const updateSequence = (section, heroElement, heroSection, heroFadeDistance) => {
  const lines = [...section.querySelectorAll('.scroll-sequence-line')];
  const backgroundFade = document.querySelector('.background-fade');

  if (!lines.length) {
    return;
  }

  const progress = getSectionProgress(section);

  if (heroElement && heroSection) {
    const heroRect = heroSection.getBoundingClientRect();
    const heroTravelled = clamp(-heroRect.top, 0, heroFadeDistance);
    const heroOpacity = 1 - heroTravelled / Math.max(heroFadeDistance, 1);
    heroElement.style.opacity = heroOpacity.toFixed(3);

    if (backgroundFade) {
      const fadeOpacity = clamp(1 - heroOpacity, 0, 1);
      backgroundFade.style.opacity = fadeOpacity.toFixed(3);
    }
  } else if (backgroundFade) {
    backgroundFade.style.opacity = '0';
  }

  applyLineState(lines, progress);
};

export const initScrollSequence = ({
  selector = '[data-scroll-sequence]',
  heroSelector = '.hero-editorial-centered .hero-editorial-shell',
  heroSectionSelector = '.hero-editorial-centered',
  heroFadeDistanceRatio = 0.72,
} = {}) => {
  const sections = [...document.querySelectorAll(selector)];
  const heroElement = document.querySelector(heroSelector);
  const heroSection = document.querySelector(heroSectionSelector);

  if (!sections.length) {
    return () => {};
  }

  sections.forEach((section) => {
    const lines = [...section.querySelectorAll('.scroll-sequence-line')];

    section.__scrollSequenceController = {
      hide({ duration = 0 } = {}) {
        lines.forEach((line) => {
          line.dataset.manualLock = 'true';
          line.style.transition = duration ? `opacity ${duration}ms ease` : 'none';
        });

        requestAnimationFrame(() => {
          lines.forEach((line) => {
            line.style.opacity = '0';
          });
        });
      },
      show({ duration = 800 } = {}) {
        lines.forEach((line) => {
          line.dataset.manualLock = 'true';
          line.style.transition = `opacity ${duration}ms ease`;
          line.style.opacity = '0';
        });

        requestAnimationFrame(() => {
          lines.forEach((line) => {
            line.style.opacity = '1';
          });
        });
      },
      release() {
        lines.forEach((line) => {
          delete line.dataset.manualLock;
          line.style.transition = '';
        });
        update();
      },
    };
  });

  const update = () => {
    const heroFadeDistance = window.innerHeight * heroFadeDistanceRatio;
    sections.forEach((section) =>
      updateSequence(section, heroElement, heroSection, heroFadeDistance)
    );
  };

  const handleScroll = () => {
    update();
  };

  update();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', update);

  return () => {
    sections.forEach((section) => {
      delete section.__scrollSequenceController;
    });
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', update);
  };
};
