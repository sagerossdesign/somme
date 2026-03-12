import { clamp } from '../utils.js';

const getStageGroups = (section) => {
  const cards = [...section.querySelectorAll('.tea-card')];

  const cardGroups = cards.map((card) => [card]);
  const titleGroup = cards.flatMap((card) => {
    const title = card.querySelector('.tea-card-overlay-title');
    return title ? [title] : [];
  });
  const bodyGroup = cards.flatMap((card) => [
    ...card.querySelectorAll('.tea-card-overlay-copy .tea-card-overlay-line'),
  ]);
  const ingredientRows = [0, 1, 2].map((ingredientIndex) =>
    cards
      .map((card) => card.querySelectorAll('.tea-card-overlay-ingredient')[ingredientIndex])
      .filter(Boolean)
  );

  return [...cardGroups, titleGroup, bodyGroup, ...ingredientRows].filter(
    (group) => group.length
  );
};

const getStageTiming = (stageCount, cardStageCount) => {
  const starts = [];
  const windows = [];
  let cursor = 0;

  for (let index = 0; index < stageCount; index += 1) {
    starts.push(cursor);

    if (index < cardStageCount) {
      windows.push(0.9);
      cursor += index < cardStageCount - 1 ? 0.5 : 0.72;
      continue;
    }

    if (index === cardStageCount) {
      windows.push(0.56);
      cursor += 0.46;
      continue;
    }

    if (index === cardStageCount + 1) {
      windows.push(0.52);
      cursor += 0.44;
      continue;
    }

    windows.push(0.62);
    cursor += 0.4;
  }

  return {
    starts,
    windows,
    maxProgress: starts.at(-1) + windows.at(-1),
  };
};

const setSectionProgress = (sectionState, progressValue) => {
  sectionState.displayProgress = progressValue;
  const overlapProgress = clamp(
    (progressValue - sectionState.interactiveStart) /
      Math.max(sectionState.maxProgress - sectionState.interactiveStart, 0.001),
    0,
    1
  );

  sectionState.section.style.setProperty(
    '--tea-overlap-progress',
    overlapProgress.toFixed(3)
  );
  sectionState.section.style.setProperty(
    '--tea-image-scale',
    (1 + overlapProgress * 0.02).toFixed(3)
  );

  sectionState.stages.forEach((group, index) => {
    const opacity = clamp(
      (progressValue - sectionState.stageStarts[index]) /
        sectionState.stageWindows[index],
      0,
      1
    );

    group.forEach((element) => {
      element.style.opacity = opacity.toFixed(3);
      element.style.transform = 'none';
    });
  });
};

const animateToProgress = (sectionState, targetProgress, onComplete) => {
  if (sectionState.animationFrame) {
    cancelAnimationFrame(sectionState.animationFrame);
  }

  const startProgress = sectionState.displayProgress;
  const startTime = performance.now();

  sectionState.animating = true;

  const tick = (now) => {
    const elapsed = now - startTime;
    const rawProgress = clamp(elapsed / sectionState.duration, 0, 1);
    const displayProgress =
      startProgress + (targetProgress - startProgress) * rawProgress;

    setSectionProgress(sectionState, displayProgress);

    if (rawProgress < 1) {
      sectionState.animationFrame = requestAnimationFrame(tick);
      return;
    }

    sectionState.animationFrame = null;
    sectionState.animating = false;
    sectionState.completed = targetProgress >= sectionState.maxProgress;
    sectionState.section.dataset.teaInteractive = sectionState.completed ? 'true' : 'false';
    setSectionProgress(sectionState, targetProgress);
    onComplete?.();
  };

  sectionState.animationFrame = requestAnimationFrame(tick);
};

export const initTeaFeature = ({
  selector = '[data-tea-feature]',
  duration = 3600,
} = {}) => {
  const sections = [...document.querySelectorAll(selector)];

  if (!sections.length) {
    return () => {};
  }

  const sectionStates = sections.map((section) => {
    const stages = getStageGroups(section);
    const cardStageCount = section.querySelectorAll('.tea-card').length;
    const { starts, windows, maxProgress } = getStageTiming(
      stages.length,
      cardStageCount
    );
    const sectionState = {
      section,
      stages,
      stageStarts: starts,
      stageWindows: windows,
      displayProgress: 0,
      maxProgress,
      interactiveStart: starts[Math.max(cardStageCount, 0)] ?? maxProgress,
      duration,
      animating: false,
      completed: false,
      animationFrame: null,
    };

    section.dataset.teaInteractive = 'false';
    section.style.setProperty('--tea-overlap-progress', '0');
    section.style.setProperty('--tea-image-scale', '1');

    section.__teaFeatureController = {
      get animating() {
        return sectionState.animating;
      },
      get completed() {
        return sectionState.completed;
      },
      play(onComplete) {
        if (sectionState.animating || sectionState.completed) {
          return false;
        }

        animateToProgress(sectionState, sectionState.maxProgress, onComplete);
        return true;
      },
    };

    setSectionProgress(sectionState, 0);
    return sectionState;
  });

  return () => {
    sectionStates.forEach((sectionState) => {
      if (sectionState.animationFrame) {
        cancelAnimationFrame(sectionState.animationFrame);
      }

      delete sectionState.section.dataset.teaInteractive;
      sectionState.section.style.removeProperty('--tea-overlap-progress');
      sectionState.section.style.removeProperty('--tea-image-scale');
      delete sectionState.section.__teaFeatureController;
    });
  };
};
