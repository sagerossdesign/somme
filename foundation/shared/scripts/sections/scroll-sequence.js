export const renderScrollSequence = ({
  id,
  lines = [],
} = {}) => {
  const section = document.createElement('section');
  section.className = 'page-section scroll-sequence-section';

  if (id) {
    section.id = id;
  }

  section.dataset.scrollSequence = 'true';
  section.style.setProperty('--sequence-line-count', String(Math.max(lines.length, 1)));
  section.style.setProperty('--sequence-step-height', '135svh');

  const sticky = document.createElement('div');
  sticky.className = 'scroll-sequence-sticky';

  const shell = document.createElement('div');
  shell.className = 'section-shell scroll-sequence-shell';

  lines.forEach((line, index) => {
    const paragraph = document.createElement('p');
    paragraph.className = 'scroll-sequence-line';
    paragraph.textContent = line;
    paragraph.dataset.sequenceIndex = String(index);

    if (index === 0) {
      paragraph.classList.add('is-active');
    }

    shell.append(paragraph);
  });

  sticky.append(shell);
  section.append(sticky);
  return section;
};
