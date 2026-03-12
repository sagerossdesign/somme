export const siteConfig = {
  meta: {
    language: 'en',
    title: '{{BRAND_NAME}}',
    description: '{{BRAND_DESCRIPTION}}',
    favicon: './assets/images/favicon.png',
  },
  theme: {
    '--page-pad': 'clamp(1rem, 2.5vw, 2rem)',
    '--color-page-bg': '#f5f4f0',
    '--color-text-primary': '#f5f4f0',
    '--color-text-soft': 'rgba(245, 244, 240, 0.78)',
    '--font-body': 'Inter, sans-serif',
    '--font-display': 'Georgia, serif',
    '--hero-scroll-length': '2200svh',
    '--hero-tagline-size': 'clamp(0.95rem, 1.8vw, 1.2rem)',
    '--background-overlay':
      'linear-gradient(180deg, rgba(31, 41, 30, 0.44) 0%, rgba(31, 41, 30, 0.3) 40%, rgba(31, 41, 30, 0.56) 100%), rgba(31, 41, 30, 0.12)',
    '--logo-filter': 'none',
  },
  sections: {
    background: {
      imageSrc: './assets/images/hero-image.png',
      imageAlt: '',
    },
    header: {
      brandHref: '#top',
      brandLabel: '{{BRAND_NAME}}',
      brandMarkSrc: './assets/images/favicon.png',
      brandMarkAlt: '{{BRAND_NAME}}',
      navAriaLabel: 'Primary',
      links: [
        { label: 'story', href: '#story' },
        { label: 'offerings', href: '#offerings' },
        { label: 'journal', href: '#journal' },
      ],
      cta: {
        label: '{{PRIMARY_CTA}}',
        href: '#journal',
      },
    },
    main: [
      {
        type: 'heroEditorial',
        id: 'top',
        eyebrow: '{{TAGLINE}}',
        brandmarkSrc: './assets/images/main-logo.png',
        brandmarkAlt: '{{BRAND_NAME}}',
        title: '{{HERO_HEADLINE}}',
        body: '{{BRAND_DESCRIPTION}}',
        actions: [
          { label: '{{PRIMARY_CTA}}', href: '#offerings', variant: 'primary' },
          { label: 'Read the story', href: '#story', variant: 'secondary' },
        ],
        details: [
          { label: 'Mood', value: 'Set a tone that feels specific to the brand.' },
          { label: 'Offer', value: 'Swap this rail for your primary categories or proof.' },
          { label: 'Format', value: 'Each homepage section is defined in site.config.js.' },
        ],
      },
      {
        type: 'splitCopy',
        id: 'story',
        eyebrow: 'Story',
        title: 'Build the homepage from reusable sections, then swap only the brand data.',
        body: [
          'This starter keeps layout, section renderers, and animation utilities in the shared foundation.',
          'For a new brand, start in site.config.js, not in the shared markup.',
        ],
        sideEyebrow: 'Starter rule',
        sideTitle: 'Change config first.',
        sideItems: [
          'Update copy and navigation.',
          'Swap asset paths and theme tokens.',
          'Only add new shared renderers when the content model no longer fits.',
        ],
      },
      {
        type: 'cardGrid',
        id: 'offerings',
        eyebrow: 'Offerings',
        title: 'Use cards for categories, collections, services, or proof.',
        intro: 'Each card takes an eyebrow, title, and short body copy.',
        cards: [
          {
            eyebrow: 'Card one',
            title: 'Replace with your first offer',
            body: 'Keep the copy tight and outcome-oriented.',
          },
          {
            eyebrow: 'Card two',
            title: 'Replace with your second offer',
            body: 'This layout stays reusable across different brand types.',
          },
          {
            eyebrow: 'Card three',
            title: 'Replace with your third offer',
            body: 'Extend the shared section only when you need a new pattern.',
          },
        ],
      },
      {
        type: 'ctaBand',
        id: 'journal',
        eyebrow: 'CTA',
        title: 'Finish with one clear next step.',
        body: 'Use the CTA band for signups, booking, product drops, or a contact prompt.',
        actions: [
          { label: '{{PRIMARY_CTA}}', href: '#top', variant: 'primary' },
        ],
      },
    ],
    footer: {
      id: 'footer',
      brandLabel: '{{BRAND_NAME}}',
      note: '{{TAGLINE}}',
      links: [
        { label: 'story', href: '#story' },
        { label: 'offerings', href: '#offerings' },
        { label: 'footer', href: '#footer' },
      ],
      markSrc: './assets/images/favicon.png',
      markAlt: '{{BRAND_NAME}} favicon',
    },
  },
  animations: {
    heroFade: false,
    revealSections: {
      selector: '[data-reveal]',
    },
  },
};
