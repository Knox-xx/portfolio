/**
 * Knox Portfolio — main.js
 * Strictly follows design-dna SKILL.md interaction specs.
 * Vanilla ES6+, no dependencies.
 */

'use strict';

/* ─────────────────────────────────────────────
   1 · SCROLL PROGRESS BAR  (design-dna §3.10)
───────────────────────────────────────────── */
const progressBar = document.getElementById('progress');

function updateProgress() {
  const scrollable = document.body.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = pct + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });

/* ─────────────────────────────────────────────
   2 · CURSOR SPOTLIGHT  (design-dna §3.11)
───────────────────────────────────────────── */
const spotlight = document.getElementById('spotlight');

window.addEventListener('pointermove', (e) => {
  spotlight.style.setProperty('--cx', e.clientX);
  spotlight.style.setProperty('--cy', e.clientY);
}, { passive: true });

/* ─────────────────────────────────────────────
   3 · SCROLL-REVEAL (IntersectionObserver)  (design-dna §3.2)
───────────────────────────────────────────── */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target); // one-shot
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.rv, .stg').forEach((el) => io.observe(el));

/* ─────────────────────────────────────────────
   4 · 3-D TILT  (design-dna §3.5)
───────────────────────────────────────────── */
document.querySelectorAll('.tilt').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform =
      `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });

  el.addEventListener('pointerleave', () => {
    el.style.transform = '';
  });
});

/* ─────────────────────────────────────────────
   5 · BARCODE SVG GENERATOR  (design-dna §4.1)
───────────────────────────────────────────── */
function generateBarcode({ width = 220, height = 48, color = '#B82C38', bars = 42 } = {}) {
  const gap      = 1.5;
  const usable   = width - gap * (bars - 1);
  let x          = 0;
  let rects      = '';

  for (let i = 0; i < bars; i++) {
    const w = Math.max(1.5, (usable / bars) * (0.6 + Math.random() * 0.9));
    rects += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="${color}"/>`;
    x += w + gap;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">${rects}</svg>`;
}

// Inject barcodes into all .card-barcode elements
document.querySelectorAll('.card-barcode').forEach((el) => {
  el.innerHTML = generateBarcode({
    color: '#B82C38',
    width: el.offsetWidth > 10 ? el.offsetWidth : 220,
    height: 36,
  });
});

/* ─────────────────────────────────────────────
   6 · MARQUEE — duplicate items for seamless loop  (design-dna §3.7)
───────────────────────────────────────────── */
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeTrack) {
  const items = marqueeTrack.innerHTML;
  marqueeTrack.innerHTML = items + items; // duplicate for seamless CSS translateX(-50%) loop
}

/* ─────────────────────────────────────────────
   7 · CLIPBOARD COPY + TOAST
───────────────────────────────────────────── */
const toast    = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer = null;

function showToast(message) {
  toastMsg.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, 2200);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / insecure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

document.querySelectorAll('.btn-copy[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    const ok   = await copyToClipboard(text);
    showToast(ok ? `Copied: ${text}` : 'Copy failed — please copy manually.');
  });
});

/* ─────────────────────────────────────────────
   8 · SMOOTH SCROLL for anchor nav links
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─────────────────────────────────────────────
   9 · HEADER scroll-shadow enhancement
───────────────────────────────────────────── */
const header = document.querySelector('header');

function updateHeader() {
  if (window.scrollY > 20) {
    header.style.background = 'rgba(100,148,220,0.92)';
    header.style.boxShadow  = '0 2px 20px rgba(0,0,0,0.10)';
  } else {
    header.style.background = '';
    header.style.boxShadow  = '';
  }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ─────────────────────────────────────────────
   10 · AVATAR fallback — show initials div if image 404s
        (handled inline with onerror on the <img> in HTML)
───────────────────────────────────────────── */
// Ensure avatar-fallback shows if img fails to load at all
const avatarImg = document.querySelector('.voucher-avatar img');
if (avatarImg) {
  if (avatarImg.complete && avatarImg.naturalWidth === 0) {
    avatarImg.style.display = 'none';
    const fallback = avatarImg.nextElementSibling;
    if (fallback) fallback.style.display = 'flex';
  }
}

/* ─────────────────────────────────────────────
   11 · RE-INJECT BARCODES on font / layout settle
───────────────────────────────────────────── */
// Fonts can shift layout — regenerate barcodes after fonts are ready
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    document.querySelectorAll('.card-barcode').forEach((el) => {
      el.innerHTML = generateBarcode({
        color: '#B82C38',
        width: el.offsetWidth > 10 ? el.offsetWidth : 220,
        height: 36,
      });
    });
  });
}
