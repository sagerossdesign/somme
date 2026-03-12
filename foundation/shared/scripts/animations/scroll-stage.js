import { clamp } from '../utils.js';

const getTrackProgress = (track) => {
  if (!track) {
    return 0;
  }

  const start = track.offsetTop;
  const distance = Math.max(track.offsetHeight - window.innerHeight, 1);
  return clamp((window.scrollY - start) / distance, 0, 1);
};

export const initHeroFadeStage = ({
  trackSelector = '.hero-track',
  layerSelector = '.hero-layer',
  contentSelector = '.hero-content',
} = {}) => {
  const track = document.querySelector(trackSelector);
  const layer = document.querySelector(layerSelector);
  const content = document.querySelector(contentSelector);

  if (!track || !layer || !content) {
    return () => {};
  }

  const update = () => {
    const progress = getTrackProgress(track);
    const active =
      window.scrollY <= track.offsetTop + track.offsetHeight - window.innerHeight;
    const opacity = 1 - progress;

    layer.style.opacity = active ? '1' : '0';
    content.style.opacity = String(clamp(opacity, 0, 1));
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
};
