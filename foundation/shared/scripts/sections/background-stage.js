export const renderBackgroundStage = ({ imageSrc, imageAlt = '', eager = true } = {}) => {
  const stage = document.createElement('div');
  stage.className = 'background-stage';
  stage.setAttribute('aria-hidden', 'true');

  const image = document.createElement('img');
  image.className = 'background-image';
  image.src = imageSrc;
  image.alt = imageAlt;
  image.loading = eager ? 'eager' : 'lazy';

  const overlay = document.createElement('div');
  overlay.className = 'background-overlay';

  const fade = document.createElement('div');
  fade.className = 'background-fade';

  stage.append(image, overlay, fade);
  return stage;
};
