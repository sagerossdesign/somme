export const initRevealSections = ({
  selector = '[data-reveal]',
  visibleClass = 'is-visible',
  rootMargin = '0px 0px -12% 0px',
  threshold = 0.15,
} = {}) => {
  const nodes = [...document.querySelectorAll(selector)];

  if (!nodes.length) {
    return () => {};
  }

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add(visibleClass));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(visibleClass);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin, threshold }
  );

  nodes.forEach((node) => observer.observe(node));

  return () => observer.disconnect();
};
