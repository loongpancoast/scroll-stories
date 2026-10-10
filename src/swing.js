import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const video = document.getElementById('swingVid');
const framecount = document.getElementById('framecount');
const groups = ['g1', 'g2', 'g3', 'g4'].map((id) => document.getElementById(id));
const cards = ['mk1', 'mk2', 'mk3', 'mk4'].map((id) => document.getElementById(id));

// Prep draw strokes
document.querySelectorAll('svg.marks .draw').forEach((el) => {
  el.style.strokeDasharray = 1;
  el.style.strokeDashoffset = 1;
});

let dur = 0, started = false;
video.addEventListener('loadedmetadata', () => { dur = video.duration || 0; init(); });
setTimeout(() => { if (!started) { dur = video.duration || 10; init(); } }, 4000);

function init() {
  if (started) return;
  started = true;
  video.pause();

  const showCard = (el, at, hold) => {
    tl.fromTo(el, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, ease: 'none', duration: 0.06 }, at);
    tl.to(el, { autoAlpha: 0, y: -40, ease: 'none', duration: 0.06 }, at + hold);
  };
  const drawGroup = (g, at) => {
    tl.to(g, { opacity: 1, ease: 'none', duration: 0.02 }, at);
    g.querySelectorAll('.draw').forEach((el, i) => {
      tl.to(el, { strokeDashoffset: 0, ease: 'none', duration: 0.05 }, at + 0.015 + i * 0.02);
    });
    tl.to(g, { opacity: 0, ease: 'none', duration: 0.04 }, at + 0.19);
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#tele-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        if (dur) {
          const t = p * dur;
          if (Math.abs(video.currentTime - t) > 0.04) video.currentTime = t;
          framecount.textContent = 'FRAME ' + String(Math.floor(p * dur * 24)).padStart(4, '0');
        }
      },
    },
  });

  if (reduce) {
    gsap.set(cards[0], { autoAlpha: 1 });
    return;
  }

  // Four marks across the scrub
  const marks = [
    { g: groups[0], c: cards[0], at: 0.03 },
    { g: groups[1], c: cards[1], at: 0.28 },
    { g: groups[2], c: cards[2], at: 0.53 },
    { g: groups[3], c: cards[3], at: 0.76 },
  ];
  marks.forEach(({ g, c, at }) => {
    drawGroup(g, at);
    showCard(c, at + 0.01, 0.17);
  });
}
