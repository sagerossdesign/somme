import { applyTheme, setDocumentMeta } from './utils.js';

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
  header.className = 'site-header site-header-nav-only';

  const headerNav = document.createElement('nav');
  headerNav.className = 'site-nav';
  headerNav.setAttribute('aria-label', navigation.navAriaLabel || 'Primary');

  (navigation.links || []).forEach(({ href, label }) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    headerNav.append(link);
  });

  header.append(headerNav);

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
};
