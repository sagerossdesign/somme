const buildAction = ({ label, href, variant = 'primary' }) => {
  const link = document.createElement('a');
  link.className = `button-link button-link-${variant}`;
  link.href = href;
  link.textContent = label;
  return link;
};

const buildDetailItem = ({ label, value }) => {
  const item = document.createElement('div');
  item.className = 'hero-detail';

  const labelElement = document.createElement('p');
  labelElement.className = 'section-eyebrow';
  labelElement.textContent = label;

  const valueElement = document.createElement('p');
  valueElement.className = 'hero-detail-value';
  valueElement.textContent = value;

  item.append(labelElement, valueElement);
  return item;
};

export const renderHeroEditorial = ({
  id,
  eyebrow,
  tagline,
  backgroundSrc,
  backgroundAlt = '',
  wordmark,
  brandmarkSrc,
  brandmarkAlt = '',
  title,
  body,
  actions = [],
  details = [],
  layout = 'split',
} = {}) => {
  const section = document.createElement('section');
  section.className = 'page-section hero-editorial';
  section.classList.add(`hero-editorial-${layout}`);

  if (id) {
    section.id = id;
  }

  const shell = document.createElement('div');
  shell.className = 'section-shell hero-editorial-shell';

  if (backgroundSrc) {
    const background = document.createElement('div');
    background.className = 'hero-editorial-background';

    const backgroundImage = document.createElement('img');
    backgroundImage.className = 'hero-editorial-background-image';
    backgroundImage.src = backgroundSrc;
    backgroundImage.alt = backgroundAlt;
    backgroundImage.loading = 'eager';

    background.append(backgroundImage);
    shell.append(background);
  }

  const intro = document.createElement('div');
  intro.className = 'hero-editorial-intro';

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'section-eyebrow hero-eyebrow';
    eyebrowElement.textContent = eyebrow;
    intro.append(eyebrowElement);
  }

  if (wordmark) {
    const wordmarkElement = document.createElement('p');
    wordmarkElement.className = 'hero-wordmark';
    wordmarkElement.textContent = wordmark;
    intro.append(wordmarkElement);
  } else if (brandmarkSrc) {
    const mark = document.createElement('img');
    mark.className = 'hero-brandmark';
    mark.src = brandmarkSrc;
    mark.alt = brandmarkAlt;
    mark.loading = 'eager';
    intro.append(mark);
  }

  if (tagline) {
    const taglineElement = document.createElement('p');
    taglineElement.className = 'section-eyebrow hero-eyebrow hero-tagline-lockup';
    taglineElement.textContent = tagline;
    intro.append(taglineElement);
  }

  if (title) {
    const titleElement = document.createElement('h1');
    titleElement.className = 'section-title hero-title';
    titleElement.textContent = title;
    intro.append(titleElement);
  }

  if (body) {
    const bodyElement = document.createElement('p');
    bodyElement.className = 'section-body hero-body';
    bodyElement.textContent = body;
    intro.append(bodyElement);
  }

  if (actions.length) {
    const actionGroup = document.createElement('div');
    actionGroup.className = 'button-row';
    actionGroup.append(...actions.map(buildAction));
    intro.append(actionGroup);
  }

  shell.append(intro);

  if (details.length) {
    const rail = document.createElement('div');
    rail.className = 'hero-detail-rail surface-panel';
    rail.append(...details.map(buildDetailItem));
    shell.append(rail);
  }

  section.append(shell);
  return section;
};
