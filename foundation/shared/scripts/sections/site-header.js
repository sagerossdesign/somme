import { buildLinkList } from '../utils.js';

export const renderSiteHeader = ({
  navAriaLabel = 'Primary',
  links = [],
  brandHref,
  brandLabel,
  brandMarkSrc,
  brandMarkAlt = '',
  cta,
} = {}) => {
  const header = document.createElement('header');
  header.className = 'site-header';
  const hasBrand = Boolean(brandHref || brandLabel || brandMarkSrc);
  const hasCta = Boolean(cta);

  if (hasBrand) {
    const brand = document.createElement('a');
    brand.className = 'site-brand';
    brand.href = brandHref || '#';

    if (brandMarkSrc) {
      const mark = document.createElement('img');
      mark.className = 'site-brand-mark';
      mark.src = brandMarkSrc;
      mark.alt = brandMarkAlt;
      mark.loading = 'eager';
      brand.append(mark);
    }

    if (brandLabel) {
      const label = document.createElement('span');
      label.className = 'site-brand-label';
      label.textContent = brandLabel;
      brand.append(label);
    }

    header.append(brand);
  }

  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', navAriaLabel);
  nav.append(...buildLinkList(links));

  header.append(nav);

  if (hasCta) {
    const action = document.createElement('a');
    action.className = 'button-link button-link-secondary site-header-cta';
    action.href = cta.href;
    action.textContent = cta.label;
    header.append(action);
  }

  if (!hasBrand && !hasCta) {
    header.classList.add('site-header-nav-only');
  }

  return header;
};
