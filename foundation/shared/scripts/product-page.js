import { applyTheme, setDocumentMeta } from './utils.js';
import {
  formatCurrency,
  getCartCount,
  getCartState,
  getCartSubtotal,
  getCartUiState,
  setCartState,
  setCartUiState,
  syncCartItemMetadata,
} from './cart-state.js';
import { startSquareCheckout } from './cart-checkout.js';

const PRODUCT_PAGE_TRANSITION_KEY = 'somme-product-transition';
const PRODUCT_PAGE_TRANSITION_MS = 280;

const buildNavLink = ({ href, label, ariaLabel, direction }) => {
  const link = document.createElement('a');
  link.className = `product-nav-link product-nav-link-${direction}`;
  link.href = href;
  link.setAttribute('aria-label', ariaLabel || label);
  link.textContent = label;
  return link;
};

const buildIngredientList = (ingredients = []) => {
  const list = document.createElement('ul');
  list.className = 'product-ingredient-list';

  ingredients.forEach((ingredient) => {
    const item = document.createElement('li');
    item.textContent = ingredient;
    list.append(item);
  });

  return list;
};

const syncCartUi = (cartLink, countNode, shell) => {
  const state = getCartState();
  const count = getCartCount(state);
  const hasItems = count > 0;

  countNode.textContent = String(count);
  cartLink.classList.toggle('is-visible', hasItems);
  cartLink.setAttribute('aria-hidden', hasItems ? 'false' : 'true');
  cartLink.tabIndex = hasItems ? 0 : -1;

  if (!hasItems) {
    shell?.classList.remove('is-cart-open');
    setCartUiState({ isOpen: false });
  }
};

const addCartItem = (config, refs) => {
  const state = getCartState();
  const variationId = refs.detailLink.dataset.squareVariationId || config.product.slug || config.product.name;
  const existing = state.items.find((item) => item.variationId === variationId);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.items.push({
      slug: config.square?.slug || config.product.slug || '',
      name: config.product.name,
      variationId,
      itemId: refs.detailLink.dataset.squareItemId || '',
      locationId: refs.detailLink.dataset.squareLocationId || '',
      quantity: 1,
      priceAmount: refs.detailLink.dataset.squarePriceAmount || '',
      currencyCode: refs.detailLink.dataset.squareCurrencyCode || '',
      priceFormatted: refs.detailLink.dataset.squarePriceFormatted || '',
      imageSrc: config.product.imageSrc,
    });
  }

  setCartState(state);
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

const renderCartDrawer = (refs) => {
  const state = getCartState();
  const { drawerItems, drawerSubtotalValue, drawerEmpty, drawerCheckout, shell } = refs;
  const count = getCartCount(state);

  drawerItems.replaceChildren();

  if (count === 0) {
    drawerEmpty.hidden = false;
    drawerSubtotalValue.textContent = '';
    drawerCheckout.disabled = true;
    shell.classList.remove('is-cart-open');
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

    const meta = document.createElement('p');
    meta.className = 'cart-drawer-item-meta';
    meta.textContent = '';

    const price = document.createElement('p');
    price.className = 'cart-drawer-item-price';
    const unitPrice =
      item.priceFormatted || formatCurrency(item.priceAmount, item.currencyCode) || '';
    const lineTotal = formatCurrency(
      Number(item.priceAmount || 0) * Number(item.quantity || 0),
      item.currencyCode
    );
    price.textContent = lineTotal || unitPrice;

    const controls = document.createElement('div');
    controls.className = 'cart-drawer-item-controls';

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

    controls.append(minus, quantity, plus);
    body.append(title, meta, price, controls);
    row.append(image, body);
    drawerItems.append(row);
  });

  const subtotalCurrency = state.items.find((item) => item.currencyCode)?.currencyCode;
  drawerSubtotalValue.textContent =
    formatCurrency(getCartSubtotal(state), subtotalCurrency) || '';
};

