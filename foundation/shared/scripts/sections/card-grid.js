const buildCard = ({ eyebrow, title, body }) => {
  const article = document.createElement('article');
  article.className = 'info-card surface-panel';

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

export const renderCardGrid = ({
  id,
  eyebrow,
  title,
  intro,
  cards = [],
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

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  grid.append(...cards.map(buildCard));
  shell.append(grid);

  section.append(shell);
  return section;
};
