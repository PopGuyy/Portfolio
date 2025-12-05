
const GITHUB_PROFILE_URL = "https://github.com/Popguyy"; // <-- change this

/* ---------------------------
   Utility helpers
   --------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------------------
   Page ready / loader
   --------------------------- */
window.addEventListener('load', () => {
  // fade out loader
  const loader = $('#loader');
  loader.style.transition = 'opacity 350ms ease';
  loader.style.opacity = '0';
  setTimeout(() => loader.remove(), 400);

  // initialize interactive features
  initCanvasParticles();
  initCursorTrail();
  initTyping();
  initTiltEffect();
  initRevealOnScroll();
  initProjectButtons();
  initSmoothScrollButtons();
  setYear();

  // ---------------------------------
  // COOL RESUME DOWNLOAD ANIMATION
  // ---------------------------------
  const resumeBtn = document.getElementById("download-resume");
  const resumeText = resumeBtn.querySelector(".btn-text");
  const pulseRing = resumeBtn.querySelector(".pulse-ring");

  resumeBtn.addEventListener("click", () => {

    // shockwave animation
    resumeBtn.classList.remove("animate");
    void resumeBtn.offsetWidth; // force reflow
    resumeBtn.classList.add("animate");

    // glow during download
    resumeBtn.classList.add("downloading");
    resumeText.textContent = "Downloading...";

    // actual PDF download
    const link = document.createElement("a");
    link.href = "resume.pdf";
    link.download = "Aditya_Resume.pdf";
    link.click();

    // reset button
    setTimeout(() => {
      resumeBtn.classList.remove("downloading");
      resumeText.textContent = "Download Resume";
    }, 1500);
  });
});

/* ---------------------------
   Typing animation for hero subtitle
   --------------------------- */
function initTyping() {
  const el = document.getElementById('typing');
  const lines = [
    "Frontend ✦ Backend ✦ Photography",
    "I build interfaces, capture moments, and automate deployments.",
    "Purple Galaxy Nebula — aesthetic, curvy, smooth."
  ];
  let line = 0, i = 0, forward = true, pause = 1300;

  function tick() {
    const txt = lines[line];
    el.textContent = txt.slice(0, i);
    if (forward) {
      i++;
      if (i > txt.length) {
        forward = false;
        setTimeout(tick, pause);
        return;
      }
    } else {
      i--;
      if (i < 0) {
        forward = true;
        line = (line + 1) % lines.length;
      }
    }
    setTimeout(tick, forward ? 38 : 18);
  }
  tick();
}

/* ---------------------------
   Canvas: particle/starfield background
   --------------------------- */
