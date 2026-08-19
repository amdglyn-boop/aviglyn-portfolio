(() => {
  const existingReplay = document.querySelector('[data-diary-replay]');
  if (!existingReplay) return;
  if (document.documentElement.dataset.diaryDayTwoReady === 'true') return;
  document.documentElement.dataset.diaryDayTwoReady = 'true';

  const addStylesheet = (href) => {
    if ([...document.styleSheets].some((sheet) => sheet.href && sheet.href.includes(href.split('?')[0]))) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  addStylesheet('/diary-carousel-preview.css?v=20260818-1627');
  addStylesheet('/diary-day-two.css?v=20260819-1');

  const entries = {
    '2026-08-19': {
      images: [
        '/assets/diary/2026-08-19/01.webp',
        '/assets/diary/2026-08-19/02.webp',
        '/assets/diary/2026-08-19/03.webp',
        '/assets/diary/2026-08-19/04.webp',
        '/assets/diary/2026-08-19/05.webp',
        '/assets/diary/2026-08-19/06.webp',
        '/assets/diary/2026-08-19/07.webp',
        '/assets/diary/2026-08-19/08.webp'
      ],
      steps: [
        {
          title: 'Cleaning the webbing',
          copy: 'I started by going back into the webbing between the tentacles. Yesterday it was still reading as thick joins, so I thinned and shaped the membranes and tried to make the transitions feel more organic.'
        },
        {
          title: 'Making the joins feel softer',
          copy: 'I kept working around the base of the tentacles, smoothing the heavier connections and adding broader folds where the webbing stretches into the body. This helped the arms feel like part of one continuous animal.'
        },
        {
          title: 'Checking the whole silhouette',
          copy: 'I pulled back to make sure the webbing changes were helping the full sculpt rather than only looking better up close. The body and tentacles were starting to read as one form instead of separate tubes.'
        },
        {
          title: 'Starting the smaller forms',
          copy: 'Once the larger transitions felt better I started adding folds and wrinkles around the mantle and face. This was the point where I moved beyond the main secondary shapes and started edging into tertiary detail.'
        },
        {
          title: 'Balancing the face and mantle',
          copy: 'I kept the face, siphon and mantle moving forward together so one area did not become much more finished than the rest. The goal here was still structure first, with the smaller creases supporting the bigger forms.'
        },
        {
          title: 'Adding the suckers',
          copy: 'I started building the sucker rows along the underside of the tentacles. The main challenge was getting the spacing and taper to follow the curve of each arm without making them feel stamped on.'
        },
        {
          title: 'Checking the underside',
          copy: 'With more sucker rows in place I rotated underneath to check the rhythm between the tentacles, webbing and suckers. Seeing them together immediately made the underside feel much more recognisable as an octopus.'
        },
        {
          title: 'Where I stopped today',
          copy: 'By the end of the session the webbing was cleaner, the secondary forms were further along, tertiary wrinkles had started and the tentacles finally had suckers. There is still a lot to refine, but it now feels like a much more complete creature.'
        }
      ]
    },
    '2026-08-18': {
      images: [
        '/assets/diary/2026-08-18/01.webp',
        '/assets/diary/2026-08-18/02.webp',
        '/assets/diary/2026-08-18/03.webp',
        '/assets/diary/2026-08-18/04.webp',
        '/assets/diary/2026-08-18/05.webp',
        '/assets/diary/2026-08-18/06.webp',
        '/assets/diary/2026-08-18/07.webp',
        '/assets/diary/2026-08-18/08.webp'
      ],
      steps: [
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
      ]
    }
  };

  const dotsMarkup = () => Array.from({ length: 8 }, (_, index) =>
    `<button class="replay-dot${index === 0 ? ' is-active' : ''}" data-replay-dot type="button" aria-label="Step ${index + 1}"></button>`
  ).join('');

  const dayTwo = document.createElement('section');
  dayTwo.id = 'entry-2026-08-19';
  dayTwo.className = 'diary-entry section-shell diary-entry-latest';
  dayTwo.innerHTML = `
    <div class="entry-heading">
      <div>
        <p class="eyebrow"><span>19.08.2026</span> ZBrush</p>
        <h2>Pushing the octopus past the blockout.</h2>
      </div>
      <div class="entry-heading-copy">
        <p>Today was about making yesterday's base feel less like a collection of smooth tubes and more like one animal. I cleaned the webbing between the tentacles, added folds and wrinkles around the body and mantle, pushed the secondary forms further, then started moving into tertiary detail. The biggest change was adding the sucker rows, which immediately gave the underside much more character.</p>
        <div class="course-note">
          <small>Day two focus</small>
          <p>I kept the same octopus from yesterday and concentrated on transitions, surface structure and the details that make the tentacles read properly.</p>
        </div>
      </div>
    </div>

    <div class="replay" data-diary-replay data-diary-entry="2026-08-19" tabindex="0">
      <div class="replay-top"><span>Progress replay</span><span>Click the image or drag the timeline</span></div>
      <div class="replay-grid">
        <div class="replay-stage-wrap">
          <div class="replay-stage" data-replay-stage role="img" aria-label="Cleaning the webbing. Step 1 of 8."></div>
          <span class="replay-hint">Left side back • Right side forward</span>
        </div>
        <div class="replay-copy">
          <span class="replay-count" data-replay-count>01 / 08</span>
          <h3 data-replay-title>Cleaning the webbing</h3>
          <p data-replay-copy>I started by going back into the webbing between the tentacles. Yesterday it was still reading as thick joins, so I thinned and shaped the membranes and tried to make the transitions feel more organic.</p>
          <div class="replay-controls">
            <input class="replay-range" data-replay-range type="range" min="0" max="7" value="0" step="1" aria-label="Move through the sculpt progress">
            <div class="replay-dots" aria-label="Progress steps">${dotsMarkup()}</div>
            <div class="replay-buttons">
              <button data-replay-previous type="button">Previous</button>
              <button data-replay-next type="button">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="diary-notes">
      <article class="diary-note"><b>01</b><h3>What I worked on</h3><p>I cleaned the webbing and tentacle joins, pushed the secondary forms further, added folds and wrinkles around the body and mantle, and built sucker rows along the underside of the tentacles.</p></article>
      <article class="diary-note"><b>02</b><h3>What I learned</h3><p>The webbing changes the read of the whole creature. The smaller wrinkles only start to work once those larger transitions feel right, and the suckers need to follow the flow and taper of each tentacle rather than just repeating evenly.</p></article>
      <article class="diary-note"><b>03</b><h3>What needs work</h3><p>Some of the webbing is still too heavy, the wrinkle detail needs to blend more naturally into the larger forms, and the sucker spacing and scale need another cleanup pass. The mantle and eye area also still need refinement.</p></article>
      <article class="diary-note"><b>04</b><h3>Next time</h3><p>Refine the sucker rows, clean the webbing again where it still feels thick, keep the detail scale consistent across the mantle and face, and continue the tertiary pass without overworking the surface.</p></article>
    </div>
  `;

  const dayOne = document.querySelector('#entry-2026-08-18');
  if (dayOne) dayOne.before(dayTwo);

  existingReplay.dataset.diaryEntry = '2026-08-18';

  const heroEyebrow = document.querySelector('.diary-title .eyebrow');
  if (heroEyebrow) heroEyebrow.innerHTML = '<span>Diary / 02</span> 19 August 2026';

  const latest = document.querySelector('.diary-latest');
  if (latest) {
    const heading = latest.querySelector('h2');
    const summary = latest.querySelector(':scope > p');
    const facts = latest.querySelector('.diary-facts');
    if (heading) heading.textContent = 'Webbing, wrinkles and suckers.';
    if (summary) summary.textContent = 'I pushed the octopus beyond the blockout today: cleaned the webbing, added folds and wrinkles, started smaller surface detail and built sucker rows along the tentacles.';
    if (facts) facts.innerHTML = '<span>ZBrush</span><span>Secondary + tertiary</span><span>In progress</span>';
  }

  const hero = document.querySelector('.diary-hero');
  if (hero && !document.querySelector('.diary-day-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'diary-day-nav section-shell';
    nav.setAttribute('aria-label', 'Diary entries');
    nav.innerHTML = `
      <a class="diary-day-link is-active" data-diary-day-link href="#entry-2026-08-19">
        <small>Day 02 · 19 Aug</small>
        <strong>Webbing, wrinkles & suckers</strong>
        <span aria-hidden="true">↓</span>
      </a>
      <a class="diary-day-link" data-diary-day-link href="#entry-2026-08-18">
        <small>Day 01 · 18 Aug</small>
        <strong>First ZSphere octopus</strong>
        <span aria-hidden="true">↓</span>
      </a>
    `;
    hero.after(nav);
  }

  const archive = document.querySelector('.diary-archive');
  if (archive) {
    const archiveHeading = archive.querySelector('.archive-heading h2');
    if (archiveHeading) archiveHeading.textContent = 'Two days in.';

    const dayOneArchive = archive.querySelector('a[href="#entry-2026-08-18"]');
    if (dayOneArchive && !archive.querySelector('a[href="#entry-2026-08-19"]')) {
      const dayTwoArchive = document.createElement('a');
      dayTwoArchive.className = 'archive-entry';
      dayTwoArchive.href = '#entry-2026-08-19';
      dayTwoArchive.innerHTML = '<small>19 August 2026</small><div><h3>Webbing, wrinkles and suckers</h3><p>ZBrush • Secondary forms • Tertiary detail • Suckers</p></div><span aria-hidden="true">↗</span>';
      dayOneArchive.before(dayTwoArchive);
    }
  }

  const initReplay = (replay) => {
    const entry = entries[replay.dataset.diaryEntry];
    if (!entry) return;

    const { images, steps } = entry;
    const stage = replay.querySelector('[data-replay-stage]');
    const range = replay.querySelector('[data-replay-range]');
    const count = replay.querySelector('[data-replay-count]');
    const title = replay.querySelector('[data-replay-title]');
    const copy = replay.querySelector('[data-replay-copy]');
    const previous = replay.querySelector('[data-replay-previous]');
    const next = replay.querySelector('[data-replay-next]');
    const dots = [...replay.querySelectorAll('[data-replay-dot]')];

    if (!stage || !range || !count || !title || !copy || !previous || !next) return;

    let index = 0;

    const render = () => {
      const max = steps.length - 1;
      stage.style.backgroundImage = `url('${images[index]}')`;
      stage.setAttribute('aria-label', `${steps[index].title}. Step ${index + 1} of ${steps.length}.`);
      range.value = String(index);
      range.max = String(max);
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
  };

  document.querySelectorAll('[data-diary-replay]').forEach(initReplay);

  const dayLinks = [...document.querySelectorAll('[data-diary-day-link]')];
  const setActiveDay = (id) => {
    dayLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  };

  if ('IntersectionObserver' in window && dayLinks.length) {
    const observer = new IntersectionObserver((entriesObserved) => {
      const visibleEntries = entriesObserved
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visibleEntries[0]) setActiveDay(visibleEntries[0].target.id);
    }, { rootMargin: '-18% 0px -55% 0px', threshold: [0.08, 0.2, 0.4] });

    ['entry-2026-08-19', 'entry-2026-08-18'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