const applyEntryTransitionState = (page) => {
  if (window.sessionStorage.getItem(PRODUCT_PAGE_TRANSITION_KEY) !== '1') {
    document.documentElement.classList.remove('is-product-page-transitioning');
    return;
  }

  window.sessionStorage.removeItem(PRODUCT_PAGE_TRANSITION_KEY);
  page.classList.add('is-transition-enter');

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      page.classList.add('is-transition-enter-active');
    });
  });

  window.setTimeout(() => {
    page.classList.remove('is-transition-enter', 'is-transition-enter-active');
    document.documentElement.classList.remove('is-product-page-transitioning');
  }, PRODUCT_PAGE_TRANSITION_MS + 60);
};

const bindProductPageTransition = (link) => {
  link.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const href = link.getAttribute('href');

    if (!href) {
      return;
    }

    event.preventDefault();
    window.sessionStorage.setItem(PRODUCT_PAGE_TRANSITION_KEY, '1');
    document.documentElement.classList.add('is-product-page-transitioning');
    document.querySelector('.product-stage')?.classList.add('is-transition-exit');

    window.setTimeout(() => {
      window.location.href = href;
    }, PRODUCT_PAGE_TRANSITION_MS);
  });
};

const hydrateSquareData = async (config, refs) => {
  const endpoint = config.square?.endpoint;

  if (!endpoint) {
    return;
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    const squareProduct = payload.product;

    if (!squareProduct) {
      return;
    }

    refs.detailLink.dataset.squareSlug = squareProduct.slug || '';
    refs.detailLink.dataset.squareItemId = squareProduct.itemId || '';
    refs.detailLink.dataset.squareVariationId = squareProduct.variationId || '';
    refs.detailLink.dataset.squareLocationId = squareProduct.locationId || '';
    refs.detailLink.dataset.squarePriceAmount =
      typeof squareProduct.priceAmount === 'number' ? String(squareProduct.priceAmount) : '';
    refs.detailLink.dataset.squareCurrencyCode = squareProduct.currencyCode || '';
    refs.detailLink.dataset.squarePriceFormatted = squareProduct.priceFormatted || '';
    refs.price.textContent = squareProduct.priceFormatted || '';
    refs.price.hidden = !squareProduct.priceFormatted;

    if (squareProduct.itemName) {
      refs.detailLink.setAttribute('aria-label', `add ${squareProduct.itemName} to cart`);
    }

    refs.detailLink.dataset.squareReady = 'true';
    refs.detailLink.removeAttribute('aria-disabled');
    refs.detailLink.classList.remove('is-loading');

    syncCartItemMetadata({
      slug: config.square?.slug || config.product.slug,
      name: squareProduct.itemName || config.product.name,
      itemId: squareProduct.itemId,
      variationId: squareProduct.variationId,
      locationId: squareProduct.locationId,
      priceAmount: squareProduct.priceAmount,
      currencyCode: squareProduct.currencyCode,
      priceFormatted: squareProduct.priceFormatted,
      imageSrc: config.product.imageSrc,
    });
  } catch (error) {
    refs.detailLink.dataset.squareError = 'unavailable';
    refs.detailLink.classList.remove('is-loading');
  }
};

