import { applyTheme, setDocumentMeta } from './utils.js';

const CART_STORAGE_KEY = 'somme-cart';
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

const getCartState = () => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return { items: [] };
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return parsed;
  } catch (error) {
    return { items: [] };
  }
};

const setCartState = (state) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('somme:cart-updated', { detail: state }));
};

const getCartCount = (state = getCartState()) =>
  state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

const syncCartUi = (cartLink, countNode) => {
  const count = getCartCount();
  const hasItems = count > 0;

  countNode.textContent = String(count);
  cartLink.classList.toggle('is-visible', hasItems);
  cartLink.setAttribute('aria-hidden', hasItems ? 'false' : 'true');
  cartLink.tabIndex = hasItems ? 0 : -1;
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
    document.querySelector('.product-page')?.classList.add('is-transition-exit');

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

    if (squareProduct.itemName) {
      refs.detailLink.setAttribute('aria-label', `add ${squareProduct.itemName} to cart`);
    }
  } catch (error) {
    refs.detailLink.dataset.squareError = 'unavailable';
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

  const ingredientsLabel = document.createElement('p');
  ingredientsLabel.className = 'product-ingredients-label';
  ingredientsLabel.textContent = product.ingredientsLabel || 'botanicals';

  const ingredients = buildIngredientList(product.ingredients);

  const detailLink = document.createElement('a');
  detailLink.className = 'product-detail-link';
  detailLink.href = navigation.backHref || '../index.html#tea';
  detailLink.textContent = navigation.backLabel || 'back to teas';

  content.append(
    category,
    imageFrame,
    description,
    ingredientsLabel,
    ingredients,
    detailLink
  );

  stage.append(prevLink, content, nextLink);
  page.append(header, stage);

  root.replaceChildren(page);
  applyEntryTransitionState(page);

  const handleCartSync = () => syncCartUi(cartLink, cartCount);
  window.addEventListener('storage', handleCartSync);
  window.addEventListener('somme:cart-updated', handleCartSync);

  detailLink.addEventListener('click', (event) => {
    event.preventDefault();
    addCartItem(config, {
      detailLink,
    });
  });

  handleCartSync();
  bindProductPageTransition(prevLink);
  bindProductPageTransition(nextLink);

  hydrateSquareData(config, {
    detailLink,
  });
};
