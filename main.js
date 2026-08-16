const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => observer.observe(item));

const parallaxTarget = document.querySelector('[data-parallax]');

if (parallaxTarget && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 14;
    parallaxTarget.style.translate = `${x}px ${y}px`;
  });
}
