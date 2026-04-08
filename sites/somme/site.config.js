export const siteConfig = {
  meta: {
    language: 'en',
    title: 'sōmme | arrive to yourself through the senses',
    description:
      'sōmme is a ritual-centered wellness brand rooted in ritual, simplicity, and embodied presence',
    favicon: '/sites/somme/assets/images/favicon.png',
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
    '--background-overlay': 'transparent',
    '--logo-filter': 'brightness(0) invert(1)',
  },
  sections: {
    background: {
      imageSrc: '/web%20assets/Add%20Noise.png',
      imageAlt: 'sōmme homepage background',
    },
    header: {
      navAriaLabel: 'Primary',
      links: [
        { label: 'tea', href: '/products/sensual.html' },
        { label: 'about', href: '/about.html' },
      ],
    },
    main: [
      {
        type: 'heroEditorial',
        id: 'top',
        layout: 'centered',
        wordmark: 'sōmme',
      },
    ],
    footer: {
      id: 'footer',
      brandLabel: 'sōmme',
      note: 'arrive to self through the senses',
      links: [
        { label: 'tea', href: '/products/sensual.html' },
        { label: 'about', href: '/about.html' },
        { label: 'top', href: '#top' },
      ],
      markSrc: '/sites/somme/assets/images/favicon.png',
      markAlt: 'sōmme favicon',
    },
  },
  animations: {
    heroFade: false,
    revealSections: {
      selector: '[data-reveal]',
    },
    scrollSequence: false,
    teaFeature: false,
    sectionAdvance: false,
  },
};
