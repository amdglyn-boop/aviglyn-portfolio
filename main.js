const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// A genuine live counter from the first day of Avi's 3D journey.
const learningStart = Date.UTC(2026, 5, 28, 0, 0, 0);
const counterNodes = [...document.querySelectorAll('[data-counter]')];
let previousCounter = {};

function updateLearningClock() {
  const elapsed = Math.max(0, Date.now() - learningStart);
  const totalSeconds = Math.floor(elapsed / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };

  counterNodes.forEach((node) => {
    const key = node.dataset.counter;
    const digits = key === 'days' ? 3 : 2;
    const next = String(values[key]).padStart(digits, '0');
    if (node.textContent !== next) {
      node.textContent = next;
      if (previousCounter[key] !== undefined && !reduceMotion) {
        node.classList.remove('tick');
        void node.offsetWidth;
        node.classList.add('tick');
        window.setTimeout(() => node.classList.remove('tick'), 300);
      }
    }
  });

  previousCounter = values;
  const dayProgress = ((elapsed % 86400000) / 86400000) * 100;
  const track = document.querySelector('[data-day-progress]');
  const marker = document.querySelector('[data-progress-marker]');
  if (track) track.style.width = `${dayProgress}%`;
  if (marker) marker.style.left = `${dayProgress}%`;
}

updateLearningClock();
window.setInterval(updateLearningClock, 1000);

// Scroll progress and a header that gets out of the way when moving down.
const progress = document.querySelector('[data-scroll-progress]');
const header = document.querySelector('[data-header]');
let previousScroll = window.scrollY;
let scrollTicking = false;

function updateScrollUI() {
  const current = window.scrollY;
  const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if (progress) progress.style.transform = `scaleX(${Math.min(1, current / available)})`;
  if (header) {
    header.classList.toggle('is-scrolled', current > 35);
    header.classList.toggle('is-hidden', current > previousScroll && current > 260);
  }
  previousScroll = current;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

// Reveal sections only when they enter the frame.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// A soft cursor light and restrained magnetic controls on desktop.
const cursorAura = document.querySelector('[data-cursor-aura]');
if (cursorAura && finePointer && !reduceMotion) {
  let auraX = window.innerWidth / 2;
  let auraY = window.innerHeight / 2;
  let targetX = auraX;
  let targetY = auraY;
  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  }, { passive: true });
  const moveAura = () => {
    auraX += (targetX - auraX) * .12;
    auraY += (targetY - auraY) * .12;
    cursorAura.style.transform = `translate3d(${auraX - 170}px, ${auraY - 170}px, 0)`;
    requestAnimationFrame(moveAura);
  };
  moveAura();
}

