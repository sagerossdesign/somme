import { initHeroFadeStage } from './animations/scroll-stage.js';
import { initRevealSections } from './animations/reveal-sections.js';
import { initSectionAdvance } from './animations/section-advance.js';
import { initScrollSequence } from './animations/scroll-sequence.js';
import { initTeaFeature } from './animations/tea-feature.js';
import {
  formatCurrency,
  getCartCount,
  getCartState,
  getCartSubtotal,
  getCartUiState,
  setCartState,
  setCartUiState,
} from './cart-state.js';
import { startSquareCheckout } from './cart-checkout.js';
import { renderCardGrid } from './sections/card-grid.js';
import { renderCtaBand } from './sections/cta-band.js';
import { renderBackgroundStage } from './sections/background-stage.js';
import { renderHeroStage } from './sections/hero-stage.js';
import { renderHeroEditorial } from './sections/hero-editorial.js';
import { renderScrollSequence } from './sections/scroll-sequence.js';
import { renderScrollTrack } from './sections/scroll-track.js';
import { renderSiteFooter } from './sections/site-footer.js';
import { renderSiteHeader } from './sections/site-header.js';
import { renderSplitCopy } from './sections/split-copy.js';
import { renderTeaFeature } from './sections/tea-feature.js';
import { renderTimeline } from './sections/timeline.js';
import { applyTheme, setDocumentMeta } from './utils.js';

const sectionRenderers = {
  heroEditorial: renderHeroEditorial,
  scrollSequence: renderScrollSequence,
  teaFeature: renderTeaFeature,
  splitCopy: renderSplitCopy,
  cardGrid: renderCardGrid,
  timeline: renderTimeline,
  ctaBand: renderCtaBand,
};

const renderConfiguredSections = (sections = []) => {
  const main = document.createElement('main');

  sections.forEach((section) => {
    const renderSection = sectionRenderers[section.type];

    if (!renderSection) {
      return;
    }

    main.append(renderSection(section));
  });

  return main;
};

const updateCartItemQuantity = (variationId, delta) => {
  const state = getCartState();
  const item = state.items.find((entry) => entry.variationId === variationId);

  if (!item) {
    return;
  }

  item.quantity = Math.max(0, (item.quantity || 0) + delta);
  state.items = state.items.filter((entry) => entry.quantity > 0);
  setCartState(state);
};

