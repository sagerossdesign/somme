const buildStep = ({ eyebrow, title, body }, index) => {
  const article = document.createElement('article');
  article.className = 'timeline-step surface-panel';

  const indexElement = document.createElement('p');
  indexElement.className = 'timeline-index';
  indexElement.textContent = String(index + 1).padStart(2, '0');
  article.append(indexElement);

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'section-eyebrow';
    eyebrowElement.textContent = eyebrow;
    article.append(eyebrowElement);
  }

  if (title) {
    const titleElement = document.createElement('h3');
    titleElement.className = 'card-title';
    titleElement.textContent = title;
    article.append(titleElement);
  }

  if (body) {
    const bodyElement = document.createElement('p');
    bodyElement.className = 'card-body';
    bodyElement.textContent = body;
    article.append(bodyElement);
  }

  return article;
};

export const renderTimeline = ({
  id,
  eyebrow,
  title,
  intro,
  steps = [],
} = {}) => {
  const section = document.createElement('section');
  section.className = 'page-section content-band';
  section.dataset.reveal = 'true';

  if (id) {
    section.id = id;
  }

  const shell = document.createElement('div');
  shell.className = 'section-shell';

  const introBlock = document.createElement('div');
  introBlock.className = 'section-intro';

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'section-eyebrow';
    eyebrowElement.textContent = eyebrow;
    introBlock.append(eyebrowElement);
  }

  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'section-title';
    titleElement.textContent = title;
    introBlock.append(titleElement);
  }

  if (intro) {
    const introElement = document.createElement('p');
    introElement.className = 'section-body';
    introElement.textContent = intro;
    introBlock.append(introElement);
  }

  shell.append(introBlock);

  const list = document.createElement('div');
  list.className = 'timeline-grid';
  list.append(...steps.map(buildStep));
  shell.append(list);

  section.append(shell);
  return section;
};
