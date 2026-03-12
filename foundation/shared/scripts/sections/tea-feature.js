const buildOverlay = ({ title, lines = [], ingredients = [] }) => {
  const overlay = document.createElement('div');
  overlay.className = 'tea-card-overlay';

  if (title) {
    const heading = document.createElement('p');
    heading.className = 'tea-card-overlay-title';
    heading.textContent = title;
    overlay.append(heading);
  }

  if (lines.length) {
    const copyGroup = document.createElement('div');
    copyGroup.className = 'tea-card-overlay-copy';

    lines.forEach((line) => {
      if (!line) {
        return;
      }

      const paragraph = document.createElement('p');
      paragraph.className = 'tea-card-overlay-line';
      paragraph.textContent = line;
      copyGroup.append(paragraph);
    });

    overlay.append(copyGroup);
  }

  if (ingredients.length) {
    const ingredientGroup = document.createElement('div');
    ingredientGroup.className = 'tea-card-overlay-ingredients';

    ingredients.forEach((ingredient) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'tea-card-overlay-line tea-card-overlay-ingredient';
      paragraph.textContent = ingredient;
      ingredientGroup.append(paragraph);
    });

    overlay.append(ingredientGroup);
  }

  return overlay;
};

const buildCard = ({ imageSrc, imageAlt, botanical, overlay, href }) => {
  const card = document.createElement(href ? 'a' : 'figure');
  card.className = 'tea-card';

  if (href) {
    card.classList.add('tea-card-link');
    card.href = href;
    card.setAttribute('aria-label', overlay?.title || botanical || 'tea blend');
  }

  const frame = document.createElement('div');
  frame.className = 'tea-card-frame';

  const image = document.createElement('img');
  image.className = 'tea-card-image';
  image.src = imageSrc;
  image.alt = imageAlt || botanical || '';
  image.loading = 'lazy';
  frame.append(image);
  card.append(frame);

  if (overlay?.title || overlay?.lines?.length) {
    card.append(buildOverlay(overlay));
  } else if (botanical) {
    card.append(
      buildOverlay({
        title: botanical,
        lines: [],
      })
    );
  }

  return card;
};

export const renderTeaFeature = ({
  id,
  eyebrow,
  cards = [],
} = {}) => {
  const section = document.createElement('section');
  section.className = 'page-section tea-feature-section';
  section.dataset.teaFeature = 'true';
  section.style.setProperty('--tea-step-count', String(Math.max(cards.length, 1)));

  if (id) {
    section.id = id;
  }

  const sticky = document.createElement('div');
  sticky.className = 'tea-feature-sticky';

  const shell = document.createElement('div');
  shell.className = 'section-shell tea-feature-shell';

  if (eyebrow) {
    const intro = document.createElement('div');
    intro.className = 'tea-feature-intro';

    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'section-eyebrow';
    eyebrowElement.textContent = eyebrow;
    intro.append(eyebrowElement);

    shell.append(intro);
  }

  const grid = document.createElement('div');
  grid.className = 'tea-card-grid';
  const cardElements = cards.map(buildCard);
  cardElements.forEach((cardElement, index) => {
    cardElement.dataset.cardIndex = String(index);

    const activate = () => {
      if (section.dataset.teaInteractive !== 'true') {
        return;
      }

      grid.dataset.activeCard = String(index);
    };

    cardElement.addEventListener('pointerenter', activate);
    cardElement.addEventListener('focusin', activate);
  });

  const clearActiveCard = () => {
    delete grid.dataset.activeCard;
  };

  grid.addEventListener('pointerleave', clearActiveCard);
  window.addEventListener('blur', clearActiveCard);

  grid.append(...cardElements);
  shell.append(grid);
  sticky.append(shell);
  section.append(sticky);
  return section;
};
