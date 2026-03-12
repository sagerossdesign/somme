export const productOrder = ['sensual', 'sovereign', 'steady'];

export const products = {
  sensual: {
    slug: 'sensual',
    meta: {
      language: 'en',
      title: 'sensual | sōmme',
      description: 'sensual is a floral tea blend by sōmme for the lover inside',
      favicon: '/sites/somme/assets/images/favicon.png',
    },
    product: {
      category: 'sensual',
      name: 'sensual',
      description:
        'a soft floral blend for slow evenings and open-hearted ritual',
      ingredientsLabel: 'botanicals',
      ingredients: ['rose', 'hibiscus', 'damiana'],
      imageSrc: '/sites/somme/assets/images/products/sensual-tsp.png',
      imageAlt: 'sensual tea blend product',
    },
    square: {
      searchTerm: 'sensual',
    },
  },
  sovereign: {
    slug: 'sovereign',
    meta: {
      language: 'en',
      title: 'sovereign | sōmme',
      description: 'sovereign is a restorative tea blend by sōmme for self-care days',
      favicon: '/sites/somme/assets/images/favicon.png',
    },
    product: {
      category: 'sovereign',
      name: 'sovereign',
      description:
        'a clarifying blend for quiet mornings and returning to yourself',
      ingredientsLabel: 'botanicals',
      ingredients: ['linden flower', 'spearmint', 'oat straw'],
      imageSrc: '/sites/somme/assets/images/products/sovereign-tsp.png',
      imageAlt: 'sovereign tea blend product',
    },
    square: {
      searchTerm: 'sovereign',
    },
  },
  steady: {
    slug: 'steady',
    meta: {
      language: 'en',
      title: 'steady | sōmme',
      description: 'steady is a grounding tea blend by sōmme for calming the soul',
      favicon: '/sites/somme/assets/images/favicon.png',
    },
    product: {
      category: 'steady',
      name: 'steady',
      description:
        'a rooted cacao blend for settling the body and grounding the soul',
      ingredientsLabel: 'botanicals',
      ingredients: ['white pine', 'dandelion root', 'cacao'],
      imageSrc: '/sites/somme/assets/images/products/steady-tsp.png',
      imageAlt: 'steady tea blend product',
    },
    square: {
      searchTerm: 'steady',
    },
  },
};

export const buildProductPageConfig = (slug) => {
  const entry = products[slug];

  if (!entry) {
    throw new Error(`Unknown product slug: ${slug}`);
  }

  const currentIndex = productOrder.indexOf(slug);
  const previousSlug = productOrder[(currentIndex - 1 + productOrder.length) % productOrder.length];
  const nextSlug = productOrder[(currentIndex + 1) % productOrder.length];

  return {
    meta: entry.meta,
    theme: {
      '--page-pad': 'clamp(1rem, 2.5vw, 2rem)',
      '--font-body': '"Red Hat Text", sans-serif',
      '--font-display': '"Fahkwang", serif',
      '--color-page-bg': '#fafafa',
      '--color-text-primary': '#66614e',
      '--color-text-soft': '#66614e',
      '--nav-font-size': '0.76rem',
      '--nav-letter-spacing': '0.1em',
    },
    product: entry.product,
    square: {
      slug,
      endpoint: `/api/catalog/${slug}`,
      ...entry.square,
    },
    navigation: {
      homeHref: '/',
      homeLabel: 'sōmme',
      links: [
        { href: '/#tea', label: 'tea' },
        { href: '/about.html', label: 'about' },
      ],
      previous: {
        href: `/products/${previousSlug}.html`,
        label: previousSlug,
      },
      next: {
        href: `/products/${nextSlug}.html`,
        label: nextSlug,
      },
      backHref: '#',
      backLabel: 'add to cart',
    },
  };
};
