import { initHeroFadeStage } from './animations/scroll-stage.js';
import { initRevealSections } from './animations/reveal-sections.js';
import { initSectionAdvance } from './animations/section-advance.js';
import { initScrollSequence } from './animations/scroll-sequence.js';
import { initTeaFeature } from './animations/tea-feature.js';
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

export const createImmersiveBrandSite = (config) => {
  const root = document.querySelector(config.rootSelector || '#app');

  if (!root) {
    throw new Error('Expected a site root element for rendering.');
  }

  applyTheme(config.theme);
  setDocumentMeta(config.meta);

  const fragment = document.createDocumentFragment();
  const { background, header, hero, tracks = [], main = [], footer } = config.sections;

  if (background?.imageSrc) {
    fragment.append(renderBackgroundStage(background));
  }

  fragment.append(renderSiteHeader(header));

  if (main.length) {
    fragment.append(renderConfiguredSections(main));
  } else {
    if (hero) {
      fragment.append(renderHeroStage(hero));
    }

    const legacyMain = document.createElement('main');
    tracks.forEach((track) => {
      legacyMain.append(renderScrollTrack(track));
    });
    fragment.append(legacyMain);
  }

  fragment.append(renderSiteFooter(footer));

  root.replaceChildren(fragment);

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
