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

  const images = [
    '/assets/diary/2026-08-18/01.webp',
    '/assets/diary/2026-08-18/02.webp',
    '/assets/diary/2026-08-18/03.webp',
    '/assets/diary/2026-08-18/04.webp',
    '/assets/diary/2026-08-18/05.webp',
    '/assets/diary/2026-08-18/06.webp',
    '/assets/diary/2026-08-18/07.webp',
    '/assets/diary/2026-08-18/08.webp'
  ];

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
    stage.style.backgroundImage = `url('${images[index]}')`;
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