const mountCartShell = (root, header, pageFrame, meta = {}) => {
  if (!header) {
    return;
  }

  const nav = header.querySelector('.site-nav');

  if (!nav) {
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'site-header-controls';
  nav.replaceWith(controls);
  controls.append(nav);

  const cartLink = document.createElement('a');
  cartLink.className = 'site-cart-link';
  cartLink.href = '#';
  cartLink.setAttribute('aria-label', 'cart');

  const cartIcon = document.createElement('img');
  cartIcon.className = 'site-cart-icon';
  cartIcon.src = meta.favicon || '/sites/somme/assets/images/favicon.png';
  cartIcon.alt = '';
  cartIcon.setAttribute('aria-hidden', 'true');

  const cartCount = document.createElement('span');
  cartCount.className = 'site-cart-count';
  cartCount.textContent = '0';
  cartLink.append(cartIcon, cartCount);
  controls.append(cartLink);

  const shell = document.createElement('div');
  shell.className = 'site-shell';

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-label', 'cart');

  const drawerHeader = document.createElement('div');
  drawerHeader.className = 'cart-drawer-header';

  const drawerTitle = document.createElement('p');
  drawerTitle.className = 'cart-drawer-title';
  drawerTitle.textContent = 'cart';

  const drawerClose = document.createElement('button');
  drawerClose.type = 'button';
  drawerClose.className = 'cart-drawer-close';
  drawerClose.textContent = 'close';
  drawerHeader.append(drawerTitle, drawerClose);

  const drawerBody = document.createElement('div');
  drawerBody.className = 'cart-drawer-body';

  const drawerEmpty = document.createElement('p');
  drawerEmpty.className = 'cart-drawer-empty';
  drawerEmpty.textContent = 'your cart is empty';

  const drawerItems = document.createElement('div');
  drawerItems.className = 'cart-drawer-items';
  drawerBody.append(drawerEmpty, drawerItems);

  const drawerFooter = document.createElement('div');
  drawerFooter.className = 'cart-drawer-footer';

  const drawerSubtotalLabel = document.createElement('span');
  drawerSubtotalLabel.className = 'cart-drawer-subtotal-label';
  drawerSubtotalLabel.textContent = 'subtotal';

  const drawerSubtotalValue = document.createElement('span');
  drawerSubtotalValue.className = 'cart-drawer-subtotal-value';

  const drawerCheckout = document.createElement('button');
  drawerCheckout.type = 'button';
  drawerCheckout.className = 'cart-drawer-checkout';
  drawerCheckout.textContent = 'checkout';
  drawerCheckout.disabled = true;

  drawerFooter.append(drawerSubtotalLabel, drawerSubtotalValue, drawerCheckout);

  drawer.append(drawerHeader, drawerBody, drawerFooter);
  shell.append(pageFrame, drawer);
  root.append(shell);

  const renderCartDrawer = () => {
    const state = getCartState();
    const count = getCartCount(state);
    const hasItems = count > 0;

    cartCount.textContent = String(count);
    cartLink.classList.toggle('is-visible', hasItems);
    cartLink.setAttribute('aria-hidden', hasItems ? 'false' : 'true');
    cartLink.tabIndex = hasItems ? 0 : -1;
    drawerItems.replaceChildren();

    if (!hasItems) {
      drawerEmpty.hidden = false;
      drawerSubtotalValue.textContent = '';
      drawerCheckout.disabled = true;
      shell.classList.remove('is-cart-open');
      setCartUiState({ isOpen: false });
      return;
    }

    drawerEmpty.hidden = true;
    drawerCheckout.disabled = false;

    state.items.forEach((item) => {
      const row = document.createElement('article');
      row.className = 'cart-drawer-item';

      const image = document.createElement('img');
      image.className = 'cart-drawer-item-image';
      image.src = item.imageSrc;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');

      const body = document.createElement('div');
      body.className = 'cart-drawer-item-body';

      const title = document.createElement('p');
      title.className = 'cart-drawer-item-title';
      title.textContent = item.name;

      const metaLine = document.createElement('p');
      metaLine.className = 'cart-drawer-item-meta';
      metaLine.textContent = `qty ${item.quantity}`;

      const priceLine = document.createElement('p');
      priceLine.className = 'cart-drawer-item-price';
      const unitPrice =
        item.priceFormatted || formatCurrency(item.priceAmount, item.currencyCode) || '';
      const lineTotal = formatCurrency(
        Number(item.priceAmount || 0) * Number(item.quantity || 0),
        item.currencyCode
      );
      priceLine.textContent = lineTotal || unitPrice;

      const itemControls = document.createElement('div');
      itemControls.className = 'cart-drawer-item-controls';

      const minus = document.createElement('button');
      minus.type = 'button';
      minus.className = 'cart-drawer-quantity-button';
      minus.textContent = '−';
      minus.addEventListener('click', () => updateCartItemQuantity(item.variationId, -1));

      const quantity = document.createElement('span');
      quantity.className = 'cart-drawer-quantity';
      quantity.textContent = String(item.quantity);

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.className = 'cart-drawer-quantity-button';
      plus.textContent = '+';
      plus.addEventListener('click', () => updateCartItemQuantity(item.variationId, 1));

      itemControls.append(minus, quantity, plus);
      body.append(title, metaLine, priceLine, itemControls);
      row.append(image, body);
      drawerItems.append(row);
    });

    const subtotalCurrency = state.items.find((item) => item.currencyCode)?.currencyCode;
    drawerSubtotalValue.textContent =
      formatCurrency(getCartSubtotal(state), subtotalCurrency) || '';
  };

  const syncOpenState = () => {
    shell.classList.toggle('is-cart-open', getCartUiState().isOpen && getCartCount() > 0);
  };

  cartLink.addEventListener('click', (event) => {
    event.preventDefault();

    if (!getCartCount()) {
      return;
    }

    const nextIsOpen = !shell.classList.contains('is-cart-open');
    shell.classList.toggle('is-cart-open', nextIsOpen);
    setCartUiState({ isOpen: nextIsOpen });
  });

  drawerClose.addEventListener('click', () => {
    shell.classList.remove('is-cart-open');
    setCartUiState({ isOpen: false });
  });

  drawerCheckout.addEventListener('click', () => {
    startSquareCheckout(drawerCheckout);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      shell.classList.remove('is-cart-open');
      setCartUiState({ isOpen: false });
    }
  });

  window.addEventListener('storage', renderCartDrawer);
  window.addEventListener('somme:cart-updated', renderCartDrawer);
  window.addEventListener('somme:cart-ui-updated', syncOpenState);

  renderCartDrawer();
  syncOpenState();
};

export const createImmersiveBrandSite = (config) => {
  const root = document.querySelector(config.rootSelector || '#app');

  if (!root) {
    throw new Error('Expected a site root element for rendering.');
  }

  applyTheme(config.theme);
  setDocumentMeta(config.meta);

  const fragment = document.createDocumentFragment();
  const { background, header, hero, tracks = [], main = [], footer } = config.sections;
  const pageFrame = document.createElement('div');
  pageFrame.className = 'site-frame';

  if (background?.imageSrc) {
    fragment.append(renderBackgroundStage(background));
  }

  const renderedHeader = renderSiteHeader(header);
  pageFrame.append(renderedHeader);

  if (main.length) {
    pageFrame.append(renderConfiguredSections(main));
  } else {
    if (hero) {
      pageFrame.append(renderHeroStage(hero));
    }

    const legacyMain = document.createElement('main');
    tracks.forEach((track) => {
      legacyMain.append(renderScrollTrack(track));
    });
    pageFrame.append(legacyMain);
  }

  pageFrame.append(renderSiteFooter(footer));
  fragment.append(pageFrame);

  root.replaceChildren(fragment);
  mountCartShell(root, renderedHeader, pageFrame, config.meta);

  if (hero && config.animations?.heroFade !== false) {
    initHeroFadeStage(config.animations?.heroFade);
  }

  if (config.animations?.revealSections !== false) {
    initRevealSections(config.animations?.revealSections);
  }

  if (config.animations?.scrollSequence !== false) {
    initScrollSequence(config.animations?.scrollSequence);
  }

  if (config.animations?.teaFeature !== false) {
    initTeaFeature(config.animations?.teaFeature);
  }

  if (config.animations?.sectionAdvance !== false) {
    initSectionAdvance(config.animations?.sectionAdvance);
  }
};
