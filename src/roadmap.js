import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const vidA = document.getElementById('vidA');
const vidB = document.getElementById('vidB');
const acts = [document.getElementById('act1'), document.getElementById('act2'), document.getElementById('act3')];
const barTop = document.getElementById('barTop');
const barBot = document.getElementById('barBot');
const railFill = document.getElementById('railFill');
const timecode = document.getElementById('timecode');

let durA = 0, durB = 0, ready = 0;
function onReady() {
  ready++;
  if (ready === 2) init();
}
vidA.addEventListener('loadedmetadata', () => { durA = vidA.duration || 0; onReady(); });
vidB.addEventListener('loadedmetadata', () => { durB = vidB.duration || 0; onReady(); });
// Fallback if metadata is slow: start anyway after 4s
setTimeout(() => { if (ready < 2) { durA = vidA.duration || 8; durB = vidB.duration || 8; init(); } }, 4000);

let inited = false;
function init() {
  if (inited) return;
  inited = true;
  vidA.pause(); vidB.pause();

  const fmt = (s) => {
    s = Math.max(0, s);
    const f = Math.floor((s % 1) * 24);
    const ss = Math.floor(s % 60), mm = Math.floor((s / 60) % 60), hh = Math.floor(s / 3600);
    const p = (n) => String(n).padStart(2, '0');
    return `${p(hh)}:${p(mm)}:${p(ss)}:${p(f)}`;
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#reel-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        // Scrub both films: A owns 0 -> 0.62, B owns 0.38 -> 1, crossfade 0.42 -> 0.58
        if (durA) { const t = gsap.utils.clamp(0, durA, (p / 0.62) * durA); if (Math.abs(vidA.currentTime - t) > 0.05) vidA.currentTime = t; }
        if (durB) { const t = gsap.utils.clamp(0, durB, ((p - 0.38) / 0.62) * durB); if (Math.abs(vidB.currentTime - t) > 0.05) vidB.currentTime = t; }
        railFill.style.transform = `scaleX(${p})`;
        timecode.textContent = fmt(p * (durA + durB));
      },
    },
  });

  if (reduce) {
    // Static fallback: show act 1, films at first frame
    gsap.set(acts[0], { autoAlpha: 1 });
    return;
  }

  // Film crossfade
  tl.to('#vidB', { opacity: 1, ease: 'none', duration: 0.16 }, 0.42);

  // Letterbox breathing: bars close slightly between acts
  tl.to([barTop, barBot], { height: '16dvh', ease: 'none', duration: 0.05 }, 0.30);
  tl.to([barTop, barBot], { height: '12dvh', ease: 'none', duration: 0.05 }, 0.36);
  tl.to([barTop, barBot], { height: '16dvh', ease: 'none', duration: 0.05 }, 0.63);
  tl.to([barTop, barBot], { height: '12dvh', ease: 'none', duration: 0.05 }, 0.69);

  // Acts: each holds ~1/3 of the reel
  const actIn = (el, at) => {
    tl.fromTo(el, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, ease: 'none', duration: 0.08 }, at);
    tl.to(el, { autoAlpha: 0, y: -60, ease: 'none', duration: 0.08 }, at + 0.20);
  };
  actIn(acts[0], 0.02);
  actIn(acts[1], 0.36);
  // Final act stays on screen into the outro
  tl.fromTo(acts[2], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, ease: 'none', duration: 0.08 }, 0.70);
  tl.to(acts[2], { autoAlpha: 0, y: -40, ease: 'none', duration: 0.06 }, 0.94);
}