function initCanvasParticles() {
  const canvas = $('#bg-canvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;

  const stars = [];
  const STAR_COUNT = Math.floor((w * h) / 12000);

  function resetStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.2,
        v: (Math.random() * 0.3 + 0.05) * (0.5 + Math.random()),
        hue: 240 + Math.random() * 80
      });
    }
  }
  resetStars();

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    resetStars();
  }
  window.addEventListener('resize', throttle(resize, 200));

  let t = 0;
  function frame() {
    t += 0.008;
    ctx.clearRect(0, 0, w, h);

    // subtle radial gradient
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(10,4,30,0.12)');
    g.addColorStop(1, 'rgba(1,1,6,0.2)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // draw stars
    for (const s of stars) {
      // move slowly to create parallax
      s.x += Math.cos(t + s.r) * (s.v * 0.4);
      s.y += Math.sin(t * 0.5 + s.r) * (s.v * 0.2);

      // wrap
      if (s.x > w + 20) s.x = -20;
      if (s.x < -20) s.x = w + 20;
      if (s.y > h + 20) s.y = -20;
      if (s.y < -20) s.y = h + 20;

      const alpha = 0.6 + 0.4 * Math.sin((t * 2) + s.r * 7);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // occasional glowing nebula blobs
    if ((Math.sin(t * 0.2) + 1) > 1.9) {
      ctx.beginPath();
      const gx = w * Math.abs(Math.sin(t * 0.13));
      const gy = h * Math.abs(Math.cos(t * 0.11));
      const rg = Math.min(w, h) * 0.6;
      const g2 = ctx.createRadialGradient(gx, gy, 10, gx, gy, rg);
      g2.addColorStop(0, 'rgba(106,0,214,0.12)');
      g2.addColorStop(0.6, 'rgba(70,179,255,0.02)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    }

    requestAnimationFrame(frame);
  }
  frame();
}

/* ---------------------------
   Cursor trail
   --------------------------- */
function initCursorTrail() {
  const root = document.getElementById('cursor-trail');
  if (!root) return;
  const dots = [];
  const MAX_DOTS = 14;

  for (let i = 0; i < MAX_DOTS; i++) {
    const d = document.createElement('div');
    d.className = 'cursor-dot';
    d.style.width = `${6 + i * 0.6}px`;
    d.style.height = `${6 + i * 0.6}px`;
    d.style.opacity = String(0.9 - i * 0.05);
    root.appendChild(d);
    dots.push(d);
  }

  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function animate() {
    let x = mouse.x, y = mouse.y;
    dots.forEach((el, i) => {
      const nextX = x + (parseFloat(el.style.left || 0) - x) * 0.3;
      const nextY = y + (parseFloat(el.style.top || 0) - y) * 0.3;
      el.style.left = `${nextX}px`;
      el.style.top = `${nextY}px`;
      el.style.transform = `translate(-50%,-50%) scale(${1 - i * 0.03})`;
      x = nextX; y = nextY;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------------------------
   3D Tilt on hover (intermediate)
   - Adds subtle rotation based on pointer location
   --------------------------- */
function initTiltEffect() {
  const elements = $$('[data-tilt]');
  elements.forEach(el => {
    el.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width;
      const py = (ev.clientY - r.top) / r.height;
      const rotX = (py - 0.5) * 10; // tilt strength
      const rotY = (px - 0.5) * -10;
      el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
      el.style.boxShadow = `${-rotY}px ${rotX}px 40px rgba(106,0,214,0.08)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
      el.style.boxShadow = '';
    });

    // small press effect
    el.addEventListener('pointerdown', () => {
      el.style.transform += ' scale(0.995)';
    });
    el.addEventListener('pointerup', () => {
      el.style.transform = el.style.transform.replace(' scale(0.995)', '');
    });
  });
}

/* ---------------------------
   Reveal on scroll (IntersectionObserver)
   --------------------------- */
function initRevealOnScroll() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $$('section.reveal').forEach(s => io.observe(s));
}

/* ---------------------------
   Project buttons -> GitHub (supports full URLs or repo names)
   --------------------------- */
function initProjectButtons() {
  const btns = $$('.project-link');

  // helper to detect full URL
  const isFullUrl = (s) => {
    try {
      const u = new URL(s);
      return (u.protocol === 'http:' || u.protocol === 'https:');
    } catch (err) {
      return false;
    }
  };

  // resolves final URL from data-repo (accepts full url or repo name)
  const resolveRepoUrl = (repo) => {
    if (!repo) return GITHUB_PROFILE_URL; // fallback to profile
    repo = String(repo).trim();
    if (isFullUrl(repo)) return repo;
    // If repo looks like user/repo (contains slash) treat as full path on github
    if (repo.includes('/')) {
      // if it already starts with github.com, ensure protocol
      if (/^github\.com/i.test(repo)) {
        return 'https://' + repo.replace(/^\/+/, '');
      }
      return `https://github.com/${repo.replace(/^\/+|\/+$/g, '')}`;
    }
    // otherwise build from configured profile URL
    return `${GITHUB_PROFILE_URL.replace(/\/$/, '')}/${repo}`;
  };

  // click on the inner "View on GitHub" buttons
  btns.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation(); // prevent bubbling to card click
      const card = ev.target.closest('.project-card');
      const repo = card?.dataset?.repo;
      const url = resolveRepoUrl(repo);
      // open in new tab
      window.open(url, '_blank', 'noopener');
    });
  });

  // clicking the whole card should also open the repo
  $$('.project-card').forEach(card => {
    card.addEventListener('click', (ev) => {
      // if user clicked the inner button already, it was already handled and stopped by stopPropagation
      // still guard: if click originated from an element that is a link, do nothing
      if (ev.target.closest('a')) return;

      const repo = card.dataset?.repo;
      const url = resolveRepoUrl(repo);
      if (!url) return;
      window.open(url, '_blank', 'noopener');
    });
  });
}


/* ---------------------------
   Smooth scroll for CTA buttons
   --------------------------- */
function initSmoothScrollButtons() {
  $$('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.scroll;
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------------------------
   Helpers
   --------------------------- */
function throttle(fn, limit = 100) {
  let inThrottle;
  return function () {
    const args = arguments;
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ---------------------------
   Set Year
   --------------------------- */
function setYear() {
  $('#year') && ($('#year').textContent = new Date().getFullYear());
}

/* ---------------------------
   Optional: contact form (basic demonstration)
   --------------------------- */
document.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'contact-form') {
    e.preventDefault();
    // Simulate send
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending...';
    setTimeout(() => {
      btn.disabled = false; btn.textContent = 'Send Message';
      alert('Thanks! Message simulated as sent (hook up real mail endpoint to send).');
      e.target.reset();
    }, 1200);
  }
});
