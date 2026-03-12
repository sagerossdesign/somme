export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const applyTheme = (theme = {}, target = document.documentElement) => {
  Object.entries(theme).forEach(([name, value]) => {
    target.style.setProperty(name, value);
  });
};

const upsertMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.append(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
};

export const setDocumentMeta = (meta = {}) => {
  if (meta.language) {
    document.documentElement.lang = meta.language;
  }

  if (meta.title) {
    document.title = meta.title;
  }

  if (meta.description) {
    upsertMetaTag('meta[name="description"]', {
      name: 'description',
      content: meta.description,
    });
  }

  if (meta.favicon) {
    let favicon = document.head.querySelector('link[rel="icon"]');

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.append(favicon);
    }

    favicon.setAttribute('href', meta.favicon);
    favicon.setAttribute('type', meta.faviconType || 'image/png');
  }
};

export const buildLinkList = (links = []) =>
  links.map((link) => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    return anchor;
  });