if (finePointer && !reduceMotion) {
  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--mx', `${(event.clientX - rect.left - rect.width / 2) * .09}px`);
      button.style.setProperty('--my', `${(event.clientY - rect.top - rect.height / 2) * .14}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--mx', '0px');
      button.style.setProperty('--my', '0px');
    });
  });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(1100px) rotateX(${y * -3.5}deg) rotateY(${x * 4.5}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { context, width: rect.width, height: rect.height, dpr };
}

// Interactive generative sculpture: a rotating point mesh that responds to the pointer.
const sculptureCanvas = document.querySelector('[data-sculpture-canvas]');
const sculptureStage = document.querySelector('[data-sculpture-stage]');

if (sculptureCanvas && sculptureStage) {
  const count = 185;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points = Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    let x = Math.cos(theta) * radius;
    let z = Math.sin(theta) * radius;
    const upper = y > .25;
    const lower = y < -.32;
    const width = upper ? .67 : lower ? 1.08 + (-y - .32) * .55 : .78;
    x *= width;
    z *= .78 + (1 - Math.abs(y)) * .08;
    const shapedY = y * (upper ? 1.12 : 1.28);
    return { x, y: shapedY, z, seed: Math.random() * Math.PI * 2 };
  });

  let pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  let sculptureVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { sculptureVisible = entry.isIntersecting; }, { rootMargin: '150px' }).observe(sculptureStage);
  }
  sculptureStage.addEventListener('pointermove', (event) => {
    const rect = sculptureStage.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.ty = ((event.clientY - rect.top) / rect.height - .5) * 2;
    pointer.active = true;
  });
  sculptureStage.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.active = false;
  });

  function drawSculpture(time = 0) {
    if (!sculptureVisible || document.hidden) {
      if (!reduceMotion) requestAnimationFrame(drawSculpture);
      return;
    }
    const { context: ctx, width, height } = fitCanvas(sculptureCanvas);
    ctx.clearRect(0, 0, width, height);
    pointer.x += (pointer.tx - pointer.x) * .045;
    pointer.y += (pointer.ty - pointer.y) * .045;

    const timeSlow = time * .00025;
    const angleY = timeSlow + pointer.x * .34;
    const angleX = -.08 + pointer.y * -.18 + Math.sin(time * .00017) * .035;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const baseScale = Math.min(width, height) * .28;
    const projected = points.map((point) => {
      const breath = 1 + Math.sin(time * .0013 + point.seed) * .018;
      const px = point.x * breath;
      const py = point.y * breath;
      const pz = point.z * breath;
      const rx = px * cosY - pz * sinY;
      const rz = px * sinY + pz * cosY;
      const ry = py * cosX - rz * sinX;
      const finalZ = py * sinX + rz * cosX;
      const perspective = 1 / (1.85 - finalZ * .22);
      let screenX = width / 2 + rx * baseScale * perspective * 1.62;
      let screenY = height / 2 - ry * baseScale * perspective * 1.62;
      if (pointer.active) {
        const cursorX = width * (.5 + pointer.x * .5);
        const cursorY = height * (.5 + pointer.y * .5);
        const dx = screenX - cursorX;
        const dy = screenY - cursorY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / (Math.min(width, height) * .26));
        if (distance > 0) {
          screenX += (dx / distance) * influence * 26;
          screenY += (dy / distance) * influence * 26;
        }
      }
      return { x: screenX, y: screenY, z: finalZ, source: point };
    });

    ctx.lineWidth = .65;
    for (let i = 0; i < projected.length; i += 1) {
      const a = projected[i];
      for (let j = i + 1; j < projected.length; j += 1) {
        const b = projected[j];
        const dx = a.source.x - b.source.x;
        const dy = a.source.y - b.source.y;
        const dz = a.source.z - b.source.z;
        const distance = dx * dx + dy * dy + dz * dz;
        if (distance < .095) {
          const depth = Math.max(0, Math.min(1, (a.z + b.z + 2) / 4));
          ctx.strokeStyle = `rgba(190, 231, 177, ${.035 + depth * .18})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    projected.sort((a, b) => a.z - b.z).forEach((point, index) => {
      const depth = (point.z + 1.4) / 2.8;
      const highlight = index % 23 === 0;
      ctx.beginPath();
      ctx.arc(point.x, point.y, highlight ? 2.2 : Math.max(.45, 1.25 * depth), 0, Math.PI * 2);
      ctx.fillStyle = highlight ? 'rgba(200,255,77,.92)' : `rgba(228,242,217,${.16 + depth * .62})`;
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(drawSculpture);
  }
  drawSculpture();
}

// Small live studies keep project placeholders moving until real artwork replaces them.
const projectCanvases = [...document.querySelectorAll('[data-project-canvas]')];
const visibleProjectCanvases = new Set(projectCanvases);

if ('IntersectionObserver' in window && !reduceMotion) {
  const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleProjectCanvases.add(entry.target);
      else visibleProjectCanvases.delete(entry.target);
    });
  }, { rootMargin: '120px' });
  projectCanvases.forEach((canvas) => canvasObserver.observe(canvas));
}