export const createProductPage = (config) => {
  const root = document.querySelector(config.rootSelector || '#app');

  if (!root) {
    throw new Error('Expected a product page root element for rendering.');
  }

  applyTheme(config.theme);
  setDocumentMeta(config.meta);

  const { product, navigation } = config;

  const shell = document.createElement('div');
  shell.className = 'product-page-shell';

  const page = document.createElement('main');
  page.className = 'product-page';

  const header = document.createElement('header');
  header.className = 'site-header';

  const brandLink = document.createElement('a');
  brandLink.className = 'site-home-link';
  brandLink.href = navigation.homeHref || '/';
  brandLink.textContent = navigation.homeLabel || 'sōmme';

  const headerNav = document.createElement('nav');
  headerNav.className = 'site-nav';
  headerNav.setAttribute('aria-label', navigation.navAriaLabel || 'Primary');

  (navigation.links || []).forEach(({ href, label }) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    headerNav.append(link);
  });

  const headerControls = document.createElement('div');
  headerControls.className = 'site-header-controls';

  const cartLink = document.createElement('a');
  cartLink.className = 'site-cart-link';
  cartLink.href = navigation.cartHref || '#';
  cartLink.setAttribute('aria-label', navigation.cartLabel || 'cart');

  const cartIcon = document.createElement('img');
  cartIcon.className = 'site-cart-icon';
  cartIcon.src = config.meta?.favicon || '/sites/somme/assets/images/favicon.png';
  cartIcon.alt = '';
  cartIcon.setAttribute('aria-hidden', 'true');

  const cartCount = document.createElement('span');
  cartCount.className = 'site-cart-count';
  cartCount.textContent = '0';

  cartLink.append(cartIcon, cartCount);
  headerControls.append(headerNav, cartLink);
  header.append(brandLink, headerControls);

  const stage = document.createElement('section');
  stage.className = 'product-stage';

  const prevLink = buildNavLink({
    href: navigation.previous.href,
    label: '‹',
    ariaLabel: `previous blend ${navigation.previous.label}`,
    direction: 'previous',
  });

  const nextLink = buildNavLink({
    href: navigation.next.href,
    label: '›',
    ariaLabel: `next blend ${navigation.next.label}`,
    direction: 'next',
  });

  const content = document.createElement('div');
  content.className = 'product-stage-content';

  const category = document.createElement('p');
  category.className = 'product-kicker';
  category.textContent = product.category;

  const imageFrame = document.createElement('div');
  imageFrame.className = 'product-image-frame';

  const image = document.createElement('img');
  image.className = 'product-image';
  image.src = product.imageSrc;
  image.alt = product.imageAlt;
  image.loading = 'eager';
  imageFrame.append(image);

  const description = document.createElement('p');
  description.className = 'product-description';
  description.textContent = product.description;

  const price = document.createElement('p');
  price.className = 'product-price';
  price.hidden = true;

  const ingredientsLabel = document.createElement('p');
  ingredientsLabel.className = 'product-ingredients-label';
  ingredientsLabel.textContent = product.ingredientsLabel || 'botanicals';

  const ingredients = buildIngredientList(product.ingredients);

  const detailLink = document.createElement('a');
  detailLink.className = 'product-detail-link';
  detailLink.href = navigation.backHref || '../index.html#tea';
  detailLink.textContent = navigation.backLabel || 'back to teas';
  detailLink.classList.add('is-loading');
  detailLink.setAttribute('aria-disabled', 'true');

  content.append(
    category,
    imageFrame,
    description,
    price,
    ingredientsLabel,
    ingredients,
    detailLink
  );

  stage.append(prevLink, content, nextLink);
  page.append(header, stage);
  
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

  drawerFooter.append(drawerSubtotalLabel, drawerSubtotalValue);
  drawerFooter.append(drawerCheckout);
  drawer.append(drawerHeader, drawerBody, drawerFooter);

  shell.append(page, drawer);
  root.replaceChildren(shell);
  applyEntryTransitionState(stage);

  const handleCartSync = () => {
    syncCartUi(cartLink, cartCount, shell);
    renderCartDrawer({
      shell,
      drawerItems,
      drawerSubtotalValue,
      drawerEmpty,
      drawerCheckout,
    });
  };
  window.addEventListener('storage', handleCartSync);
  window.addEventListener('somme:cart-updated', handleCartSync);
  window.addEventListener('somme:cart-ui-updated', () => {
    shell.classList.toggle('is-cart-open', getCartUiState().isOpen && getCartCount() > 0);
  });

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

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      shell.classList.remove('is-cart-open');
      setCartUiState({ isOpen: false });
    }
  });

  detailLink.addEventListener('click', (event) => {
    event.preventDefault();

    if (detailLink.dataset.squareReady !== 'true') {
      return;
    }

    addCartItem(config, {
      detailLink,
    });
  });

  drawerCheckout.addEventListener('click', () => {
    startSquareCheckout(drawerCheckout);
  });

  handleCartSync();
  shell.classList.toggle('is-cart-open', getCartUiState().isOpen && getCartCount() > 0);
  bindProductPageTransition(prevLink);
  bindProductPageTransition(nextLink);

  hydrateSquareData(config, {
    detailLink,
    price,
  });
};
