const activateLine = (lines, index) => {
  lines.forEach((line, lineIndex) => {
    line.classList.toggle('is-active', lineIndex === index);
  });
};

const bindSequence = (container, interval) => {
  const lines = [...container.querySelectorAll('.sequence-line')];

  if (!lines.length) {
    return () => {};
  }

  let activeIndex = 0;
  let timerId = null;

  const start = () => {
    if (timerId) {
      return;
    }

    activateLine(lines, activeIndex);

    timerId = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % lines.length;
      activateLine(lines, activeIndex);
    }, interval);
  };

  const stop = () => {
    if (!timerId) {
      return;
    }

    window.clearInterval(timerId);
    timerId = null;
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return stop;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(container);

  return () => {
    stop();
    observer.disconnect();
  };
};

export const initSequenceLines = ({
  selector = '[data-sequence-lines]',
  interval = 2600,
} = {}) => {
  const containers = [...document.querySelectorAll(selector)];
  const cleanups = containers.map((container) => bindSequence(container, interval));

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
