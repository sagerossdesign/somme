const buildAction = ({ label, href, variant = 'primary' }) => {
  const link = document.createElement('a');
  link.className = `button-link button-link-${variant}`;
  link.href = href;
  link.textContent = label;
  return link;
};

export const renderCtaBand = ({
  id,
  eyebrow,
  title,
  body,
  actions = [],
} = {}) => {
  const section = document.createElement('section');
  section.className = 'page-section content-band';
  section.dataset.reveal = 'true';

  if (id) {
    section.id = id;
  }

  const shell = document.createElement('div');
  shell.className = 'section-shell cta-band-shell surface-panel';

  const copy = document.createElement('div');
  copy.className = 'cta-copy';

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'section-eyebrow';
    eyebrowElement.textContent = eyebrow;
    copy.append(eyebrowElement);
  }

  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'section-title';
    titleElement.textContent = title;
    copy.append(titleElement);
  }

  if (body) {
    const bodyElement = document.createElement('p');
    bodyElement.className = 'section-body';
    bodyElement.textContent = body;
    copy.append(bodyElement);
  }

  shell.append(copy);

  if (actions.length) {
    const actionGroup = document.createElement('div');
    actionGroup.className = 'button-row';
    actionGroup.append(...actions.map(buildAction));
    shell.append(actionGroup);
  }

  section.append(shell);
  return section;
};
