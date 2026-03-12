export const siteConfig = {
  meta: {
    language: 'en',
    title: 'sōmme | arrive to yourself through the senses',
    description:
      'sōmme is a ritual-centered wellness brand rooted in ritual, simplicity, and embodied presence',
    favicon: './assets/images/favicon.png',
  },
  theme: {
    '--page-pad': 'clamp(1rem, 2.5vw, 2rem)',
    '--color-page-bg': '#fafafa',
    '--color-text-primary': '#66614e',
    '--color-text-soft': '#66614e',
    '--font-body': '"Red Hat Text", sans-serif',
    '--font-display': '"Fahkwang", serif',
    '--header-height': '4.75rem',
    '--hero-scroll-length': '2200svh',
    '--hero-tagline-size': 'clamp(0.95rem, 1.8vw, 1.2rem)',
    '--nav-font-size': '0.76rem',
    '--nav-letter-spacing': '0.1em',
    '--background-overlay':
      'linear-gradient(180deg, rgba(19, 23, 17, 0.44) 0%, rgba(19, 23, 17, 0.3) 40%, rgba(19, 23, 17, 0.56) 100%), rgba(126, 135, 109, 0.12)',
    '--logo-filter': 'brightness(0) invert(1)',
  },
  sections: {
    background: {},
    header: {
      navAriaLabel: 'Primary',
      links: [
        { label: 'tea', href: '#tea' },
        { label: 'about', href: './about.html' },
      ],
    },
    main: [
      {
        type: 'heroEditorial',
        id: 'top',
        layout: 'centered',
        wordmark: 'sōmme',
      },
      {
        type: 'scrollSequence',
        id: 'story',
        lines: [
          'arrive to self through the senses',
        ],
      },
      {
        type: 'teaFeature',
        id: 'tea',
        cards: [
          {
            botanical: 'rose',
            imageSrc: './assets/images/rose-abstract.png',
            imageAlt: 'rose botanical card',
            href: './products/sensual.html',
            overlay: {
              title: 'sensual',
              lines: [
                'for the lover inside',
              ],
              ingredients: ['rose', 'hibiscus', 'damiana'],
            },
          },
          {
            botanical: 'hibiscus',
            imageSrc: './assets/images/soverign-abstract.png',
            imageAlt: 'hibiscus botanical card',
            href: './products/sovereign.html',
            overlay: {
              title: 'sovereign',
              lines: [
                'for self-care days',
              ],
              ingredients: ['linden flower', 'spearmint', 'oat straw'],
            },
          },
          {
            botanical: 'damiana',
            imageSrc: './assets/images/grounded-abstract.png',
            imageAlt: 'damiana botanical card',
            href: './products/steady.html',
            overlay: {
              title: 'steady',
              lines: [
                'for grounding the soul',
              ],
              ingredients: ['white pine', 'dandelion root', 'cacao'],
            },
          },
        ],
      },
    ],
    footer: {
      id: 'footer',
      brandLabel: 'sōmme',
      note: 'arrive to self through the senses',
      links: [
        { label: 'tea', href: '#tea' },
        { label: 'about', href: './about.html' },
        { label: 'top', href: '#top' },
      ],
      markSrc: './assets/images/favicon.png',
      markAlt: 'sōmme favicon',
    },
  },
  animations: {
    heroFade: false,
    revealSections: {
      selector: '[data-reveal]',
    },
    scrollSequence: {
      selector: '[data-scroll-sequence]',
    },
    teaFeature: {
      selector: '[data-tea-feature]',
      duration: 9600,
    },
    sectionAdvance: {
      heroSelector: '#top',
      storySelector: '#story',
      teaSelector: '#tea',
      footerSelector: '#footer',
      duration: 1150,
      storyFadeDuration: 800,
      storyToTeaDuration: 850,
      gestureCooldown: 260,
    },
  },
};
