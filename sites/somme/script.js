import { createImmersiveBrandSite } from '../../foundation/shared/scripts/app.js';
import { siteConfig } from './site.config.js';

createImmersiveBrandSite(siteConfig);

const roomJourney = document.querySelector('.hero-editorial-centered');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (roomJourney) {
  document.body.classList.add('home-room-journey');

  let animationFrame = null;

  const updateRoomJourney = () => {
    animationFrame = null;

    if (reduceMotion.matches) {
      document.body.style.setProperty('--room-progress', '0');
      return;
    }

    const scrollDistance = Math.max(
      1,
      roomJourney.offsetHeight - window.innerHeight
    );
    const progress = Math.min(
      1,
      Math.max(0, -roomJourney.getBoundingClientRect().top / scrollDistance)
    );
    const easedProgress = progress * progress * (3 - 2 * progress);

    document.body.style.setProperty('--room-progress', easedProgress.toFixed(4));
  };

  const requestRoomJourneyUpdate = () => {
    if (animationFrame === null) {
      animationFrame = window.requestAnimationFrame(updateRoomJourney);
    }
  };

  window.addEventListener('scroll', requestRoomJourneyUpdate, { passive: true });
  window.addEventListener('resize', requestRoomJourneyUpdate);
  reduceMotion.addEventListener('change', requestRoomJourneyUpdate);
  updateRoomJourney();
}
