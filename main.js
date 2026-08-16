const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const startDateUTC = Date.UTC(2026, 5, 28);
const now = new Date();
const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const learningDays = Math.max(1, Math.floor((todayUTC - startDateUTC) / 86400000) + 1);

document.querySelectorAll('[data-learning-days]').forEach((item) => {
  item.textContent = learningDays.toLocaleString();
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const toolStage = document.querySelector('[data-tool-stage]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (toolStage && !reduceMotion) {
  toolStage.addEventListener('pointermove', (event) => {
    const rect = toolStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    toolStage.style.transform = `rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg)`;
  });

  toolStage.addEventListener('pointerleave', () => {
    toolStage.style.transform = '';
  });
}

const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('[data-form-status]');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    if (formStatus) {
      formStatus.textContent = 'The form design is ready — private message delivery still needs to be connected.';
    }
  });
}

document.querySelectorAll('.social-link.is-disabled').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});
