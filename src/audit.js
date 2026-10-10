import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-unfold]').forEach((panel) => {
  const video = panel.querySelector('video');

  // Play / pause on visibility
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (reduce) return;
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.25 });
  io.observe(panel);

  if (reduce) {
    gsap.set(panel, { clipPath: 'inset(0% 0% 0% 0%)' });
    return;
  }

  // The unfold: clip-path opens as the panel travels through the viewport,
  // video counter-scales so the frame feels like it blooms open.
  gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      start: 'top 95%',
      end: 'top 15%',
      scrub: 1,
    },
  })
    .fromTo(panel,
      { clipPath: 'inset(38% 26% 38% 26%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
    .fromTo(video,
      { scale: 1.18 },
      { scale: 1, ease: 'none' }, 0);

  // Gentle parallax while the open panel scrolls through
  gsap.fromTo(video, { yPercent: -6 }, {
    yPercent: 6,
    ease: 'none',
    scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});

// Copy blocks rise in
gsap.utils.toArray('.copy > *').forEach((el) => {
  if (reduce) return;
  gsap.from(el, {
    y: 44, opacity: 0, ease: 'power2.out', duration: 0.9,
    scrollTrigger: { trigger: el, start: 'top 88%' },
  });
});