function drawAnatomy(ctx, w, h, time) {
  const cx = w * .5;
  const cy = h * .5;
  ctx.save();
  ctx.translate(cx, cy);
  for (let ring = 0; ring < 18; ring += 1) {
    const progress = ring / 17;
    const rx = w * (.08 + progress * .27);
    const ry = h * (.1 + progress * .31);
    ctx.beginPath();
    for (let i = 0; i <= 90; i += 1) {
      const angle = (i / 90) * Math.PI * 2;
      const ripple = Math.sin(angle * 3 + time * .0015 + ring * .45) * (2 + progress * 4);
      const pinch = 1 - Math.max(0, Math.sin(angle)) * .13;
      const x = Math.cos(angle) * (rx + ripple) * pinch;
      const y = Math.sin(angle) * (ry + ripple) + Math.sin(angle * 2 + time * .001) * 6;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(200,255,77,${.035 + progress * .19})`;
    ctx.lineWidth = progress > .8 ? 1 : .6;
    ctx.stroke();
  }
  ctx.restore();
}

function drawRig(ctx, w, h, time) {
  const swing = Math.sin(time * .0012);
  const breathe = Math.sin(time * .0018) * 5;
  const joints = {
    head: [w * .51, h * .18 + breathe], neck: [w * .5, h * .28], chest: [w * .5, h * .39], pelvis: [w * .5, h * .58],
    lHand: [w * (.25 - swing * .035), h * .48], rHand: [w * (.75 - swing * .035), h * .42],
    lElbow: [w * (.36 - swing * .02), h * .37], rElbow: [w * (.64 - swing * .02), h * .35],
    lKnee: [w * (.42 + swing * .025), h * .75], rKnee: [w * (.59 + swing * .025), h * .75],
    lFoot: [w * (.36 + swing * .04), h * .91], rFoot: [w * (.65 + swing * .04), h * .91]
  };
  const bones = [['head','neck'],['neck','chest'],['chest','pelvis'],['chest','lElbow'],['lElbow','lHand'],['chest','rElbow'],['rElbow','rHand'],['pelvis','lKnee'],['lKnee','lFoot'],['pelvis','rKnee'],['rKnee','rFoot']];
  ctx.lineWidth = 1;
  bones.forEach(([a,b], index) => {
    const grad = ctx.createLinearGradient(joints[a][0],joints[a][1],joints[b][0],joints[b][1]);
    grad.addColorStop(0,'rgba(101,229,209,.25)');
    grad.addColorStop(1,'rgba(200,255,77,.8)');
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(...joints[a]); ctx.lineTo(...joints[b]); ctx.stroke();
    if (index % 2 === 0) {
      ctx.strokeStyle = 'rgba(101,229,209,.12)';
      ctx.beginPath(); ctx.arc(joints[b][0],joints[b][1],18 + Math.sin(time*.002+index)*3,0,Math.PI*2); ctx.stroke();
    }
  });
  Object.values(joints).forEach(([x,y], index) => {
    ctx.beginPath(); ctx.arc(x,y,index === 0 ? 11 : 4,0,Math.PI*2);
    ctx.fillStyle = index === 0 ? 'rgba(200,255,77,.12)' : '#c8ff4d'; ctx.fill();
  });
}

function drawWorld(ctx, w, h, time) {
  const horizon = h * .54;
  const offset = (time * .025) % 40;
  ctx.strokeStyle = 'rgba(200,255,77,.16)';
  ctx.lineWidth = .7;
  for (let i = -12; i <= 12; i += 1) {
    ctx.beginPath(); ctx.moveTo(w/2,horizon); ctx.lineTo(w/2 + i*w*.12,h); ctx.stroke();
  }
  for (let y = horizon; y < h + 30; y += 24) {
    const depth = (y - horizon + offset) / (h - horizon);
    const lineY = horizon + depth * depth * (h - horizon);
    ctx.globalAlpha = Math.min(1, depth + .08);
    ctx.beginPath(); ctx.moveTo(0,lineY); ctx.lineTo(w,lineY); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const sunX = w * .68 + Math.sin(time * .00035) * w * .03;
  const sunY = h * .29;
  const glow = ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,w*.19);
  glow.addColorStop(0,'rgba(255,116,72,.42)'); glow.addColorStop(.35,'rgba(255,116,72,.1)'); glow.addColorStop(1,'rgba(255,116,72,0)');
  ctx.fillStyle = glow; ctx.fillRect(0,0,w,horizon);
  ctx.beginPath(); ctx.arc(sunX,sunY,w*.055,0,Math.PI*2); ctx.fillStyle='rgba(255,116,72,.88)'; ctx.fill();
  ctx.strokeStyle='rgba(241,243,233,.28)';
  ctx.beginPath(); ctx.moveTo(w*.15,horizon); ctx.lineTo(w*.34,h*.39); ctx.lineTo(w*.45,horizon); ctx.lineTo(w*.58,h*.43); ctx.lineTo(w*.78,horizon); ctx.stroke();
}

function drawNext(ctx, w, h, time) {
  const cx = w / 2;
  const cy = h / 2;
  for (let i = 0; i < 34; i += 1) {
    const angle = i * .71 + time * .00022 * (i % 2 ? 1 : -1);
    const radius = w * (.09 + (i % 9) * .027);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 1.35;
    ctx.beginPath(); ctx.arc(x,y,(i%5===0?2.2:1),0,Math.PI*2);
    ctx.fillStyle = i % 6 === 0 ? 'rgba(255,116,72,.9)' : 'rgba(241,243,233,.36)'; ctx.fill();
  }
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(Math.sin(time*.0005)*.08);
  ctx.font = `700 ${Math.max(70,w*.24)}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.strokeStyle='rgba(255,116,72,.6)'; ctx.lineWidth=1; ctx.strokeText('?',0,0);
  ctx.fillStyle='rgba(255,255,255,.025)'; ctx.fillText('?',0,0); ctx.restore();
}

if (projectCanvases.length) {
  const drawProjects = (time = 0) => {
    visibleProjectCanvases.forEach((canvas) => {
      if (document.hidden) return;
      const { context, width, height } = fitCanvas(canvas);
      context.clearRect(0,0,width,height);
      const kind = canvas.dataset.projectCanvas;
      if (kind === 'anatomy') drawAnatomy(context,width,height,time);
      if (kind === 'rig') drawRig(context,width,height,time);
      if (kind === 'world') drawWorld(context,width,height,time);
      if (kind === 'next') drawNext(context,width,height,time);
    });
    if (!reduceMotion) requestAnimationFrame(drawProjects);
  };
  drawProjects();
}

const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('[data-form-status]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    if (formStatus) {
      formStatus.textContent = 'Form works. Delivery is the final connection.';
      formStatus.classList.add('success');
    }
  });
}
