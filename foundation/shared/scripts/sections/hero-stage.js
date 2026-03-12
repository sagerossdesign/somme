export const renderHeroStage = ({ logoSrc, logoAlt, tagline } = {}) => {
  const viewportStage = document.createElement('div');
  viewportStage.className = 'viewport-stage';
  viewportStage.setAttribute('aria-hidden', 'true');

  const stageLayer = document.createElement('section');
  stageLayer.className = 'stage-layer hero-layer';

  const content = document.createElement('div');
  content.className = 'hero-content';

  if (logoSrc) {
    const logo = document.createElement('img');
    logo.className = 'hero-logo';
    logo.src = logoSrc;
    logo.alt = logoAlt || '';
    logo.loading = 'eager';
    content.append(logo);
  }

  if (tagline) {
    const taglineElement = document.createElement('p');
    taglineElement.className = 'hero-tagline';
    taglineElement.textContent = tagline;
    content.append(taglineElement);
  }

  stageLayer.append(content);
  viewportStage.append(stageLayer);
  return viewportStage;
};
