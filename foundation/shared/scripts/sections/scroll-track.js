export const renderScrollTrack = ({ id, ariaLabel, classes = [] } = {}) => {
  const track = document.createElement('section');
  track.className = ['scroll-track', ...classes].join(' ').trim();

  if (id) {
    track.id = id;
  }

  if (ariaLabel) {
    track.setAttribute('aria-label', ariaLabel);
  }

  return track;
};
