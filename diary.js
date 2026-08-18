(() => {
  const replay = document.querySelector('[data-diary-replay]');
  if (!replay) return;

  const stage = replay.querySelector('[data-replay-stage]');
  const range = replay.querySelector('[data-replay-range]');
  const count = replay.querySelector('[data-replay-count]');
  const title = replay.querySelector('[data-replay-title]');
  const copy = replay.querySelector('[data-replay-copy]');
  const previous = replay.querySelector('[data-replay-previous]');
  const next = replay.querySelector('[data-replay-next]');
  const dots = [...replay.querySelectorAll('[data-replay-dot]')];

  const sprite = 'data:image/webp;base64,' +
    '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';

  stage.style.backgroundImage = `url("${sprite}")`;

  const steps = [
    {
      title: 'Building the base',
      copy: 'I started by laying the octopus out with ZSpheres. This was my first proper time using them, so a lot of this stage was simply learning how to control the structure and get eight tentacles into place.'
    },
    {
      title: 'Checking the smooth form',
      copy: 'I switched to the smooth preview to see whether the silhouette was working. It was rough, but I could already see the head, body and tentacles starting to read as one creature.'
    },
    {
      title: 'Cleaning the big shapes',
      copy: 'Once the base felt usable I started cleaning the larger forms. I wanted the tentacles to stop feeling like separate tubes and connect into the body more naturally.'
    },
    {
      title: 'Starting the face',
      copy: 'I began shaping the face and testing where the eyes and siphon should sit. This was the point where I stopped thinking only about the base and started treating it like a sculpt.'
    },
    {
      title: 'Working around the eye',
      copy: 'I spent more time around the eye and started carving in the forms around it. It is still rough, but this helped me understand how much the smaller forms depend on the big shapes underneath.'
    },
    {
      title: 'Adding the siphon',
      copy: 'I added the siphon and kept pushing the face. This was one of the moments where it started to feel much more like an octopus instead of a simple blockout.'
    },
    {
      title: 'Checking the whole sculpt',
      copy: 'I kept refining the mantle, eyes and tentacles, then checked the model as a whole. The main blockout is getting close, but the tentacles and the face still need another pass.'
    },
    {
      title: 'Where I stopped today',
      copy: 'This is where I left it after almost two hours. It is not finished yet, but for my first proper session with ZSpheres I am happy with how far the base and main forms came along.'
    }
  ];

  let index = 0;

  const render = () => {
    const max = steps.length - 1;
    const position = max ? (index / max) * 100 : 0;
    stage.style.backgroundPosition = `${position}% center`;
    stage.setAttribute('aria-label', `${steps[index].title}. Step ${index + 1} of ${steps.length}.`);
    range.value = String(index);
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    title.textContent = steps[index].title;
    copy.textContent = steps[index].copy;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'step' : 'false');
    });
    previous.disabled = index === 0;
    next.disabled = index === max;
  };

  const setIndex = (value) => {
    index = Math.max(0, Math.min(steps.length - 1, Number(value)));
    render();
  };

  range.max = String(steps.length - 1);
  range.addEventListener('input', () => setIndex(range.value));
  previous.addEventListener('click', () => setIndex(index - 1));
  next.addEventListener('click', () => setIndex(index + 1));
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => setIndex(dotIndex)));

  stage.addEventListener('click', (event) => {
    const rect = stage.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    setIndex(localX < rect.width / 2 ? index - 1 : index + 1);
  });

  replay.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setIndex(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setIndex(index + 1);
    }
  });

  render();
})();
