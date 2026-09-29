const formatStep = n => new Intl.NumberFormat(document.documentElement.lang === "ar" ? "ar-KW" : "en", { minimumIntegerDigits: 2, useGrouping: false }).format(n);
let currentStep = 0;
const stage = document.getElementById('scenario-stage');
const panels = [...stage.querySelectorAll('.scenario-panel')];
const buttons = [...document.querySelectorAll('.scenario-step')];
const progress = document.getElementById('scenario-progress');
const next = document.getElementById('next-step');
function renderStep(index) {
  currentStep = index;
  buttons.forEach((button, i) => { button.querySelector("b").textContent = formatStep(i + 1); });
  panels.forEach((panel, i) => { panel.hidden = i !== index; });
  stage.style.animation = 'none';
  stage.offsetHeight;
  stage.style.animation = '';
  buttons.forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-pressed', i === index ? 'true' : 'false'); });
  next.innerHTML = index === panels.length - 1 ? `${window.siteTranslate('Start again')} <span aria-hidden="true">↺</span>` : `${window.siteTranslate('Next step')} <span aria-hidden="true">→</span>`;
  progress.textContent = document.documentElement.lang === 'ar' ? `الخطوة ${formatStep(index + 1)} من ${formatStep(panels.length)}` : `STEP ${formatStep(index + 1)} OF ${formatStep(panels.length)}`;
}
buttons.forEach((button, index) => button.addEventListener('click', () => renderStep(index)));
next.addEventListener('click', () => renderStep((currentStep + 1) % panels.length));
renderStep(0);
document.addEventListener("site-language-change", () => renderStep(currentStep));
const mobileMenu = document.querySelector('.mobile-menu');
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileMenu.open = false; }));
mobileMenu.addEventListener('keydown', event => { if (event.key === 'Escape') { mobileMenu.open = false; mobileMenu.querySelector('summary').focus(); } });
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }); }, {threshold:.1,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else { document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view')); }
document.getElementById('year').textContent = new Date().getFullYear();

// The lens leads one deliberate inspection path; pointer movement never steers the scene.
const tour = document.querySelector('.qa-tour');
if (tour && !document.querySelector(".locked-screen")) {
  const visual = tour.closest('.hero-visual');
  const laptop = visual.querySelector('.qa-laptop-anchor');
  const lens = tour.querySelector('.qa-lens');
  const readout = tour.querySelector('.qa-lens-readout');
  const note = document.getElementById('hero-evidence-note');
  const kicker = note.querySelector('.qa-tour-kicker');
  const title = note.querySelector('strong');
  const detail = note.querySelector('.qa-tour-detail');
  const dots = [...tour.querySelectorAll('.qa-tour-dot')];
  const pause = tour.querySelector('.qa-tour-pause');
  const steps = [
    { label:'01 / OVERVIEW', title:'Start with the evidence', detail:'The workspace holds 165.000 KWD in transactions.', x:48, y:25, value:'165.000' },
    { label:'02 / TREND', title:'Inspect the change', detail:'The chart marks a 75.000 KWD transaction peak.', x:60, y:40, value:'75.000' },
    { label:'03 / INVESTIGATION', title:'Trace the refund', detail:'Trace the invoice state after a 5.000 KWD partial refund.', x:50, y:63, value:'INV-001' },
    { label:'04 / FINDING', title:'Mismatch found', detail:'A 5.000 KWD refund incorrectly appears as an amount due. Open the case study.', x:63, y:65, value:'5.000 KWD', issue:true }
  ];
  let active = 0;
  let timer;
  let findingTimer;
  let paused = false;
  const positionLens = () => {
    const bounds = laptop.getBoundingClientRect();
    const parent = visual.getBoundingClientRect();
    const step = steps[active];
    lens.style.setProperty('--lens-x', `${bounds.left-parent.left+bounds.width*step.x/100}px`);
    lens.style.setProperty('--lens-y', `${bounds.top-parent.top+bounds.height*step.y/100}px`);
  };
  const setStep = (index, announce = true) => {
    active = (index + steps.length) % steps.length;
    const step = steps[active];
    positionLens();
    readout.textContent = step.issue ? window.siteTranslate(step.value) : step.value;
    window.dispatchEvent(new CustomEvent('qa-tour-step',{detail:{index:active}}));
    window.clearTimeout(findingTimer);
    tour.classList.remove('has-finding');
    if (step.issue) {
      if (reducedMotion) tour.classList.add('has-finding');
      else findingTimer = window.setTimeout(() => tour.classList.add('has-finding'), 740);
    }
    note.setAttribute('aria-live', announce ? 'polite' : 'off');
    kicker.textContent = window.siteTranslate(step.label);
    title.textContent = window.siteTranslate(step.title);
    detail.textContent = window.siteTranslate(step.detail);
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-label', `${window.siteTranslate('Step')} ${formatStep(i + 1)}: ${window.siteTranslate(steps[i].title)}`);
      if (i === active) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    if (announce) tour.dataset.interacted = 'true';
  };
  const schedule = (delay = 2200) => { clearTimeout(timer); if (!paused && !reducedMotion && !tour.contains(document.activeElement)) timer = window.setTimeout(advance, delay); };
  const choose = index => { setStep(index); schedule(); };
  const advance = () => {
    if (paused || reducedMotion) return;
    setStep(active + 1, false);
    schedule(active === steps.length - 1 ? 3200 : 2400);
  };
  tour.addEventListener('focusin', () => { clearTimeout(timer); });
  tour.addEventListener('focusout', event => { if (!tour.contains(event.relatedTarget)) schedule(3200); });
  const visibility = new IntersectionObserver(entries => { if (entries[0].isIntersecting) schedule(1900); else clearTimeout(timer); }, { threshold:.15 });
  visibility.observe(visual);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else schedule(1900); });
  pause.addEventListener('click', () => {
    paused = !paused;
    clearTimeout(timer);
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', window.siteTranslate(paused ? 'Resume automatic investigation' : 'Pause automatic investigation'));
    if (!paused) schedule();
  });
  tour.querySelector('.qa-tour-prev').addEventListener('click', () => choose(active - 1));
  tour.querySelector('.qa-tour-next').addEventListener('click', () => choose(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => choose(i)));
  let touchX = null;
  visual.addEventListener('touchstart', event => { touchX = event.changedTouches[0]?.clientX ?? null; }, { passive:true });
  visual.addEventListener('touchend', event => {
    if (touchX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
    touchX = null;
    if (Math.abs(delta) > 45) choose(active + (delta < 0 ? 1 : -1));
  }, { passive:true });
  document.addEventListener("site-language-change", () => { setStep(active, false); pause.setAttribute("aria-label", window.siteTranslate(paused ? "Resume automatic investigation" : "Pause automatic investigation")); });
  setStep(0, false);
  new ResizeObserver(positionLens).observe(laptop);
  if (!reducedMotion) schedule(3300);
}

const story = document.getElementById('story');
const chapters = [...story.querySelectorAll('.story-chapter')];
const storyCounter = story.querySelector('.story-counter-current');
const animatedStory = window.matchMedia('(prefers-reduced-motion: no-preference)');
let storyFrame = 0;
function updateStory() {
  storyFrame = 0;
  story.querySelector('.story-counter-total').textContent = formatStep(3);
  if (!animatedStory.matches || reducedMotion) {
    story.classList.remove('phase-1', 'phase-2');
    story.classList.add('phase-0');
    chapters.forEach(chapter => chapter.removeAttribute('aria-hidden'));
    return;
  }
  const bounds = story.getBoundingClientRect();
  const travel = Math.max(1, bounds.height - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -bounds.top / travel));
  const phase = progress < .32 ? 0 : progress < .66 ? 1 : 2;
  story.style.setProperty('--story-progress', progress.toFixed(3));
  story.classList.remove('phase-0', 'phase-1', 'phase-2');
  story.classList.add(`phase-${phase}`);
  storyCounter.textContent = formatStep(phase + 1);
  chapters.forEach((chapter, index) => chapter.setAttribute('aria-hidden', index === phase ? 'false' : 'true'));
}
function scheduleStory() {
  if (!storyFrame) storyFrame = requestAnimationFrame(updateStory);
}
window.addEventListener('scroll', scheduleStory, { passive: true });
window.addEventListener('resize', scheduleStory);
animatedStory.addEventListener?.('change', scheduleStory);
updateStory();
document.addEventListener("site-language-change", updateStory);

