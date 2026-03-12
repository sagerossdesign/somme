export const renderSplitCopy = ({
  id,
  eyebrow,
  title,
  body = [],
  sideEyebrow,
  sideTitle,
  sideItems = [],
  plainBackground = false,
  animatedBody = false,
} = {}) => {
  const section = document.createElement('section');
  section.className = 'page-section content-band';
  section.dataset.reveal = 'true';

  if (id) {
    section.id = id;
  }

  const shell = document.createElement('div');
  shell.className = 'section-shell split-copy-shell';

  if (plainBackground) {
    shell.classList.add('split-copy-shell-plain');
  } else {
    shell.classList.add('surface-panel');
  }

  const main = document.createElement('div');
  main.className = 'split-copy-main';

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'section-eyebrow';
    eyebrowElement.textContent = eyebrow;
    main.append(eyebrowElement);
  }

  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'section-title';
    titleElement.textContent = title;
    main.append(titleElement);
  }

  if (animatedBody) {
    const sequence = document.createElement('div');
    sequence.className = 'sequence-lines';
    sequence.dataset.sequenceLines = 'true';

    body.forEach((paragraph, index) => {
      const paragraphElement = document.createElement('p');
      paragraphElement.className = 'section-body sequence-line';
      paragraphElement.textContent = paragraph;

      if (index === 0) {
        paragraphElement.classList.add('is-active');
      }

      sequence.append(paragraphElement);
    });

    main.append(sequence);
  } else {
    body.forEach((paragraph) => {
      const paragraphElement = document.createElement('p');
      paragraphElement.className = 'section-body';
      paragraphElement.textContent = paragraph;
      main.append(paragraphElement);
    });
  }

  shell.append(main);

  if (sideEyebrow || sideTitle || sideItems.length) {
    const aside = document.createElement('aside');
    aside.className = 'split-copy-aside';

    if (sideEyebrow) {
      const sideEyebrowElement = document.createElement('p');
      sideEyebrowElement.className = 'section-eyebrow';
      sideEyebrowElement.textContent = sideEyebrow;
      aside.append(sideEyebrowElement);
    }

    if (sideTitle) {
      const sideTitleElement = document.createElement('p');
      sideTitleElement.className = 'aside-title';
      sideTitleElement.textContent = sideTitle;
      aside.append(sideTitleElement);
    }

    if (sideItems.length) {
      const list = document.createElement('ul');
      list.className = 'detail-list';

      sideItems.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        list.append(listItem);
      });

      aside.append(list);
    }

    shell.append(aside);
  }

  section.append(shell);
  return section;
};
