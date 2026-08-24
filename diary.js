(() => {
  const existingReplay = document.querySelector('[data-diary-replay]');
  if (!existingReplay) return;
  if (document.documentElement.dataset.diaryEntriesReady === 'true') return;
  document.documentElement.dataset.diaryEntriesReady = 'true';

  const addStylesheet = (href) => {
    if ([...document.styleSheets].some((sheet) => sheet.href && sheet.href.includes(href.split('?')[0]))) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  addStylesheet('/diary-carousel-preview.css?v=20260818-1627');
  addStylesheet('/diary-day-two.css?v=20260821-1');

  const entries = {
    '2026-08-21': {
      day: '04',
      dateLabel: '21.08.2026',
      dateLong: '21 August 2026',
      shortDate: '21 Aug',
      navTitle: 'Nose study & Kirin',
      heading: 'A nose study and a Kirin detour.',
      intro: 'I split the day between two very different things. I played around with an idea for a Kirin creature, then spent most of the session studying the nose and trying to reproduce Morgan Freeman’s nose from reference. By the end I was genuinely proud of how much better the forms were reading compared with where I started.',
      noteLabel: 'Day four focus',
      note: 'The main lesson was to slow down and study one feature properly. Instead of trying to solve an entire face at once, I could concentrate on the bridge, wings, nostrils, tip and how the nose projects in profile.',
      latestHeading: 'A nose study, plus a Kirin idea.',
      latestSummary: 'I experimented with a Kirin creature, then focused on a nose study using Morgan Freeman as reference. By the end of the day I had a nose I was genuinely proud of.',
      facts: ['ZBrush', 'Nose study', 'Creature sketch'],
      archiveTitle: 'Nose study and a Kirin detour',
      archiveMeta: 'ZBrush • Nose anatomy • Reference study • Kirin concept',
      images: [
        '/assets/diary/2026-08-21/Screenshot 2026-08-21 015846.png',
        '/assets/diary/2026-08-21/Screenshot 2026-08-21 015855.png',
        '/assets/diary/2026-08-21/Screenshot 2026-08-21 121629.png',
        '/assets/diary/2026-08-21/Screenshot 2026-08-21 133654.png',
        '/assets/diary/2026-08-21/Screenshot 2026-08-21 133819.png'
      ],
      steps: [
        {
          title: 'Messing around with a Kirin idea',
          copy: 'I started the day by playing with a Kirin creature idea. This was not meant to be a polished sculpt; I was mainly testing the long muzzle, horns, ears and the overall character of the head.'
        },
        {
          title: 'Checking the Kirin from the front',
          copy: 'The front view made the symmetry and proportions much easier to judge. I kept it loose and treated this as an idea sketch rather than something I needed to finish.'
        },
        {
          title: 'Starting the nose study from reference',
          copy: 'Later I switched to a focused nose study and used Morgan Freeman as reference. I broke the nose down into the bridge, tip, alar wings, nostrils and septum, then kept comparing the width and underside against the reference instead of treating the nose as one simple shape.'
        },
        {
          title: 'Getting the forms to read together',
          copy: 'I brought the rough mouth forms into the study so I could judge the nose in context, then checked how the nose projected and how the lips sat beneath it rather than trusting the front view alone. By this point the nose and mouth were starting to feel like connected anatomy instead of separate shapes.'
        },
        {
          title: 'Where I ended the day',
          copy: 'This was the part I felt best about. It is still a study and there is plenty to improve, but I finished the day feeling like I had made a fairly convincing nose. After struggling with facial anatomy the day before, that felt like a real step forward.'
        }
      ],
      notes: [
        ['What I worked on', 'I explored a Kirin creature idea, then spent most of the session studying nose anatomy from reference. I focused on the bridge, tip, nostrils, alar wings and the relationship between the nose and mouth.'],
        ['What I learned', 'Studying one feature at a time made the anatomy much easier to understand. The nose changes a lot in profile, and the nostrils and wings need to be treated as real volumes rather than lines cut into the surface.'],
        ['What needs work', 'The mouth and surrounding facial planes are still much weaker than the nose, and I need more practice keeping the forms clean while working at low resolution. The Kirin idea is also only an early sketch.'],
        ['Next time', 'Keep doing focused anatomy studies like this and build the face feature by feature. I want to carry the confidence from this nose study into the eyes, mouth and the larger facial proportions.']
      ]
    },
    '2026-08-20': {
      day: '03',
      dateLabel: '20.08.2026',
      dateLong: '20 August 2026',
      shortDate: '20 Aug',
      navTitle: 'Faces, wrinkles & anatomy',
      heading: 'A rough lesson in facial anatomy.',
      intro: 'I made two separate head studies today: a looser alien head and a human face. I was trying to understand facial anatomy and sculpt wrinkles, but the more I rotated the human head the more obvious it became that my proportions are still weak. It did not turn out how I wanted, but I was genuinely impressed that I could make something this readable at all.',
      noteLabel: 'Session reality',
      note: 'I kept getting power cuts during the day. Losing progress made one lesson very clear: saving regularly and keeping versions is part of the workflow, not something to remember at the end.',
      latestHeading: 'Faces, wrinkles and anatomy gaps.',
      latestSummary: 'I made separate alien and human head studies, pushed facial wrinkles, and found out very quickly where my facial proportions still fall apart. Power cuts also taught me to save constantly.',
      facts: ['ZBrush', 'Facial anatomy', '2 head studies'],
      archiveTitle: 'Faces, wrinkles and anatomy gaps',
      archiveMeta: 'ZBrush • Facial anatomy • Wrinkles • Two head studies',
      images: [
        '/assets/diary/2026-08-20/01.webp',
        '/assets/diary/2026-08-20/02.webp',
        '/assets/diary/2026-08-20/03.webp',
        '/assets/diary/2026-08-20/04.webp',
        '/assets/diary/2026-08-20/05.webp'
      ],
      steps: [
        {
          title: 'Starting with the alien head',
          copy: 'I began with a separate alien head study and used the exaggerated face to experiment with the brow, nose, mouth and deeper folds. It gave me room to push wrinkles without worrying too much about realism yet.'
        },
        {
          title: 'Checking it in three-quarter',
          copy: 'Rotating the alien head quickly showed where the forms were getting lumpy. The brow, cheek and mouth area changed a lot from this angle, which reminded me that a face has to work as a volume rather than only from the front.'
        },
        {
          title: 'Starting a separate human head',
          copy: 'I then moved onto a completely separate human head and tried to place the main facial landmarks more realistically. From the front I could get something readable, but I was already noticing that my proportions were not as solid as I thought.'
        },
        {
          title: 'The profile exposed the problems',
          copy: 'The side view was the biggest reality check. The skull depth, forehead, nose, mouth, chin and ear relationships made it obvious that my facial anatomy and proportions still need a lot of study.'
        },
        {
          title: 'Pushing the wrinkle pass',
          copy: 'I kept going and added more creases around the brow, eyes, nose and mouth. The wrinkles gave the face more character, but they also proved that surface detail cannot rescue weak underlying proportions. Even so, I was impressed that I could make a recognisable head at all.'
        }
      ],
      notes: [
        ['What I worked on', 'I sculpted two separate heads: an exaggerated alien study first, then a human head focused on facial landmarks, proportions and wrinkles around the brow, eyes, nose and mouth.'],
        ['What I learned', 'Profile and three-quarter views expose proportion problems much faster than a front view. I also learned that wrinkles only work when the structure underneath is convincing, and that saving constantly matters when the power is unreliable.'],
        ['What needs work', 'My skull shape, eye placement, ear size and position, and the relationships between the nose, mouth and chin all need more study. I also need to stop using wrinkles as a shortcut before the larger anatomy is working.'],
        ['Next time', 'Start simpler, check the big landmarks from front, profile and three-quarter views earlier, and hold off on wrinkles until the head proportions feel solid. Also: save versions throughout the session.']
      ]
    },
    '2026-08-19': {
      day: '02',
      dateLabel: '19.08.2026',
      dateLong: '19 August 2026',
      shortDate: '19 Aug',
      navTitle: 'Webbing, wrinkles & suckers',
      heading: 'Pushing the octopus past the blockout.',
      intro: 'Today was about making yesterday\'s base feel less like a collection of smooth tubes and more like one animal. I cleaned the webbing between the tentacles, added folds and wrinkles around the body and mantle, pushed the secondary forms further, then started moving into tertiary detail. The biggest change was adding the sucker rows, which immediately gave the underside much more character.',
      noteLabel: 'Day two focus',
      note: 'I kept the same octopus from yesterday and concentrated on transitions, surface structure and the details that make the tentacles read properly.',
      latestHeading: 'Webbing, wrinkles and suckers.',
      latestSummary: 'I pushed the octopus beyond the blockout today: cleaned the webbing, added folds and wrinkles, started smaller surface detail and built sucker rows along the tentacles.',
      facts: ['ZBrush', 'Secondary + tertiary', 'In progress'],
      archiveTitle: 'Webbing, wrinkles and suckers',
      archiveMeta: 'ZBrush • Secondary forms • Tertiary detail • Suckers',
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
      ],
      notes: [
        ['What I worked on', 'I cleaned the webbing and tentacle joins, pushed the secondary forms further, added folds and wrinkles around the body and mantle, and built sucker rows along the underside of the tentacles.'],
        ['What I learned', 'The webbing changes the read of the whole creature. The smaller wrinkles only start to work once those larger transitions feel right, and the suckers need to follow the flow and taper of each tentacle rather than just repeating evenly.'],
        ['What needs work', 'Some of the webbing is still too heavy, the wrinkle detail needs to blend more naturally into the larger forms, and the sucker spacing and scale need another cleanup pass. The mantle and eye area also still need refinement.'],
        ['Next time', 'Refine the sucker rows, clean the webbing again where it still feels thick, keep the detail scale consistent across the mantle and face, and continue the tertiary pass without overworking the surface.']
      ]
    },
    '2026-08-18': {
      day: '01',
      dateLong: '18 August 2026',
      shortDate: '18 Aug',
      navTitle: 'First ZSphere octopus',
      archiveTitle: 'My first ZSphere octopus',
      archiveMeta: 'ZBrush • ZSpheres • Sculpting • Almost 2 hours',
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

  const dotsMarkup = (count) => Array.from({ length: count }, (_, index) =>
    `<button class="replay-dot${index === 0 ? ' is-active' : ''}" data-replay-dot type="button" aria-label="Step ${index + 1}"></button>`
  ).join('');

  const makeReplay = (date) => {
    const entry = entries[date];
    const count = entry.steps.length;
    const first = entry.steps[0];
    return `
      <div class="replay" data-diary-replay data-diary-entry="${date}" tabindex="0">
        <div class="replay-top"><span>Progress replay</span><span>Click the image or drag the timeline</span></div>
        <div class="replay-grid">
          <div class="replay-stage-wrap">
            <div class="replay-stage" data-replay-stage role="img" aria-label="${first.title}. Step 1 of ${count}."></div>
            <span class="replay-hint">Left side back • Right side forward</span>
          </div>
          <div class="replay-copy">
            <span class="replay-count" data-replay-count>01 / ${String(count).padStart(2, '0')}</span>
            <h3 data-replay-title>${first.title}</h3>
            <p data-replay-copy>${first.copy}</p>
            <div class="replay-controls">
              <input class="replay-range" data-replay-range type="range" min="0" max="${count - 1}" value="0" step="1" aria-label="Move through the sculpt progress">
              <div class="replay-dots" style="--replay-step-count:${count}" aria-label="Progress steps">${dotsMarkup(count)}</div>
              <div class="replay-buttons">
                <button data-replay-previous type="button">Previous</button>
                <button data-replay-next type="button">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const makeNotes = (notes) => `
    <div class="diary-notes">
      ${notes.map((note, index) => `<article class="diary-note"><b>${String(index + 1).padStart(2, '0')}</b><h3>${note[0]}</h3><p>${note[1]}</p></article>`).join('')}
    </div>
  `;

  const makeSection = (date, isLatest = false) => {
    const entry = entries[date];
    const section = document.createElement('section');
    section.id = `entry-${date}`;
    section.className = `diary-entry section-shell${isLatest ? ' diary-entry-latest' : ''}`;
    section.innerHTML = `
      <div class="entry-heading">
        <div>
          <p class="eyebrow"><span>${entry.dateLabel}</span> ZBrush</p>
          <h2>${entry.heading}</h2>
        </div>
        <div class="entry-heading-copy">
          <p>${entry.intro}</p>
          <div class="course-note">
            <small>${entry.noteLabel}</small>
            <p>${entry.note}</p>
          </div>
        </div>
      </div>
      ${makeReplay(date)}
      ${makeNotes(entry.notes)}
    `;
    return section;
  };

  const dayOne = document.querySelector('#entry-2026-08-18');
  if (dayOne) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(makeSection('2026-08-21', true));
    fragment.appendChild(makeSection('2026-08-20'));
    fragment.appendChild(makeSection('2026-08-19'));
    dayOne.before(fragment);
  }

  existingReplay.dataset.diaryEntry = '2026-08-18';

  const latestEntry = entries['2026-08-21'];
  const heroEyebrow = document.querySelector('.diary-title .eyebrow');
  if (heroEyebrow) heroEyebrow.innerHTML = `<span>Diary / ${latestEntry.day}</span> ${latestEntry.dateLong}`;

  const latest = document.querySelector('.diary-latest');
  if (latest) {
    const heading = latest.querySelector('h2');
    const summary = latest.querySelector(':scope > p');
    const facts = latest.querySelector('.diary-facts');
    if (heading) heading.textContent = latestEntry.latestHeading;
    if (summary) summary.textContent = latestEntry.latestSummary;
    if (facts) facts.innerHTML = latestEntry.facts.map((fact) => `<span>${fact}</span>`).join('');
  }

  const hero = document.querySelector('.diary-hero');
  if (hero && !document.querySelector('.diary-day-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'diary-day-nav section-shell';
    nav.setAttribute('aria-label', 'Diary entries');
    nav.innerHTML = ['2026-08-21', '2026-08-20', '2026-08-19', '2026-08-18'].map((date, index) => {
      const entry = entries[date];
      return `
        <a class="diary-day-link${index === 0 ? ' is-active' : ''}" data-diary-day-link href="#entry-${date}">
          <small>Day ${entry.day} · ${entry.shortDate}</small>
          <strong>${entry.navTitle}</strong>
          <span aria-hidden="true">↓</span>
        </a>
      `;
    }).join('');
    hero.after(nav);
  }

  const archive = document.querySelector('.diary-archive');
  if (archive) {
    const archiveHeading = archive.querySelector('.archive-heading h2');
    if (archiveHeading) archiveHeading.textContent = 'Four days in.';

    const dayOneArchive = archive.querySelector('a[href="#entry-2026-08-18"]');
    if (dayOneArchive) {
      const fragment = document.createDocumentFragment();
      ['2026-08-21', '2026-08-20', '2026-08-19'].forEach((date) => {
        if (archive.querySelector(`a[href="#entry-${date}"]`)) return;
        const entry = entries[date];
        const link = document.createElement('a');
        link.className = 'archive-entry';
        link.href = `#entry-${date}`;
        link.innerHTML = `<small>${entry.dateLong}</small><div><h3>${entry.archiveTitle}</h3><p>${entry.archiveMeta}</p></div><span aria-hidden="true">↗</span>`;
        fragment.appendChild(link);
      });
      dayOneArchive.before(fragment);
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

    ['entry-2026-08-21', 'entry-2026-08-20', 'entry-2026-08-19', 'entry-2026-08-18'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();