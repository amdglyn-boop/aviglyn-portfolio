(() => {
  const canvas = document.querySelector('[data-rig-ragdoll]');
  if (!canvas) return;

  const card = canvas.closest('[data-tilt]');
  const originalRect = canvas.getBoundingClientRect.bind(canvas);
  let pointerActive = false;
  let pointerInside = false;
  let savedTransition = '';

  // The generic project-card tilt uses CSS transforms. A transformed bounding box can
  // fluctuate by fractional pixels, which the ragdoll previously mistook for a real
  // canvas resize and responded to by rebuilding the skeleton in its default pose.
  // Keep this one canvas' logical size tied to its layout box instead of the transformed
  // visual bounding box.
  canvas.getBoundingClientRect = () => {
    const rect = originalRect();
    const width = Math.max(1, canvas.clientWidth || canvas.offsetWidth || rect.width);
    const height = Math.max(1, canvas.clientHeight || canvas.offsetHeight || rect.height);

    return {
      x: rect.left,
      y: rect.top,
      left: rect.left,
      top: rect.top,
      right: rect.left + width,
      bottom: rect.top + height,
      width,
      height,
      toJSON() {
        return {
          x: rect.left,
          y: rect.top,
          left: rect.left,
          top: rect.top,
          right: rect.left + width,
          bottom: rect.top + height,
          width,
          height
        };
      }
    };
  };

  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.setAttribute('draggable', 'false');

  function neutralizeCardTilt() {
    if (!card) return;
    if (!savedTransition) savedTransition = card.style.transition;
    card.style.transition = 'none';
    card.style.transform = '';
  }

  function restoreCardTransition() {
    if (!card || pointerInside || pointerActive) return;
    card.style.transition = savedTransition;
  }

  // Stop the generic card-level pointermove handler from receiving motion that belongs
  // to the ragdoll. Listeners on the canvas itself still run normally.
  canvas.addEventListener('pointerenter', () => {
    pointerInside = true;
    neutralizeCardTilt();
  }, true);

  canvas.addEventListener('pointermove', (event) => {
    neutralizeCardTilt();
    event.stopPropagation();
  }, true);

  canvas.addEventListener('pointerdown', (event) => {
    pointerActive = true;
    neutralizeCardTilt();
    event.stopPropagation();
  }, true);

  canvas.addEventListener('pointerup', (event) => {
    pointerActive = false;
    event.stopPropagation();
    restoreCardTransition();
  }, true);

  canvas.addEventListener('pointercancel', (event) => {
    pointerActive = false;
    event.stopPropagation();
    restoreCardTransition();
  }, true);

  canvas.addEventListener('pointerleave', () => {
    pointerInside = false;
    restoreCardTransition();
  }, true);
})();