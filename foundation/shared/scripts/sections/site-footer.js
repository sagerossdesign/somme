import { buildLinkList } from '../utils.js';

export const renderSiteFooter = ({
  id,
  links = [],
  markSrc,
  markAlt = '',
  markLoading = 'lazy',
} = {}) => {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  if (id) {
    footer.id = id;
  }

  const copy = document.createElement('div');
  copy.className = 'footer-copy';
  copy.append(...buildLinkList(links));

  footer.append(copy);

  if (markSrc) {
    const mark = document.createElement('img');
    mark.className = 'footer-favicon';
    mark.src = markSrc;
    mark.alt = markAlt;
    mark.loading = markLoading;
    footer.append(mark);
  }

  return footer;
};