const aboutSection = document.getElementById('about');
const aboutPortrait = document.getElementById('about-portrait');
const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (!reducedMotion) {
  aboutSection.addEventListener('pointermove', event => {
    if (!canTrackPointer.matches) return;
    const rect = aboutPortrait.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = Math.max(-1, Math.min(1, (event.clientX - centerX) / (window.innerWidth / 2)));
    const y = Math.max(-1, Math.min(1, (event.clientY - centerY) / (window.innerHeight / 2)));
    aboutPortrait.style.setProperty('--rotate-y', `${(x * 4).toFixed(2)}deg`);
    aboutPortrait.style.setProperty('--rotate-x', `${(-y * 3).toFixed(2)}deg`);
    aboutPortrait.style.setProperty('--offset-x', `${(x * 8).toFixed(2)}px`);
    aboutPortrait.style.setProperty('--offset-y', `${(y * 6).toFixed(2)}px`);
  }, { passive: true });
  aboutSection.addEventListener('pointerleave', () => {
    ['--rotate-y','--rotate-x','--offset-x','--offset-y'].forEach(prop => aboutPortrait.style.removeProperty(prop));
  });
}

// Signature section headings type themselves once when they enter the viewport.
(() => {
  const targets = [...document.querySelectorAll('.typewriter-target')];
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const jobs = new Map();

  const visibleText = target => {
    const english = target.dataset.typewriterText || '';
    return typeof window.siteTranslate === 'function' ? window.siteTranslate(english) : english;
  };

  const clearJob = target => {
    const job = jobs.get(target);
    if (!job) return;
    window.clearTimeout(job.startTimer);
    window.clearTimeout(job.typeTimer);
    window.clearTimeout(job.cursorTimer);
    jobs.delete(target);
  };

  const buildStableTarget = (target, text) => {
    target.replaceChildren();

    // The hidden reserve keeps the final line width/height in layout throughout typing.
    // The live layer sits in the same grid cell, so characters can type without moving
    // nearby content or changing the final responsive wrapping.
    const reserve = document.createElement('span');
    reserve.className = 'typewriter-reserve';
    reserve.setAttribute('aria-hidden', 'true');
    reserve.textContent = text;

    const live = document.createElement('span');
    live.className = 'typewriter-live';
    live.setAttribute('aria-hidden', 'true');

    const accessible = document.createElement('span');
    accessible.className = 'typewriter-a11y';
    accessible.textContent = text;

    target.append(reserve, live, accessible);
    return live;
  };

  const renderWaiting = target => {
    clearJob(target);
    const text = visibleText(target);
    buildStableTarget(target, text);
    target.classList.remove('is-typing', 'is-complete', 'is-cursor-done');
    target.classList.add('is-waiting');
  };

  const renderFull = target => {
    clearJob(target);
    const text = visibleText(target);
    const live = buildStableTarget(target, text);
    live.textContent = text;
    target.classList.remove('is-waiting', 'is-typing', 'is-complete', 'is-cursor-done');
  };

  const typeTarget = target => {
    if (prefersReducedMotion) {
      renderFull(target);
      target.dataset.typewriterPlayed = 'true';
      return;
    }
    if (target.dataset.typewriterPlayed === 'true') return;

    clearJob(target);
    const text = visibleText(target);
    const speed = 62;
    const startDelay = 240;
    const cursorHold = 560;
    let index = 0;

    target.dataset.typewriterPlayed = 'true';
    target.classList.remove('is-waiting', 'is-complete', 'is-cursor-done');
    target.classList.add('is-typing');

    const live = buildStableTarget(target, text);
    const output = document.createTextNode('');
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';
    live.append(output, cursor);

    const job = { startTimer: 0, typeTimer: 0, cursorTimer: 0 };
    jobs.set(target, job);

    const tick = () => {
      index += 1;
      output.nodeValue = text.slice(0, index);
      if (index < text.length) {
        job.typeTimer = window.setTimeout(tick, speed);
      } else {
        target.classList.remove('is-typing');
        target.classList.add('is-complete');
        job.cursorTimer = window.setTimeout(() => {
          target.classList.remove('is-complete');
          target.classList.add('is-cursor-done');
          jobs.delete(target);
        }, cursorHold);
      }
    };

    job.startTimer = window.setTimeout(tick, startDelay);
  };

  targets.forEach(renderWaiting);

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(target => {
      renderFull(target);
      target.dataset.typewriterPlayed = 'true';
    });
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        typeTarget(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.38, rootMargin: '0px 0px -12% 0px' });
    targets.forEach(target => observer.observe(target));
  }

  document.addEventListener('site-language-change', () => {
    targets.forEach(target => {
      // A language switch updates the text but must not replay a heading that already typed.
      if (target.dataset.typewriterPlayed === 'true') renderFull(target);
      else renderWaiting(target);
    });
  });
})();
